import { describe, expect, it } from 'vitest'
import { FORMATIONS, runMatch } from '../engine/index.ts'
import { createSeason, matchdays, squadOf } from '../season/season.ts'
import { DRAFT_LEAGUE_SIZE, DRAFT_ROUNDS, type Draft, draftLeague, draftRating, isComplete, newDraft, offer, place, poolTeam, roundOf } from './draft.ts'
import { POOLS } from './pools.ts'

/** Draft greedily: each round, the best player who fits an open starting place, else a sub. */
function autoDraft(seed: number): Draft {
  let d = newDraft(seed, '4-3-3')
  const slots = FORMATIONS['4-3-3']
  while (!isComplete(d)) {
    const players = offer(d).players.sort((a, b) => (b.overall ?? 0) - (a.overall ?? 0))
    const starter = players.find((p) => d.xi.some((q, i) => !q && slots[i].role === p.role))
    if (starter) d = place(d, starter, { xi: d.xi.findIndex((q, i) => !q && slots[i].role === starter.role) })
    else if (d.bench.includes(null)) d = place(d, players[0], { bench: d.bench.indexOf(null) })
    else {
      // Out of position: an outfielder anywhere but in goal.
      const slot = d.xi.findIndex((q, i) => !q && slots[i].role !== 'GK')
      const keeper = players.find((p) => p.role === 'GK')
      d = slot >= 0 ? place(d, players.find((p) => p.role !== 'GK')!, { xi: slot }) : place(d, keeper ?? players[0], { xi: 0 })
    }
  }
  return d
}

describe('draft pools', () => {
  it('lists every player once, and every pool can field a side with a keeper', () => {
    const names = POOLS.flatMap((p) => p.players.map(([name]) => name))
    expect(new Set(names).size).toBe(names.length)
    for (const pool of POOLS) {
      expect(pool.players.filter(([, role]) => role === 'GK').length).toBeGreaterThanOrEqual(2)
      expect(pool.players.length).toBeGreaterThanOrEqual(16)
    }
    expect(POOLS.length).toBeGreaterThanOrEqual(DRAFT_LEAGUE_SIZE)
  })
})

describe('draft', () => {
  it('offers a different club-decade each round and fills eleven and five', () => {
    const d = autoDraft(3)
    expect(new Set(d.rounds).size).toBe(DRAFT_ROUNDS)
    expect(roundOf(d)).toBe(DRAFT_ROUNDS)
    expect(d.xi.every(Boolean) && d.bench.every(Boolean)).toBe(true)
    expect(draftRating(d)).toBeGreaterThan(70)
    // A filled place stays filled.
    expect(place(d, offer(newDraft(4, '4-3-3')).players[0], { xi: 0 })).toBe(d)
  })

  it('builds a 20-team league without the drafted players in it, for a 38-match season', () => {
    const d = autoDraft(5)
    const teams = draftLeague(d, 'Backseat FC')
    expect(teams).toHaveLength(DRAFT_LEAGUE_SIZE)
    expect(new Set(teams.map((t) => t.shortName)).size).toBe(DRAFT_LEAGUE_SIZE)
    const ids = teams.flatMap(squadOf).map((p) => p.id)
    expect(new Set(ids).size).toBe(ids.length)
    for (const t of teams.slice(1)) expect(t.players[0].role).toBe('GK')
    const s = createSeason(9, 0, new Date(Date.UTC(2026, 5, 1)), teams)
    expect(matchdays(s)).toBe(38)
    expect(s.fixtures).toHaveLength(380)
  })

  it('plays a match between two club-decades', () => {
    const m = runMatch(poolTeam(0, new Set()), poolTeam(7, new Set()), { seed: 1 })
    expect(m.phase.kind).toBe('fullTime')
  })
})
