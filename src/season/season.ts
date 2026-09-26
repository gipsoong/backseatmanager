/**
 * A season: a league of teams, a double round-robin of fixtures on weekly matchdays, results and
 * the table. Pure and deterministic: the same season seed gives the same league and fixtures, and
 * each fixture has its own match seed, so a match plays out the same whether it's watched or not.
 * No React, no storage: the app keeps a Season and replaces it with the updated one.
 */
import { type MatchState, type TeamDef, leagueTeams } from '../engine/index.ts'

export const LEAGUE_SIZE = 10

export interface Goal {
  team: 0 | 1
  scorer: string
  clock: string
  ownGoal: boolean
}

export interface Result {
  score: [number, number]
  goals: Goal[]
  xg: [number, number]
}

export interface Fixture {
  id: number
  matchday: number
  /** Indices into Season.teams. */
  home: number
  away: number
  /** The match's own seed. */
  seed: number
  result: Result | null
}

export interface Season {
  version: 1
  seed: number
  teams: TeamDef[]
  /** The manager's team (index into teams). */
  userTeam: number
  fixtures: Fixture[]
  /** The next matchday to be played (1-based); past the last one when the season is over. */
  matchday: number
  /** Date of the first matchday (ISO yyyy-mm-dd). */
  startDate: string
}

/**
 * Pairings for a round-robin of `n` teams (n even): n-1 rounds of n/2 [home, away] pairs, each
 * team in exactly one game per round. The circle method: team 0 stays put, the rest rotate;
 * every pairing flips home and away each round, so nobody plays more than two in a row at home
 * or away (over both halves of the season).
 */
export function roundRobin(n: number): [number, number][][] {
  const rounds: [number, number][][] = []
  const others = Array.from({ length: n - 1 }, (_, i) => i + 1)
  for (let r = 0; r < n - 1; r++) {
    const circle = [0, ...others]
    const pairs: [number, number][] = []
    for (let i = 0; i < n / 2; i++) {
      const a = circle[i]
      const b = circle[n - 1 - i]
      pairs.push(r % 2 === 1 ? [b, a] : [a, b])
    }
    rounds.push(pairs)
    others.unshift(others.pop()!)
  }
  return rounds
}

/** A new season: `LEAGUE_SIZE` teams, home and away against everyone, starting in August. */
export function createSeason(seed: number, userTeam: number, today = new Date()): Season {
  const teams = leagueTeams(seed, LEAGUE_SIZE)
  const first = roundRobin(LEAGUE_SIZE)
  // Second half of the season: the same rounds with home and away swapped.
  const rounds = [...first, ...first.map((r) => r.map(([h, a]) => [a, h] as [number, number]))]
  let id = 0
  const fixtures: Fixture[] = rounds.flatMap((pairs, r) =>
    pairs.map(([home, away]) => ({ id: id++, matchday: r + 1, home, away, seed: seed * 7919 + id * 104729, result: null })),
  )
  return { version: 1, seed, teams, userTeam, fixtures, matchday: 1, startDate: firstSaturdayOfAugust(today) }
}

function firstSaturdayOfAugust(today: Date): string {
  // This year's season if it hasn't started yet, otherwise next year's.
  const year = today.getMonth() >= 7 ? today.getFullYear() + 1 : today.getFullYear()
  const d = new Date(Date.UTC(year, 7, 1))
  while (d.getUTCDay() !== 6) d.setUTCDate(d.getUTCDate() + 1)
  return d.toISOString().slice(0, 10)
}

/** Home and away against everyone. */
export const MATCHDAYS = (LEAGUE_SIZE - 1) * 2

/** The date of a matchday: weekly on Saturdays from the start. */
export function matchdayDate(s: Season, matchday: number): Date {
  const d = new Date(`${s.startDate}T12:00:00Z`)
  d.setUTCDate(d.getUTCDate() + (matchday - 1) * 7)
  return d
}

export const fixturesOn = (s: Season, matchday: number): Fixture[] => s.fixtures.filter((f) => f.matchday === matchday)

/** The manager's fixture on a matchday. */
export const userFixture = (s: Season, matchday: number): Fixture | undefined =>
  fixturesOn(s, matchday).find((f) => f.home === s.userTeam || f.away === s.userTeam)

export const isOver = (s: Season): boolean => s.matchday > MATCHDAYS

/** What a finished match produced, for the fixture list. */
export function resultOf(m: MatchState): Result {
  const goals: Goal[] = []
  for (const e of m.events) {
    if (e.type === 'goal') goals.push({ team: e.team, scorer: m.players[e.scorerIdx].def.name, clock: e.clock, ownGoal: e.ownGoal })
  }
  return { score: [m.score[0], m.score[1]], goals, xg: [m.stats[0].xg, m.stats[1].xg] }
}

/**
 * Record a matchday's results and move on to the next. `results` maps fixture id to result and
 * must cover every fixture on the current matchday.
 */
export function completeMatchday(s: Season, results: Map<number, Result>): Season {
  const today = fixturesOn(s, s.matchday)
  for (const f of today) if (!results.has(f.id)) throw new Error(`no result for fixture ${f.id}`)
  return {
    ...s,
    fixtures: s.fixtures.map((f) => (f.matchday === s.matchday ? { ...f, result: results.get(f.id)! } : f)),
    matchday: s.matchday + 1,
  }
}

export interface TableRow {
  team: number
  played: number
  won: number
  drawn: number
  lost: number
  goalsFor: number
  goalsAgainst: number
  points: number
  /** Last five results, oldest first. */
  form: ('W' | 'D' | 'L')[]
}

/** The league table: points, then goal difference, then goals scored, then name. */
export function table(s: Season): TableRow[] {
  const rows: TableRow[] = s.teams.map((_, team) => ({ team, played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, points: 0, form: [] }))
  const played = s.fixtures.filter((f) => f.result).sort((a, b) => a.matchday - b.matchday)
  for (const f of played) {
    const [h, a] = f.result!.score
    for (const [team, gf, ga] of [
      [f.home, h, a],
      [f.away, a, h],
    ] as const) {
      const r = rows[team]
      r.played++
      r.goalsFor += gf
      r.goalsAgainst += ga
      const outcome: 'W' | 'D' | 'L' = gf > ga ? 'W' : gf === ga ? 'D' : 'L'
      if (outcome === 'W') r.won++
      else if (outcome === 'D') r.drawn++
      else r.lost++
      r.points += outcome === 'W' ? 3 : outcome === 'D' ? 1 : 0
      r.form = [...r.form, outcome].slice(-5)
    }
  }
  const gd = (r: TableRow): number => r.goalsFor - r.goalsAgainst
  return rows.sort(
    (x, y) => y.points - x.points || gd(y) - gd(x) || y.goalsFor - x.goalsFor || s.teams[x.team].name.localeCompare(s.teams[y.team].name),
  )
}

/** A squad's overall strength, 1-100: the average of its players' main attributes. */
export function squadRating(t: TeamDef): number {
  const vals = t.players.flatMap((p) => {
    const { keeping, ...outfield } = p.attrs
    return p.role === 'GK' ? [keeping, outfield.positioning, outfield.composure] : Object.values(outfield)
  })
  return Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 5)
}
