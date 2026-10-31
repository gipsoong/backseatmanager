import { describe, expect, it } from 'vitest'
import { checkMatch } from './harness.ts'
import { cloneMatch, createMatch, frameOf, orderProblem, randomTeam, runMatch, step } from './index.ts'
import type { MatchConfig, MatchState, Order, TeamDef, TimedOrder } from './types.ts'

const teams = (seed: number) => [randomTeam(seed * 2 + 1), randomTeam(seed * 2 + 2)] as const

/** Everything that makes a match what it was: events, stats, where everyone ended up. */
const print = (s: MatchState) =>
  JSON.stringify([s.events, s.stats, s.score, s.tick, s.players.map((p) => [p.pos, p.vel, p.energy, p.onPitch, p.slot]), s.ball, s.shootout])

/** Bench men of a side, by index in the match. */
const bench = (h: TeamDef, a: TeamDef, team: 0 | 1): number[] => {
  const s = createMatch(h, a, { seed: 1 })
  return s.players.filter((p) => p.team === team && !p.onPitch).map((p) => p.idx)
}

/** The orders the tests give the home side: a new shape and block early, then three changes. */
function someOrders(h: TeamDef, a: TeamDef): TimedOrder[] {
  const s = createMatch(h, a, { seed: 1 })
  const field = s.players.filter((p) => p.team === 0 && p.onPitch && p.slot.role !== 'GK')
  const subs = bench(h, a, 0).filter((i) => s.players[i].def.role !== 'GK')
  const order = (tick: number, o: Order): TimedOrder => ({ tick, order: o })
  return [
    order(4000, { kind: 'formation', team: 0, formation: h.formation === '3-5-2' ? '4-4-2' : '3-5-2' }),
    order(4000, { kind: 'block', team: 0, block: h.block === 'high' ? 'low' : 'high' }),
    order(20000, { kind: 'sub', team: 0, offIdx: field[9].idx, onIdx: subs[0] }),
    order(20000, { kind: 'sub', team: 0, offIdx: field[5].idx, onIdx: subs[1] }),
    order(26000, { kind: 'sub', team: 0, offIdx: field[2].idx, onIdx: subs[2] }),
  ]
}

describe('a copy of a match', () => {
  it.each([
    [4, { seed: 4 }, 9000],
    [5, { seed: 5 }, 30001],
    [6, { seed: 302, knockout: { carried: [0, 0] } }, 25000],
  ] as [number, MatchConfig, number][])('plays on exactly as the original (teams %i)', (seed, config, at) => {
    const [h, a] = seed === 6 ? [randomTeam(605), randomTeam(606)] : teams(seed)
    const whole = runMatch(h, a, config)
    const s = createMatch(h, a, config)
    while (s.tick < at && s.phase.kind !== 'fullTime') step(s)
    const c = cloneMatch(s)
    while (c.phase.kind !== 'fullTime') step(c)
    expect(print(c)).toEqual(print(whole))
    // and the original, stepped on after copying, is untouched by the copy.
    while (s.phase.kind !== 'fullTime') step(s)
    expect(print(s)).toEqual(print(whole))
  })
})

