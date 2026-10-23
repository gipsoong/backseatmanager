import { describe, expect, it } from 'vitest'
import { checkMatch } from './harness.ts'
import { createMatch, frameOf, randomTeam, runMatch, step } from './index.ts'
import type { MatchState } from './types.ts'

const teams = (seed: number) => [randomTeam(seed * 2 + 1), randomTeam(seed * 2 + 2)] as const

describe('determinism', () => {
  it('same seed gives an identical match', () => {
    const [h, a] = teams(7)
    const x = runMatch(h, a, { seed: 7 })
    const y = runMatch(h, a, { seed: 7 })
    expect(y.events).toEqual(x.events)
    expect(frameOf(y)).toEqual(frameOf(x))
  })

  it('different seeds give different matches', () => {
    const [h, a] = teams(7)
    const x = runMatch(h, a, { seed: 7, halfLengthMinutes: 5 })
    const y = runMatch(h, a, { seed: 8, halfLengthMinutes: 5 })
    expect(y.events).not.toEqual(x.events)
  })

  it('stepping manually matches runMatch', () => {
    const [h, a] = teams(3)
    const s = createMatch(h, a, { seed: 3, halfLengthMinutes: 3 })
    while (s.phase.kind !== 'fullTime') step(s)
    expect(s.events).toEqual(runMatch(h, a, { seed: 3, halfLengthMinutes: 3 }).events)
  })
})

describe('position/outcome consistency (full matches)', () => {
  const SEEDS = [1, 2, 3, 4, 5, 6]
  const results = SEEDS.map((seed) => {
    const [h, a] = teams(seed)
    return checkMatch(h, a, { seed })
  })

  it.each(SEEDS.map((seed, i) => [seed, i]))('seed %i has no invariant violations', (_seed, i) => {
    const { violations, forcedRestarts } = results[i]
    expect(violations.slice(0, 10)).toEqual([])
    expect(forcedRestarts).toBe(0)
  })

  it('produces football-shaped numbers', () => {
    // Loose bounds: this catches a broken engine, not a badly calibrated one.
    const n = results.length * 2
    const total = (f: (s: MatchState, t: 0 | 1) => number) =>
      results.reduce((sum, r) => sum + f(r.state, 0) + f(r.state, 1), 0) / n
    const goals = total((s, t) => s.score[t])
    const shots = total((s, t) => s.stats[t].shots)
    const passes = total((s, t) => s.stats[t].passes)
    const completion = total((s, t) => s.stats[t].passesCompleted) / passes
    expect(goals).toBeGreaterThan(0.3)
    expect(goals).toBeLessThan(5)
    expect(shots).toBeGreaterThan(3)
    expect(shots).toBeLessThan(35)
    expect(passes).toBeGreaterThan(200)
    expect(completion).toBeGreaterThan(0.6)
  })
})

