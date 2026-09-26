/**
 * A season: a league of teams, a double round-robin of fixtures on weekly matchdays, results and
 * the table. Pure and deterministic: the same season seed gives the same league and fixtures, and
 * each fixture has its own match seed, so a match plays out the same whether it's watched or not.
 * No React, no storage: the app keeps a Season and replaces it with the updated one.
 */
import { FORMATIONS, type MatchState, type PlayerDef, type TeamDef, ability, fitFor, leagueTeams } from '../engine/index.ts'
import { playerLines } from '../viewer/players.ts'

export const LEAGUE_SIZE = 10

export interface Goal {
  team: 0 | 1
  scorer: string
  clock: string
  ownGoal: boolean
}

/** One player's part in a match. */
export interface Appearance {
  id: string
  minutes: number
  rating: number
  goals: number
  assists: number
  /** Energy left when he came off or at full time (0-1). */
  energy: number
}

export interface Result {
  score: [number, number]
  goals: Goal[]
  xg: [number, number]
  appearances: Appearance[]
  /** Hurt in the match, and for how many matchdays after it. */
  injuries: { id: string; weeks: number }[]
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

/** A player's state between matches. */
export interface Condition {
  /** Match fitness, 0-1: how fresh he'll start. */
  fitness: number
  /** Unavailable until this matchday (exclusive). */
  injuredUntil: number
}

/** A player's season so far. */
export interface SeasonStats {
  apps: number
  goals: number
  assists: number
  /** Sum of match ratings, for the average. */
  ratings: number
}

export interface Season {
  version: 2
  seed: number
  teams: TeamDef[]
  /** The manager's team (index into teams). */
  userTeam: number
  fixtures: Fixture[]
  /** The next matchday to be played (1-based); past the last one when the season is over. */
  matchday: number
  /** Date of the first matchday (ISO yyyy-mm-dd). */
  startDate: string
  /** By player id. Every squad player has an entry. */
  condition: Record<string, Condition>
  stats: Record<string, SeasonStats>
  /** The manager's chosen eleven (ids, in formation slot order), or null to let the staff pick. */
  lineup: string[] | null
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
  const condition: Record<string, Condition> = {}
  const stats: Record<string, SeasonStats> = {}
  for (const p of teams.flatMap(squadOf)) {
    condition[p.id] = { fitness: 1, injuredUntil: 0 }
    stats[p.id] = { apps: 0, goals: 0, assists: 0, ratings: 0 }
  }
  return { version: 2, seed, teams, userTeam, fixtures, matchday: 1, startDate: firstSaturdayOfAugust(today), condition, stats, lineup: null }
}

// ---------------------------------------------------------------------------
// Squads and selection

/** Everyone at the club: the usual eleven and the rest of the squad. */
export const squadOf = (t: TeamDef): PlayerDef[] => [...t.players, ...t.bench]

export const isAvailable = (s: Season, p: PlayerDef): boolean => s.condition[p.id].injuredUntil <= s.matchday

/** How much a player's freshness counts when picking: a tired star can still get the nod. */
const selectionScore = (s: Season, p: PlayerDef, role: PlayerDef['role']): number =>
  fitFor(p, role) * ability(p) * (0.55 + 0.45 * s.condition[p.id].fitness)

/** The staff's eleven: for each position in the formation, the best available fit, fitness counted. */
export function autoPick(s: Season, club: number): string[] {
  const t = s.teams[club]
  const pool = squadOf(t).filter((p) => isAvailable(s, p))
  const picked: string[] = []
  for (const slot of FORMATIONS[t.formation]) {
    // An injury crisis: if nobody fit is left, someone carrying a knock plays.
    const options = pool.filter((p) => !picked.includes(p.id))
    const from = options.length ? options : squadOf(t).filter((p) => !picked.includes(p.id))
    const best = from.sort((a, b) => selectionScore(s, b, slot.role) - selectionScore(s, a, slot.role))[0]
    picked.push(best.id)
  }
  return picked
}

/** The manager's eleven if he's picked one and it's still available, otherwise the staff's. */
export function lineupFor(s: Season, club: number): string[] {
  const squad = squadOf(s.teams[club])
  const mine = club === s.userTeam ? s.lineup : null
  const valid = mine && mine.length === 11 && mine.every((id) => squad.some((p) => p.id === id && isAvailable(s, p)))
  return valid ? mine : autoPick(s, club)
}

/** The side that takes the field: the eleven in slot order, and up to seven fit substitutes. */
export function matchTeam(s: Season, club: number): TeamDef {
  const t = s.teams[club]
  const squad = squadOf(t)
  const xi = lineupFor(s, club).map((id) => squad.find((p) => p.id === id)!)
  const bench = squad
    .filter((p) => !xi.includes(p) && isAvailable(s, p))
    .sort((a, b) => ability(b) - ability(a))
    .slice(0, 7)
  return { ...t, players: xi, bench }
}

/** Starting fitness for everyone in a fixture, for the engine. */
export function fitnessFor(s: Season): Record<string, number> {
  return Object.fromEntries(Object.entries(s.condition).map(([id, c]) => [id, c.fitness]))
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

/** What a finished match produced: the score, the scorers, and every player's part in it. */
export function resultOf(m: MatchState): Result {
  const goals: Goal[] = []
  const injuries: { id: string; weeks: number }[] = []
  // When each player came on and went off (ticks), to work out his minutes.
  const on = new Map<number, number>()
  const off = new Map<number, number>()
  m.players.forEach((p, i) => m.teams[p.team].players.includes(p.def) && on.set(i, 0))
  for (const e of m.events) {
    if (e.type === 'goal') goals.push({ team: e.team, scorer: m.players[e.scorerIdx].def.name, clock: e.clock, ownGoal: e.ownGoal })
    if (e.type === 'injury') injuries.push({ id: m.players[e.idx].def.id, weeks: e.weeks })
    if (e.type === 'sub') {
      on.set(e.onIdx, e.tick)
      off.set(e.offIdx, e.tick)
    }
    if (e.type === 'card' && e.color === 'red') off.set(e.idx, e.tick)
  }
  const lines = playerLines(m, m.events)
  const appearances: Appearance[] = [...on.entries()].map(([i, from]) => ({
    id: m.players[i].def.id,
    minutes: Math.max(1, Math.round((((off.get(i) ?? m.tick) - from) / m.tick) * 90)),
    rating: lines[i].rating,
    goals: lines[i].goals,
    assists: lines[i].assists,
    energy: m.players[i].energy,
  }))
  return { score: [m.score[0], m.score[1]], goals, xg: [m.stats[0].xg, m.stats[1].xg], appearances, injuries }
}

/**
 * Record a matchday's results and move on to the next. `results` maps fixture id to result and
 * must cover every fixture on the current matchday.
 */
export function completeMatchday(s: Season, results: Map<number, Result>): Season {
  const today = fixturesOn(s, s.matchday)
  for (const f of today) if (!results.has(f.id)) throw new Error(`no result for fixture ${f.id}`)
  // A week to recover: most of the way back, but not all of it after a full ninety.
  const condition: Record<string, Condition> = {}
  for (const [id, c] of Object.entries(s.condition)) condition[id] = { ...c, fitness: Math.min(1, c.fitness + REST_RECOVERY) }
  const stats = { ...s.stats }
  for (const r of results.values()) {
    for (const a of r.appearances) {
      condition[a.id] = { ...condition[a.id], fitness: Math.min(1, a.energy + MATCH_RECOVERY) }
      const st = stats[a.id]
      stats[a.id] = { apps: st.apps + 1, goals: st.goals + a.goals, assists: st.assists + a.assists, ratings: st.ratings + a.rating }
    }
    for (const inj of r.injuries) condition[inj.id] = { ...condition[inj.id], injuredUntil: s.matchday + 1 + inj.weeks }
  }
  return {
    ...s,
    fixtures: s.fixtures.map((f) => (f.matchday === s.matchday ? { ...f, result: results.get(f.id)! } : f)),
    matchday: s.matchday + 1,
    condition,
    stats,
  }
}

/** Fitness regained in a week by a player who didn't play, and on top of what's left after a match. */
const REST_RECOVERY = 0.3
const MATCH_RECOVERY = 0.25

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

/** A player's overall, 1-100. */
export const playerRating = (p: PlayerDef): number => Math.round(ability(p) * 5)

/** A squad's overall strength, 1-100: its first eleven's average. */
export function squadRating(t: TeamDef): number {
  return Math.round((t.players.reduce((n, p) => n + ability(p), 0) / t.players.length) * 5)
}

/** The league's leading scorers: player, club, goals (then fewer games first). */
export function topScorers(s: Season, n = 5): { player: PlayerDef; club: number; goals: number; apps: number }[] {
  return s.teams
    .flatMap((t, club) => squadOf(t).map((player) => ({ player, club, goals: s.stats[player.id].goals, apps: s.stats[player.id].apps })))
    .filter((r) => r.goals > 0)
    .sort((a, b) => b.goals - a.goals || a.apps - b.apps)
    .slice(0, n)
}
