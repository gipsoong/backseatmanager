/** Draft variety: budget drafts, themed drafts, daily drafts, and saves that carry them. */
import { describe, expect, it } from 'vitest'
import { FORMATIONS, type PlayerDef, Rng } from '../engine/index.ts'
import { GUEST, type Result, type Season, createSeason, matchdays } from '../season/season.ts'
import { upgradeSave } from '../season/store.ts'
import { advanceCup } from './cup.ts'
import {
  DRAFT_LEAGUE_SIZE,
  DRAFT_ROUNDS,
  type Draft,
  type DraftOptions,
  LEAGUES,
  MIN_PRICE,
  NO_STARS_CAP,
  THEMES,
  TOP_CLUBS,
  budgetFor,
  canAfford,
  dailySeed,
  draftLeague,
  isComplete,
  leagueLevel,
  newDraft,
  offer,
  place,
  priceIn,
  priceOf,
  spendable,
  themePools,
} from './draft.ts'
import { POOLS, type League } from './pools.ts'

const slots = FORMATIONS['4-3-3']

/**
 * Draft by a rule: `choose` picks from the players the round lets him afford; he goes in an open
 * starting place of his position, else the bench, else anywhere open.
 */
function draftWith(d: Draft, choose: (ps: PlayerDef[], d: Draft) => PlayerDef): Draft {
  while (!isComplete(d)) {
    const { players } = offer(d)
    const affordable = players.filter((p) => canAfford(d, p, players))
    expect(affordable.length, `round ${DRAFT_ROUNDS - d.xi.concat(d.bench).filter((q) => !q).length + 1}`).toBeGreaterThan(0)
    const p = choose(affordable, d)
    const xi = d.xi.findIndex((q, i) => !q && slots[i].role === p.role)
    const at = xi >= 0 ? { xi } : d.bench.includes(null) ? { bench: d.bench.indexOf(null) } : { xi: d.xi.indexOf(null) }
    const before = d.money
    d = place(d, p, at)
    if (before !== undefined) expect(d.money).toBeGreaterThanOrEqual(0)
  }
  return d
}

const dearest = (ps: PlayerDef[]): PlayerDef => ps.reduce((a, b) => ((b.overall ?? 0) > (a.overall ?? 0) ? b : a))
const randomly = (rng: Rng) => (ps: PlayerDef[]): PlayerDef => ps[rng.int(0, ps.length - 1)]

const KINDS: { league?: League; opts: DraftOptions }[] = [...LEAGUES.map((league) => ({ league, opts: {} })), ...THEMES.map((t) => ({ opts: { theme: t.id } }))]

