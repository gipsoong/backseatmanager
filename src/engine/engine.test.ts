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
