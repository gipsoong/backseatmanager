import { describe, expect, it } from 'vitest'
import { ARCHETYPES, FORMATIONS, archetypeOf, fitFor, groupRatings, playingAttributes, runMatch } from '../engine/index.ts'
import { cardOf } from './cards.ts'
import { strikingFoot } from '../engine/ai.ts'
import { autoPick, createSeason, matchdays, playerRating, squadOf } from '../season/season.ts'
import { DRAFT_LEAGUE_SIZE, DRAFT_ROUNDS, type Draft, LEAGUES, draftLeague, draftRating, isComplete, levelOf, newDraft, offer, place, poolPlayer, poolTeam, roundOf } from './draft.ts'
import { type League, POOLS } from './pools.ts'

/** Draft greedily: each round, the best player who fits an open starting place, else a sub. */
function autoDraft(seed: number, league?: League): Draft {
  let d = newDraft(seed, '4-3-3', league)
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
  it('lists each player once per squad, and every squad can field a side with a keeper', () => {
    for (const pool of POOLS) {
      const names = pool.players.map(([name]) => name)
      expect(new Set(names).size).toBe(names.length)
      expect(pool.players.filter(([, positions]) => positions === 'GK').length).toBeGreaterThanOrEqual(2)
      expect(pool.players.length).toBeGreaterThanOrEqual(17)
      expect(pool.players.every(([, , overall]) => overall >= 60 && overall <= 95)).toBe(true)
      expect(pool.season).toMatch(/^20\d\d\/\d\d$/)
    }
    // Enough clubs for a league of different clubs, and enough seasons for twenty rounds.
    expect(new Set(POOLS.map((p) => p.club)).size).toBeGreaterThanOrEqual(DRAFT_LEAGUE_SIZE)
    expect(POOLS.length).toBeGreaterThanOrEqual(DRAFT_ROUNDS)
  })

  it('shows a known player his own card, and a forward defends like a forward', () => {
    const find = (name: string, overall: number) => {
      const pi = POOLS.findIndex((p) => p.players.some(([n, , o]) => n === name && o === overall))
      return { p: poolPlayer(pi, POOLS[pi].players.findIndex(([n, , o]) => n === name && o === overall)), year: Number(POOLS[pi].season.slice(0, 4)) }
    }
    for (const [name, overall] of [['Harry Kane', 90], ['Virgil van Dijk', 90], ['Sergio Busquets', 87], ['Manuel Neuer', 92]] as const) {
      const { p, year } = find(name, overall)
      const want = cardOf(name, year, overall, p.role === 'GK')!
      groupRatings(p.attrs, p.role).forEach((g, k) => expect(Math.abs(g.value - want[k]), `${name} ${g.key}`).toBeLessThanOrEqual(2))
    }
    // Kane shoots like a 90 striker and defends like one, but still heads it.
    const kane = find('Harry Kane', 90).p
    const card = Object.fromEntries(groupRatings(kane.attrs, kane.role).map((g) => [g.key, g.value]))
    expect(card.SHO).toBeGreaterThan(90)
    expect(card.DEF).toBeLessThan(55)
    expect(kane.attrs.heading).toBeGreaterThanOrEqual(13)
    // Ronaldo is slower at 33 than at 26.
    expect(find('Cristiano Ronaldo', 92).p.attrs.sprintSpeed).toBeGreaterThan(find('Cristiano Ronaldo', 91).p.attrs.sprintSpeed)
  })

  it('makes players of the same overall and archetype about as good as each other', () => {
    // The sum of a striker's finishing attributes, less what his overall accounts for, for every
    // 88+ poacher: no name lottery.
    const sums = POOLS.flatMap((pool, pi) =>
      pool.players.flatMap((_, i) => {
        const p = poolPlayer(pi, i)
        const level = levelOf(p.overall ?? 0)
        return p.archetype === 'poacher' && (p.overall ?? 0) >= 88 ? [p.attrs.finishing + p.attrs.composure + p.attrs.positioning - 3 * level] : []
      }),
    )
    expect(sums.length).toBeGreaterThan(3)
    expect(Math.max(...sums) - Math.min(...sums)).toBeLessThanOrEqual(6)
  })
})