describe('budget draft', () => {
  it('prices players by overall: £1m at the bottom, doubling every four points', () => {
    expect(priceOf(65)).toBe(MIN_PRICE)
    expect(priceOf(72)).toBe(1)
    expect(priceOf(80)).toBe(4)
    expect(priceOf(84)).toBe(8)
    expect(priceOf(88)).toBe(16)
    expect(priceOf(92)).toBe(32)
    for (let o = 60; o < 95; o++) expect(priceOf(o + 1)).toBeGreaterThanOrEqual(priceOf(o))
  })

  it('gives each league a budget by its level: a stronger league, more money', () => {
    const pl = budgetFor({ league: 'Premier League' })
    const l1 = budgetFor({ league: 'Ligue 1' })
    expect(leagueLevel({ league: 'Premier League' })).toBeGreaterThan(leagueLevel({ league: 'Ligue 1' }))
    expect(pl).toBeGreaterThan(l1)
    for (const k of KINDS) {
      const b = budgetFor({ theme: k.opts.theme, league: k.league })
      expect(b % 5).toBe(0)
      expect(b).toBeGreaterThanOrEqual(DRAFT_ROUNDS * MIN_PRICE + 10)
      expect(newDraft(1, '4-3-3', k.league, { ...k.opts, budget: true }).money).toBe(b)
    }
  })

  it('always leaves a full squad affordable, however he spends', () => {
    for (const k of KINDS)
      for (const seed of [1, 2]) {
        // Spending all he can each round: the reserve still fills every place.
        const greedy = draftWith(newDraft(seed, '4-3-3', k.league, { ...k.opts, budget: true }), dearest)
        expect(greedy.money!).toBeGreaterThanOrEqual(0)
        const random = draftWith(newDraft(seed, '4-3-3', k.league, { ...k.opts, budget: true }), randomly(new Rng(seed)))
        expect(random.money!).toBeGreaterThanOrEqual(0)
      }
  })

  it('pays for a pick and refuses one he cannot afford', () => {
    let d = newDraft(3, '4-3-3', 'Premier League', { budget: true })
    const { players } = offer(d)
    const p = players.find((q) => priceIn(d, q) <= spendable(d))!
    const after = place(d, p, { bench: 0 })
    expect(after.money).toBe(d.money! - priceIn(d, p))
    d = { ...d, money: DRAFT_ROUNDS * MIN_PRICE }
    const dear = players.find((q) => priceOf(q.overall ?? 0) > MIN_PRICE)!
    expect(canAfford(d, dear)).toBe(false)
    expect(place(d, dear, { bench: 0 })).toBe(d)
  })

  it('leaves a classic draft as it was: no money, and the same offers', () => {
    const d = newDraft(7, '4-3-3', 'La Liga')
    expect(Object.keys(d).sort()).toEqual(['bench', 'formation', 'league', 'rounds', 'seed', 'xi'])
    expect(newDraft(7, '4-3-3', 'La Liga', { budget: true }).rounds).toEqual(d.rounds)
    expect(canAfford(d, offer(d).players[0])).toBe(true)
  })
})

describe('themed drafts', () => {
  it('have enough club-seasons for twenty rounds and a league of different clubs', () => {
    for (const t of THEMES) {
      const pools = themePools(t)
      expect(pools.length, t.id).toBeGreaterThanOrEqual(DRAFT_ROUNDS + DRAFT_LEAGUE_SIZE)
      expect(new Set(pools.map((i) => POOLS[i].club)).size, t.id).toBeGreaterThanOrEqual(DRAFT_LEAGUE_SIZE - 1 + 12)
      // Enough of every position across twenty rounds' offers to fill an eleven and a bench.
      const roles: Record<string, number> = {}
      for (const i of pools) for (const [, pos, o] of POOLS[i].players) if (!t.player || t.player(o)) roles[pos.split('/')[0]] = (roles[pos.split('/')[0]] ?? 0) + 1
      for (const role of ['GK', 'CB', 'FB', 'DM', 'CM', 'W', 'ST']) expect(roles[role] / pools.length, `${t.id} ${role}`).toBeGreaterThanOrEqual(1)
    }
  })

  it('offer only club-seasons and players of the theme, and the league follows it', () => {
    for (const t of THEMES) {
      const d = draftWith(newDraft(11, '4-3-3', 'Premier League', { theme: t.id }), dearest)
      expect(d.theme).toBe(t.id)
      expect(d.league).toBeUndefined()
      expect(new Set(d.rounds).size).toBe(DRAFT_ROUNDS)
      for (const i of d.rounds) expect(t.pool(POOLS[i]), POOLS[i].club).toBe(true)
      const teams = draftLeague(d, 'Test')
      expect(teams).toHaveLength(DRAFT_LEAGUE_SIZE)
      const clubs = teams.slice(1).map((team) => POOLS.find((p) => `${p.club} ${p.season}` === team.name)!)
      expect(new Set(clubs.map((p) => p.club)).size).toBe(DRAFT_LEAGUE_SIZE - 1)
      for (const p of clubs) expect(t.pool(p), p.club).toBe(true)
      for (const team of teams) {
        expect(team.players).toHaveLength(11)
        expect(team.players[0].role).toBe('GK')
        // Later sides lose men to earlier ones (a classic league is the same, or thinner).
        expect(team.bench.length).toBeGreaterThanOrEqual(3)
      }
      const everyone = teams.flatMap((team) => [...team.players, ...team.bench])
      expect(new Set(everyone.map((p) => p.name)).size).toBe(everyone.length)
      if (t.player) for (const p of everyone) expect(p.overall!).toBeLessThanOrEqual(NO_STARS_CAP)
      if (t.id === 'underdogs') for (const p of clubs) expect(TOP_CLUBS.has(p.club)).toBe(false)
    }
  })

  it('plays a cup with guests of the theme, from clubs not in the league', () => {
    const d = draftWith(newDraft(4, '4-3-3', 'Premier League', { theme: 'era-2010' }), dearest)
    const s0: Season = { ...createSeason(d.seed, 0, new Date(Date.UTC(2026, 5, 1)), draftLeague(d, 'Test')), mode: 'draft', draftStyle: { theme: 'era-2010' } }
    const result = (score: [number, number]): Result => ({ score, goals: [], xg: [1, 1], appearances: [], injuries: [] })
    const s = advanceCup({ ...s0, fixtures: s0.fixtures.map((f) => ({ ...f, result: result(f.home === 0 ? [2, 0] : f.away === 0 ? [0, 2] : [1, 1]) })), matchday: matchdays(s0) + 1 })
    const cup = s.cup!
    expect(cup.entrants).toHaveLength(16)
    expect(cup.entrants.filter((e) => e >= GUEST)).toHaveLength(12)
    const leagueClubs = new Set(s.teams.slice(1).map((t) => t.name.replace(/ \d{4}\/\d\d$/, '')))
    for (const g of cup.guests) {
      const club = g.name.replace(/ \d{4}\/\d\d$/, '')
      expect(leagueClubs.has(club), club).toBe(false)
      expect(Number(g.name.slice(-7, -3))).toBeLessThanOrEqual(2014)
    }
    const names = [...s.teams, ...cup.guests].flatMap((t) => [...t.players, ...t.bench].map((p) => p.name))
    expect(new Set(names).size).toBe(names.length)
  })
})

