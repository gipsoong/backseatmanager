import { describe, expect, it } from 'vitest'
import { FORMATIONS, fitFor } from '../engine/index.ts'
import { LINE_ROLES, canAfford, REROLLS, TWISTS, isComplete, newDraft, offer, place, reroll, rerollProblem, roundOf, twistOf, type Draft } from './draft.ts'

/** Fill a draft the way the screen allows: a player who fits an open place (keepers only in goal). */
function fill(d: Draft, upTo = 20): Draft {
  const slots = FORMATIONS[d.formation]
  while (!isComplete(d) && roundOf(d) < upTo) {
    const offered = offer(d).players
    const players = offered.filter((p) => canAfford(d, p, offered)).sort((a, b) => (b.overall ?? 0) - (a.overall ?? 0))
    const was = roundOf(d)
    const move = players
      .map((p) => ({ p, i: d.xi.findIndex((q, i) => !q && fitFor(p, slots[i]) > 0) }))
      .find((x) => x.i >= 0)
    if (move) d = place(d, move.p, { xi: move.i })
    else d = place(d, players[0], { bench: d.bench.indexOf(null) })
    if (roundOf(d) === was) throw new Error(`nothing placed in round ${was + 1}`)
  }
  return d
}

describe('draft twists', () => {
  it('are off unless asked for, so scripts draft as before', () => {
    const d = newDraft(3, '4-3-3')
    expect(d.twists).toBeUndefined()
    expect(d.rerolls).toBeUndefined()
  })

  it('twist a few rounds after the first, deterministically, and give rerolls', () => {
    const a = newDraft(5, '4-3-3', 'Premier League', { twists: true })
    const b = newDraft(5, '4-3-3', 'Premier League', { twists: true })
    expect(a).toEqual(b)
    const rounds = Object.keys(a.twists!).map(Number)
    expect(rounds.length).toBeGreaterThan(0)
    expect(rounds.length).toBeLessThanOrEqual(TWISTS)
    expect(rounds).not.toContain(0)
    expect(a.rerolls).toBe(REROLLS)
    for (const i of a.spares!) expect(a.rounds).not.toContain(i)
  })

  it('offer both squads in a pair round and one line in a line round', () => {
    let pair = false
    let line = false
    for (let seed = 1; seed <= 30 && !(pair && line); seed++) {
      const d0 = newDraft(seed, '4-4-2', 'La Liga', { twists: true })
      for (const [r, t] of Object.entries(d0.twists!)) {
        const o = offer(fill(d0, Number(r)))
        if (t.kind === 'pair') {
          pair = true
          expect(o.pools).toHaveLength(2)
          expect(o.players.length).toBe(o.pools[0].players.length + o.pools[1].players.length)
        }
        if (t.kind === 'line') {
          line = true
          for (const p of o.players) expect(LINE_ROLES[t.line]).toContain(p.role)
        }
      }
    }
    expect(pair && line).toBe(true)
  })

  it('rerolls swap the round for a spare, down to none left', () => {
    let d = newDraft(8, '4-3-3', 'Serie A', { twists: true })
    const was = d.rounds[0]
    const next = d.spares![0]
    d = reroll(d)
    expect(d.rounds[0]).toBe(next)
    expect(d.rounds[0]).not.toBe(was)
    expect(d.rerolls).toBe(REROLLS - 1)
    d = reroll(d)
    expect(rerollProblem(d)).toBe('No rerolls left.')
    expect(reroll(d)).toBe(d)
    expect(twistOf(d, 0)).toBeUndefined()
  })

  it('always leave someone to place, so every draft can be finished', () => {
    for (let seed = 1; seed <= 25; seed++)
      for (const f of ['4-3-3', '3-5-2'] as const) {
        const d = fill(newDraft(seed, f, 'Bundesliga', { twists: true, budget: seed % 3 === 0 }))
        expect(d.xi.every(Boolean)).toBe(true)
        expect(d.xi[0]!.role).toBe('GK')
      }
  })
})