describe('orders', () => {
  const [h, a] = teams(9)
  const orders = someOrders(h, a)

  it('no orders (or an empty list) play exactly as before', () => {
    expect(print(runMatch(h, a, { seed: 9, orders: [] }))).toEqual(print(runMatch(h, a, { seed: 9 })))
  })

  it('the same orders at the same ticks give the same match', () => {
    const x = runMatch(h, a, { seed: 9, orders })
    const y = runMatch(h, a, { seed: 9, orders: orders.map((o) => ({ ...o })) })
    expect(print(y)).toEqual(print(x))
    const plain = runMatch(h, a, { seed: 9 })
    expect(print(x)).not.toEqual(print(plain))
    // Up to the first order the match is the one it would have been.
    const before = (s: MatchState) => s.events.filter((e) => e.tick < orders[0].tick)
    expect(before(x)).toEqual(before(plain))
  })

  it('are applied, at legal moments only, with no violations', () => {
    const { violations, state } = checkMatch(h, a, { seed: 9, orders })
    expect(violations.slice(0, 10)).toEqual([])
    const ev = state.events
    expect(ev.find((e) => e.type === 'formation')?.tick).toBe(4000)
    expect(ev.find((e) => e.type === 'block')?.tick).toBe(4000)
    const mine = ev.filter((e) => e.type === 'sub' && e.team === 0)
    expect(mine.map((e) => e.type === 'sub' && e.reason)).toEqual(['manager', 'manager', 'manager'])
    expect(mine.every((e) => e.tick >= 20000)).toBe(true)
    expect(state.teams[0].formation).toBe(orders[0].order.kind === 'formation' && orders[0].order.formation)
    // The definition the match was made from is untouched.
    expect(state.teams[0]).not.toBe(h)
    expect(h.formation).not.toBe(state.teams[0].formation)
  })

  it('over several seeds and orders, in league and knockout matches, break no rule', () => {
    for (const seed of [11, 12]) {
      const [x, y] = teams(seed)
      const s = createMatch(x, y, { seed: 1 })
      const field = (team: 0 | 1) => s.players.filter((p) => p.team === team && p.onPitch && p.slot.role !== 'GK')
      const subs = (team: 0 | 1) => bench(x, y, team).filter((i) => s.players[i].def.role !== 'GK')
      // Asking for six (one too many) and in four stoppages: the extra ones lapse or are refused.
      const os: TimedOrder[] = [
        { tick: 300, order: { kind: 'block', team: 1, block: 'low' } },
        { tick: 9000, order: { kind: 'sub', team: 1, offIdx: field(1)[0].idx, onIdx: subs(1)[0] } },
        { tick: 15000, order: { kind: 'formation', team: 1, formation: '4-3-3' } },
        { tick: 15000, order: { kind: 'formation', team: 0, formation: '3-4-3' } },
        { tick: 18000, order: { kind: 'sub', team: 1, offIdx: field(1)[1].idx, onIdx: subs(1)[1] } },
        { tick: 24000, order: { kind: 'sub', team: 1, offIdx: field(1)[2].idx, onIdx: subs(1)[2] } },
        { tick: 30000, order: { kind: 'sub', team: 1, offIdx: field(1)[3].idx, onIdx: subs(1)[3] } },
        { tick: 30000, order: { kind: 'sub', team: 1, offIdx: field(1)[4].idx, onIdx: subs(1)[4] } },
        { tick: 33000, order: { kind: 'sub', team: 1, offIdx: field(1)[5].idx, onIdx: subs(1)[5] } },
      ]
      const { violations, state } = checkMatch(x, y, { seed, orders: os, knockout: seed === 12 ? {} : undefined })
      expect(violations.slice(0, 10)).toEqual([])
      expect(state.stats[1].subs).toBeLessThanOrEqual(5)
      expect(state.subWindows[1]).toBeLessThanOrEqual(3)
    }
  })

  it('refuses what the laws do not allow', () => {
    const s = createMatch(h, a, { seed: 9 })
    const keeper = s.players.find((p) => p.team === 0 && p.slot.role === 'GK')!
    const field = s.players.filter((p) => p.team === 0 && p.onPitch && p.slot.role !== 'GK')
    const subs = bench(h, a, 0)
    const outfieldSub = subs.find((i) => s.players[i].def.role !== 'GK')!
    expect(orderProblem(s, { kind: 'sub', team: 0, offIdx: keeper.idx, onIdx: outfieldSub })).toMatch(/keeper/)
    expect(orderProblem(s, { kind: 'sub', team: 0, offIdx: subs[0], onIdx: subs[1] })).toMatch(/pitch/)
    expect(orderProblem(s, { kind: 'sub', team: 0, offIdx: field[0].idx, onIdx: field[1].idx })).toMatch(/come on/)
    s.stats[0].subs = 5
    expect(orderProblem(s, { kind: 'sub', team: 0, offIdx: field[0].idx, onIdx: outfieldSub })).toMatch(/left/)
    s.stats[0].subs = 2
    s.subWindows[0] = 3
    expect(orderProblem(s, { kind: 'sub', team: 0, offIdx: field[0].idx, onIdx: outfieldSub })).toMatch(/stoppages/)
    expect(orderProblem(s, { kind: 'formation', team: 0, formation: '4-4-2' })).toBeNull()
  })

  it('a re-slot moves nobody: positions carry straight on through a change of shape', () => {
    let before: ReturnType<typeof frameOf> | null = null
    let after: ReturnType<typeof frameOf> | null = null
    const x = runMatch(h, a, { seed: 9, orders }, (s) => {
      if (s.tick === 3999) before = frameOf(s)
      if (s.tick === 4000) after = frameOf(s)
    })
    expect(x.tick).toBeGreaterThan(4000)
    // Within a tick's running (the harness checks every tick against each man's top speed).
    before!.players.forEach((p, i) => p.onPitch && expect(Math.hypot(p.x - after!.players[i].x, p.y - after!.players[i].y)).toBeLessThan(1.1))
  })
})

describe('the harness catches orders taking effect when they may not', () => {
  const [h, a] = teams(9)
  it('flags a change of shape nobody ordered', () => {
    const { violations } = checkMatch(h, a, { seed: 9, halfLengthMinutes: 3 }, {
      tamper: (s) => {
        if (s.tick === 300) s.teams[0] = { ...s.teams[0], formation: s.teams[0].formation === '3-5-2' ? '4-4-2' : '3-5-2' }
      },
    })
    const rules = new Set(violations.map((v) => v.rule))
    expect(rules.has('order-formation')).toBe(true)
    expect(rules.has('shape-slots')).toBe(true)
  })

  it('flags a staff substitution after the manager took over', () => {
    const s = createMatch(h, a, { seed: 9 })
    const field = s.players.filter((p) => p.team === 0 && p.onPitch && p.slot.role !== 'GK')
    const sub = bench(h, a, 0).find((i) => s.players[i].def.role !== 'GK')!
    // An order the harness is told of, but which never reaches the engine.
    const told: TimedOrder[] = [{ tick: 10, order: { kind: 'sub', team: 0, offIdx: field[0].idx, onIdx: sub } }]
    const { violations } = checkMatch(h, a, { seed: 9, orders: told }, {
      tamper: (st) => {
        if (st.tick === 1) st.orders = []
      },
    })
    expect(violations.some((v) => v.rule === 'sub-staff')).toBe(true)
  })
})
