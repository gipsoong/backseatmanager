import { describe, expect, it } from 'vitest'
import { ARCHETYPES, FORMATIONS, archetypeOf, fitFor, playingAttributes, runMatch } from '../engine/index.ts'
import { strikingFoot } from '../engine/ai.ts'
import { autoPick, createSeason, matchdays, squadOf } from '../season/season.ts'
import { DRAFT_LEAGUE_SIZE, DRAFT_ROUNDS, type Draft, draftLeague, draftRating, isComplete, newDraft, offer, place, poolPlayer, poolTeam, roundOf } from './draft.ts'
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
      expect(pool.players.filter(([, positions]) => positions === 'GK').length).toBeGreaterThanOrEqual(2)
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

describe('positions', () => {
  const find = (name: string) => {
    for (const [pi, pool] of POOLS.entries()) {
      const i = pool.players.findIndex(([n]) => n === name)
      if (i >= 0) return poolPlayer(pi, i)
    }
    throw new Error(name)
  }

  it('knows secondary positions, and plays a man worse out of position', () => {
    const haaland = find('Erling Haaland')
    const palmer = find('Cole Palmer')
    expect(fitFor(palmer, 'CM')).toBe(0.95)
    expect(fitFor(haaland, 'W')).toBeLessThanOrEqual(0.75)
    const wide = playingAttributes(haaland, 'W')
    expect(wide.dribbling).toBeLessThan(haaland.attrs.dribbling)
    expect(wide.pace).toBe(haaland.attrs.pace)
  })

  it('does not shoehorn strikers onto the wings ahead of wingers', () => {
    const d = autoDraftWith(['Erling Haaland', 'Harry Kane', 'Cole Palmer', 'Eden Hazard'])
    const teams = draftLeague(d, 'Test')
    const s = createSeason(3, 0, new Date(Date.UTC(2026, 5, 1)), teams)
    const xi = autoPick(s, 0).map((id) => squadOf(teams[0]).find((p) => p.id === id)!.name)
    const slots = FORMATIONS['4-3-3']
    const wingers = xi.filter((_, i) => slots[i].role === 'W')
    expect(wingers.sort()).toEqual(['Cole Palmer', 'Eden Hazard'])
  })

  /** A 4-3-3 draft with the named players on the bench and the rest filled greedily. */
  function autoDraftWith(names: string[]): Draft {
    let d = autoDraft(11)
    const bench = names.map(find)
    d = { ...d, bench: d.bench.map((p, i) => bench[i] ?? p) }
    // Strip the drafted attackers so the named ones are the only candidates up front.
    const slots = FORMATIONS['4-3-3']
    const filler = find('Joe Gomez')
    d = { ...d, xi: d.xi.map((p, i) => (slots[i].role === 'W' || slots[i].role === 'ST' ? { ...filler, id: `filler-${i}`, role: 'CB' as const } : p)) }
    return d
  }
})

describe('feet and archetypes', () => {
  const find = (name: string) => {
    for (const [pi, pool] of POOLS.entries()) {
      const i = pool.players.findIndex(([n]) => n === name)
      if (i >= 0) return poolPlayer(pi, i)
    }
    throw new Error(name)
  }
  // strikingFoot reads only the player's def, so a bare state is enough.
  const state = (name: string) => ({ def: find(name) }) as Parameters<typeof strikingFoot>[0]
  const rightSide = { x: 90, y: 50 }
  const leftSide = { x: 90, y: 18 }

  it('strikes with the inside foot from wide, and a one-footed player suffers on the wrong side', () => {
    expect(strikingFoot(state('Mohamed Salah'), rightSide, 'shot')).toEqual({ foot: 'left', q: 1 })
    expect(strikingFoot(state('Riyad Mahrez'), leftSide, 'shot').q).toBeLessThan(1)
    expect(strikingFoot(state('Son Heung-min'), rightSide, 'shot').q).toBe(1)
    expect(strikingFoot(state('Eden Hazard'), rightSide, 'shot').q).toBeLessThan(1)
    expect(strikingFoot(state('Eden Hazard'), leftSide, 'shot').q).toBe(1)
    // From the middle it's always his good foot.
    expect(strikingFoot(state('Riyad Mahrez'), { x: 90, y: 34 }, 'shot').q).toBe(1)
  })

  it('gives every player an archetype for his position, his own where known', () => {
    expect(archetypeOf(find('Erling Haaland'))).toBe('poacher')
    expect(archetypeOf(find('Trent Alexander-Arnold'))).toBe('inverted')
    // Out of position he plays it the way his attributes suggest.
    expect(ARCHETYPES.W).toContain(archetypeOf(find('Erling Haaland'), 'W'))
    for (const [pi, pool] of POOLS.entries()) {
      pool.players.forEach((_, i) => {
        const p = poolPlayer(pi, i)
        expect(ARCHETYPES[p.role]).toContain(archetypeOf(p))
      })
    }
  })
})