describe('daily draft', () => {
  it('is seeded by the date alone: the same offers for everyone that day', () => {
    const a = newDraft(123, '4-3-3', 'Premier League', { daily: '2026-10-30' })
    const b = newDraft(987, '4-4-2', 'Premier League', { daily: '2026-10-30' })
    expect(a.seed).toBe(dailySeed('2026-10-30'))
    expect(a.rounds).toEqual(b.rounds)
    expect(offer(a).players.map((p) => p.id)).toEqual(offer(b).players.map((p) => p.id))
    expect(newDraft(1, '4-3-3', 'Premier League', { daily: '2026-10-31' }).rounds).not.toEqual(a.rounds)
    // With a theme and a budget too.
    const c = newDraft(5, '4-3-3', 'Premier League', { daily: '2026-10-30', theme: 'underdogs', budget: true })
    const e = newDraft(6, '3-5-2', 'La Liga', { daily: '2026-10-30', theme: 'underdogs', budget: true })
    expect(c.rounds).toEqual(e.rounds)
    expect(c.money).toBe(e.money)
    expect(c.daily).toBe('2026-10-30')
  })
})

describe('saves', () => {
  const base = (): Season => {
    const d = draftWith(newDraft(2, '4-3-3', 'Premier League', { theme: 'underdogs', budget: true, daily: '2026-10-30' }), dearest)
    return { ...createSeason(d.seed, 0, new Date(Date.UTC(2026, 5, 1)), draftLeague(d, 'Test')), mode: 'draft', draftStyle: { theme: d.theme, budget: budgetFor(d), daily: d.daily } }
  }

  it('keep how the side was drafted through a round trip', () => {
    const s = base()
    const back = upgradeSave(JSON.parse(JSON.stringify(s)) as Season)
    expect(back.draftStyle).toEqual(s.draftStyle)
    expect(back).toEqual(upgradeSave(s))
    expect(back.version).toBe(5)
  })

  it('load an old classic draft save unchanged', () => {
    const s = base()
    const { draftStyle: _, ...old } = s
    const back = upgradeSave(JSON.parse(JSON.stringify({ ...old, league: 'La Liga' })) as Season)
    expect(back.draftStyle).toBeUndefined()
    expect(back.league).toBe('La Liga')
    expect(back).toEqual(upgradeSave({ ...old, league: 'La Liga' } as Season))
  })
})