describe('the harness catches inconsistencies', () => {
  it('flags a teleporting player', () => {
    const [h, a] = teams(1)
    const { violations } = checkMatch(h, a, { seed: 1, halfLengthMinutes: 2 }, {
      tamper: (s) => {
        if (s.tick === 300) s.players[5].pos = { x: s.players[5].pos.x + 10, y: s.players[5].pos.y }
      },
    })
    expect(violations.some((v) => v.rule === 'speed' && v.tick === 300)).toBe(true)
  })

  it("flags a ball in the air at a player's feet", () => {
    const [h, a] = teams(1)
    let done = false
    const { violations } = checkMatch(h, a, { seed: 1, halfLengthMinutes: 2 }, {
      tamper: (s) => {
        if (!done && s.ball.ownerIdx !== null) {
          s.ball.z = 3
          done = true
        }
      },
    })
    expect(violations.some((v) => v.rule === 'ball-owner')).toBe(true)
  })

  it('flags an intercepted pass logged as the wrong kind of ball won', () => {
    const [h, a] = teams(1)
    let done = false
    const { violations } = checkMatch(h, a, { seed: 1, halfLengthMinutes: 10 }, {
      tamper: (s) => {
        const e = s.events.at(-1)
        if (!done && e?.type === 'possession' && e.tick === s.tick && e.won === 'cut') {
          e.won = 'loose'
          done = true
        }
      },
    })
    expect(done).toBe(true)
    expect(violations.some((v) => v.rule === 'pass-won')).toBe(true)
  })

  it('flags a run in behind logged as an overlap', () => {
    const [h, a] = teams(1)
    let done = false
    const { violations } = checkMatch(h, a, { seed: 1, halfLengthMinutes: 4 }, {
      tamper: (s) => {
        const e = s.events.at(-1)
        if (!done && e?.type === 'run' && e.tick === s.tick && !e.kind && s.players[e.idx].slot.role === 'ST') {
          e.kind = 'overlap'
          done = true
        }
      },
    })
    expect(done).toBe(true)
    expect(violations.some((v) => v.rule === 'overlap')).toBe(true)
  })

  it('flags a man standing on the ball', () => {
    const [h, a] = teams(1)
    let pinned: { idx: number; at: { x: number; y: number } } | null = null
    const { violations } = checkMatch(h, a, { seed: 1, halfLengthMinutes: 4 }, {
      tamper: (s) => {
        const o = s.ball.ownerIdx
        if (!pinned && o !== null && s.phase.kind === 'play' && s.players[o].slot.role !== 'GK') pinned = { idx: o, at: { ...s.players[o].pos } }
        // Keep him on the ball where he is, as if he'd chosen to hold it for ever.
        if (pinned && s.tick < 2000 && s.phase.kind === 'play') {
          s.ball.ownerIdx = pinned.idx
          s.players[pinned.idx].pos = { ...pinned.at }
          s.players[pinned.idx].vel = { x: 0, y: 0 }
          s.decisionAt = s.tick + 5
        }
      },
    })
    expect(violations.some((v) => v.rule === 'hold-on')).toBe(true)
  })

  it('flags two men passing it back and forth', () => {
    const [h, a] = teams(1)
    // Rewrite a run of the match's passes as a loop between two teammates.
    let pair: [number, number] | null = null
    let n = 0
    const { violations } = checkMatch(h, a, { seed: 1, halfLengthMinutes: 10 }, {
      tamper: (s) => {
        const e = s.events.at(-1)
        if (e?.type !== 'pass' || e.tick !== s.tick || n >= 8) return
        const mate = s.players.find((q) => q.team === s.players[e.byIdx].team && q.idx !== e.byIdx && q.onPitch && q.slot.role !== 'GK')!
        pair ??= [e.byIdx, mate.idx]
        const [x, y] = n % 2 === 0 ? pair : [pair[1], pair[0]]
        e.byIdx = x
        e.toIdx = y
        n++
      },
    })
    expect(n).toBe(8)
    expect(violations.some((v) => v.rule === 'ping-pong')).toBe(true)
  })

  it('flags a ball that leaves the pitch without going out of play', () => {
    const [h, a] = teams(1)
    const { violations } = checkMatch(h, a, { seed: 1, halfLengthMinutes: 2 }, {
      tamper: (s) => {
        if (s.tick === 400) s.ball.pos = { x: -5, y: 30 }
      },
    })
    expect(violations.some((v) => v.rule === 'ball-bounds')).toBe(true)
  })
})

describe('knockout ties', () => {
  // Short halves: plenty of ties level after extra time, so the shootout gets played.
  const runs = [1, 2, 3, 4, 5, 6, 7, 8].map((seed) => {
    const [h, a] = teams(seed)
    return checkMatch(h, a, { seed, halfLengthMinutes: 4, knockout: { carried: seed % 3 === 0 ? [1, 0] : [0, 0] } })
  })

  it('go to extra time and penalties only when level, and end with a winner, with no violations', () => {
    for (const r of runs) {
      expect(r.violations).toEqual([])
      const s = r.state
      const pens = s.shootout ? s.shootout.kicks.filter((k) => k.scored && k.team === 0).length - s.shootout.kicks.filter((k) => k.scored && k.team === 1).length : 0
      const agg = s.score[0] + s.carried![0] - s.score[1] - s.carried![1]
      expect(agg !== 0 || pens !== 0).toBe(true)
    }
    expect(runs.some((r) => r.state.shootout)).toBe(true)
  })

  it('leave the match stats out of the shootout', () => {
    const r = runs.find((x) => x.state.shootout)!
    const kicks = r.state.events.filter((e) => e.type === 'shot' && r.state.events.findIndex((f) => f.type === 'shootout') < r.state.events.indexOf(e))
    expect(kicks.length).toBeGreaterThan(0)
    const before = r.state.events.filter((e) => e.type === 'shot' && !kicks.includes(e)).length
    expect(r.state.stats[0].shots + r.state.stats[1].shots).toBe(before)
  })
})
