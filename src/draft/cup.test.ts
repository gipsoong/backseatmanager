import { describe, expect, it } from 'vitest'
import { FORMATIONS } from '../engine/index.ts'
import { GUEST, type Result, type Season, createSeason, isOver, matchdays } from '../season/season.ts'
import { advanceCup, completeCupMatchday, cupConfig, cupFixturesToday, cupLive, cupWinner, tieWinner, userInCup } from './cup.ts'
import { draftLeague, isComplete, newDraft, offer, place } from './draft.ts'

function draftSeason(seed: number): Season {
  let d = newDraft(seed, '4-3-3', 'La Liga')
  const slots = FORMATIONS['4-3-3']
  while (!isComplete(d)) {
    const players = offer(d).players.sort((a, b) => (b.overall ?? 0) - (a.overall ?? 0))
    const starter = players.find((p) => d.xi.some((q, i) => !q && slots[i].role === p.role))
    if (starter) d = place(d, starter, { xi: d.xi.findIndex((q, i) => !q && slots[i].role === starter.role) })
    else if (d.bench.includes(null)) d = place(d, players[0], { bench: d.bench.indexOf(null) })
    else d = place(d, players[0], { xi: d.xi.indexOf(null) })
  }
  return { ...createSeason(seed, 0, new Date(Date.UTC(2026, 5, 1)), draftLeague(d, 'Test')), mode: 'draft', league: 'La Liga' }
}

const result = (score: [number, number], pens?: [number, number]): Result => ({ score, goals: [], xg: [1, 1], appearances: [], injuries: [], ...(pens ? { aet: true, pens } : {}) })

/** The league played out with `winner` top: everyone else draws. */
function finishLeague(s: Season, winner: number): Season {
  const fixtures = s.fixtures.map((f) => ({ ...f, result: result(f.home === winner ? [2, 0] : f.away === winner ? [0, 2] : [1, 1]) }))
  return advanceCup({ ...s, fixtures, matchday: matchdays(s) + 1 })
}

describe('the European cup', () => {
  const base = draftSeason(5)

  it('starts after the league for a side in the top four: its top four and twelve guests from the other leagues', () => {
    const s = finishLeague(base, 0)
    expect(isOver(s)).toBe(true)
    const cup = s.cup!
    expect(cup.entrants).toHaveLength(16)
    expect(new Set(cup.entrants).size).toBe(16)
    expect(cup.entrants.filter((e) => e < GUEST)).toHaveLength(4)
    expect(cup.guests).toHaveLength(12)
    expect(new Set(cup.guests.map((g) => g.name)).size).toBe(12)
    // Nobody plays for two sides.
    const names = [...s.teams, ...cup.guests].flatMap((t) => [...t.players, ...t.bench].map((p) => p.name))
    expect(new Set(names).size).toBe(names.length)
    expect(cupFixturesToday(s)).toHaveLength(8)
    expect(cupConfig(s, cupFixturesToday(s)[0])).toBeUndefined()
  })

  it('leaves the cup out for a side outside the top four', () => {
    expect(finishLeague(base, 5).cup).toBeUndefined()
  })

  it('plays two legs a round, carries the first leg into the second, and has a winner after the final', () => {
    let s = finishLeague(base, 0)
    let days = 0
    while (cupLive(s)) {
      const today = cupFixturesToday(s)
      expect(today.length).toBeGreaterThan(0)
      const results = new Map<number, Result>()
      for (const f of today) {
        if (f.leg === 2) expect(cupConfig(s, f)).toEqual({ carried: [1, 0] })
        // First legs 0-1; second legs 1-0: level on aggregate, so the home side wins on penalties.
        results.set(f.id, f.leg === 1 ? result([0, 1]) : result([1, 0], [5, 4]))
      }
      s = completeCupMatchday(s, results)
      days++
    }
    expect(days).toBe(7)
    const cup = s.cup!
    expect(cupWinner(cup)).not.toBeNull()
    for (const f of cup.fixtures.filter((g) => g.leg === 2)) expect(tieWinner(cup, f.round, f.tie)).toBe(f.home)
    expect(cup.fixtures.filter((f) => f.round === 3)).toHaveLength(1)
    expect(typeof userInCup(s)).toBe('boolean')
  })
})