describe('draft', () => {
  it('offers a different club-season each round and fills eleven and nine', () => {
    const d = autoDraft(3)
    expect(new Set(d.rounds).size).toBe(DRAFT_ROUNDS)
    expect(roundOf(d)).toBe(DRAFT_ROUNDS)
    expect(d.xi.every(Boolean) && d.bench.every(Boolean)).toBe(true)
    expect(draftRating(d)).toBeGreaterThan(70)
    // Nobody is offered again once drafted from another season.
    const names = [...d.xi, ...d.bench].map((p) => p!.name)
    expect(new Set(names).size).toBe(names.length)
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
    // Nobody turns up twice, whichever seasons his clubs are in; one season per club.
    const names = teams.flatMap(squadOf).map((p) => p.name)
    expect(new Set(names).size).toBe(names.length)
    expect(new Set(teams.slice(1).map((t) => t.name.replace(/ \d{4}\/\d\d$/, ''))).size).toBe(DRAFT_LEAGUE_SIZE - 1)
    for (const t of teams.slice(1)) expect(t.players[0].role).toBe('GK')
    const s = createSeason(9, 0, new Date(Date.UTC(2026, 5, 1)), teams)
    expect(matchdays(s)).toBe(38)
    expect(s.fixtures).toHaveLength(380)
  })

  it('gives every side a full bench of nine, a keeper among them, in every league', () => {
    for (const league of LEAGUES)
      for (const seed of [1, 2, 3, 4]) {
        const teams = draftLeague(autoDraft(seed, league), 'Backseat FC')
        const names = teams.flatMap(squadOf).map((p) => p.name)
        expect(new Set(names).size).toBe(names.length)
        const ids = teams.flatMap(squadOf).map((p) => p.id)
        expect(new Set(ids).size).toBe(ids.length)
        for (const t of teams.slice(1)) {
          expect(t.bench).toHaveLength(9)
          expect(t.bench.some((p) => p.role === 'GK')).toBe(true)
          expect(t.bench.map((p) => p.shirt)).toEqual([12, 13, 14, 15, 16, 17, 18, 19, 20])
          // Fill-ins come in no better than the side's weakest starter: the club-season stays itself.
          const weakest = Math.min(...t.players.map(playerRating))
          const own = new Set(POOLS.find((p) => `${p.club} ${p.season}` === t.name)!.players.map(([n]) => n))
          for (const p of t.bench) if (!own.has(p.name)) expect(playerRating(p)).toBeLessThanOrEqual(weakest + 2)
        }
      }
  })

  it('plays a match between two club-seasons', () => {
    const m = runMatch(poolTeam(0, new Set()), poolTeam(7, new Set()), { seed: 1 })
    expect(m.phase.kind).toBe('fullTime')
  })
})

describe('positions', () => {
  /** A player in his best season. */
  const find = (name: string) => {
    const seasons = POOLS.flatMap((pool, pi) => pool.players.flatMap(([n], i) => (n === name ? [poolPlayer(pi, i)] : [])))
    if (!seasons.length) throw new Error(name)
    return seasons.reduce((a, b) => ((b.overall ?? 0) > (a.overall ?? 0) ? b : a))
  }

  it('knows secondary positions, and plays a man worse out of position', () => {
    const haaland = find('Erling Haaland')
    const palmer = find('Cole Palmer')
    expect(fitFor(palmer, 'CM')).toBe(0.95)
    expect(fitFor(haaland, 'W')).toBeLessThanOrEqual(0.75)
    const wide = playingAttributes(haaland, 'W')
    expect(wide.dribbling).toBeLessThan(haaland.attrs.dribbling)
    expect(wide.sprintSpeed).toBe(haaland.attrs.sprintSpeed)
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
  /** A player in his best season. */
  const find = (name: string) => {
    const seasons = POOLS.flatMap((pool, pi) => pool.players.flatMap(([n], i) => (n === name ? [poolPlayer(pi, i)] : [])))
    if (!seasons.length) throw new Error(name)
    return seasons.reduce((a, b) => ((b.overall ?? 0) > (a.overall ?? 0) ? b : a))
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
