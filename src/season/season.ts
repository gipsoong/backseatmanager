/**
 * A season: a league of teams, a double round-robin of fixtures on weekly matchdays, results and
 * the table. Pure and deterministic: the same season seed gives the same league and fixtures, and
 * each fixture has its own match seed, so a match plays out the same whether it's watched or not.
 * No React, no storage: the app keeps a Season and replaces it with the updated one.
 */
import { FORMATIONS, type MatchState, type PlayerDef, type Slot, type TeamDef, ability, cardOverall, fitFor, leagueTeams } from '../engine/index.ts'
import { type PlayerLine, playerLines } from '../viewer/players.ts'
import type { Career } from '../career/career.ts'

export const LEAGUE_SIZE = 20
/** Named substitutes per match, as in the Premier League. */
export const BENCH_SIZE = 9

export interface Goal {
  team: 0 | 1
  scorer: string
  clock: string
  ownGoal: boolean
}

/** Numbers a match line has that add straight up over a season. */
const LINE_COUNTERS = [
  'passes',
  'passesCompleted',
  'keyPasses',
  'shots',
  'onTarget',
  'xg',
  'npxg',
  'xa',
  'penGoals',
  'penTaken',
  'bigChances',
  'bigChancesScored',
  'headedGoals',
  'leftGoals',
  'rightGoals',
  'tackles',
  'interceptions',
  'blocks',
  'clearances',
  'aerials',
  'recoveries',
  'dribbles',
  'dribbledPast',
  'saves',
  'savedXg',
  'facedXg',
  'conceded',
  'fouls',
  'ownGoals',
] as const satisfies readonly (keyof PlayerLine)[]

/** Per-player numbers added up over a season (saves from before they existed count them as 0). */
export const COUNTERS = ['starts', 'minutes', ...LINE_COUNTERS, 'cleanSheets', 'yellows', 'reds'] as const
export type Counter = (typeof COUNTERS)[number]

/** One player's part in a match. */
export interface Appearance extends Partial<Record<Counter, number>> {
  id: string
  minutes: number
  rating: number
  goals: number
  assists: number
  /** Energy left when he came off or at full time (0-1). */
  energy: number
}

/** A side's numbers in one match. */
export interface TeamLine {
  /** Share of the ball, 0-1. */
  possession: number
  passes: number
  passesCompleted: number
  shots: number
  onTarget: number
  corners: number
  fouls: number
}

export interface Result {
  score: [number, number]
  goals: Goal[]
  xg: [number, number]
  appearances: Appearance[]
  /** Hurt in the match, and for how many matchdays after it. */
  injuries: { id: string; weeks: number }[]
  /** Home and away sides' numbers (results saved before they were kept have none). */
  teams?: [TeamLine, TeamLine]
  /** A knockout tie that went to extra time, and to penalties (home, away). */
  aet?: boolean
  pens?: [number, number]
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
export interface SeasonStats extends Partial<Record<Counter, number>> {
  apps: number
  goals: number
  assists: number
  /** Sum of match ratings, and how many there were (appearances of 20 minutes or more). */
  ratings: number
  rated?: number
}

/** Appearances this short aren't rated in a season's average: too little to judge. */
export const RATED_MINUTES = 20

/** His average match rating this season, or null if he hasn't been rated. */
export function avgRating(st: SeasonStats | undefined): number | null {
  const n = st ? (st.rated ?? st.apps) : 0
  return st && n ? st.ratings / n : null
}

export interface Season {
  /**
   * 3 since careers, 4 since club overalls are on the draft's scale (session 22); older saves are
   * upgraded on load.
   */
  version: 4
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
  /** A drafted side against clubs of the past, rather than a club in a league of made-up ones. */
  mode?: 'draft'
  /** Draft mode: whose club-seasons the league is made of (unset: the Premier League). */
  league?: string
  /** Deals done in the January window (draft mode), oldest first. */
  transfers?: Transfer[]
  /** Offers from other clubs turned down this window (draft mode). */
  declined?: { club: number; give: string[]; get: string[] }[]
  /** The European cup after the league, for a draft side that finished in the top four. */
  cup?: Cup
  /** The manager has moved on from the league's review to the cup's own screen. */
  cupEntered?: boolean
  /** Club mode: the career this season is part of (ages, potential, the board, past seasons). */
  career?: Career
}

/**
 * A side in the cup: a club in the league (its index into Season.teams), or a guest from another
 * league (GUEST + its index into Cup.guests).
 */
export type CupSide = number
export const GUEST = 100

export interface CupFixture {
  id: number
  /** 0 = last 16, 1 = quarter-finals, 2 = semi-finals, 3 = final. */
  round: number
  /** The tie within its round. */
  tie: number
  /** 1 or 2 of a two-legged tie; 0 for a one-off final. */
  leg: 0 | 1 | 2
  matchday: number
  home: CupSide
  away: CupSide
  seed: number
  result: Result | null
}

export interface Cup {
  guests: TeamDef[]
  /** The sixteen, in the order they were drawn: ties are pairs. */
  entrants: CupSide[]
  fixtures: CupFixture[]
}

/**
 * A swap agreed between two clubs before `matchday` was played: each player in `ids` left
 * `from[i]` for `to[i]` (indices into Season.teams). His season's numbers go with him.
 */
export interface Transfer {
  matchday: number
  ids: string[]
  from: number[]
  to: number[]
  /** Career mode: money that changed hands, £m, from one club to the other. */
  fee?: { from: number; to: number; amount: number }
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

/**
 * A new season, home and away against everyone, starting in August: `LEAGUE_SIZE` made-up clubs,
 * or the given teams.
 */
export function createSeason(seed: number, userTeam: number, today = new Date(), teams = leagueTeams(seed, LEAGUE_SIZE)): Season {
  const first = roundRobin(teams.length)
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
  return { version: 4, seed, teams, userTeam, fixtures, matchday: 1, startDate: firstSaturdayOfAugust(today), condition, stats, lineup: null }
}

// ---------------------------------------------------------------------------
// Squads and selection

/** Everyone at the club: the usual eleven and the rest of the squad. */
export const squadOf = (t: TeamDef): PlayerDef[] => [...t.players, ...t.bench]

export const isAvailable = (s: Season, p: PlayerDef): boolean => s.condition[p.id].injuredUntil <= s.matchday

/**
 * The staff's eleven: the best available fits, fitness counted. Best pairings first across the
 * whole formation, so a centre-back plays centre-back rather than the first slot he'd fit.
 */
export function autoPick(s: Season, club: number): string[] {
  const t = s.teams[club]
  const slots = FORMATIONS[t.formation]
  const picked: (string | null)[] = slots.map(() => null)
  const used = new Set<string>()
  // An injury crisis: if nobody fit is left, someone carrying a knock plays.
  // How well he fits the slot, his ability, and his freshness (a tired star can still get the nod);
  // ability and freshness worked out once a man, not once a slot (the market asks for many elevens a day).
  const own = new Map<PlayerDef, { ab: number; fresh: number }>()
  const scoreOf = (p: PlayerDef, slot: Slot): number => {
    let o = own.get(p)
    if (!o) own.set(p, (o = { ab: ability(p), fresh: 0.55 + 0.45 * s.condition[p.id].fitness }))
    return fitFor(p, slot) * o.ab * o.fresh
  }
  for (const pool of [squadOf(t).filter((p) => isAvailable(s, p)), squadOf(t)]) {
    const pairs = pool.flatMap((p) => slots.map((slot, i) => ({ p, i, score: scoreOf(p, slot) })))
    pairs.sort((a, b) => b.score - a.score)
    for (const { p, i } of pairs) {
      if (picked[i] || used.has(p.id)) continue
      picked[i] = p.id
      used.add(p.id)
    }
  }
  return picked as string[]
}

/** The manager's eleven if he's picked one and it's still available, otherwise the staff's. */
export function lineupFor(s: Season, club: number): string[] {
  const squad = squadOf(s.teams[club])
  const mine = club === s.userTeam ? s.lineup : null
  const valid = mine && mine.length === 11 && mine.every((id) => squad.some((p) => p.id === id && isAvailable(s, p)))
  return valid ? mine : autoPick(s, club)
}

/** The side that takes the field: the eleven in slot order, and up to nine fit substitutes. */
export function matchTeam(s: Season, club: number): TeamDef {
  const t = s.teams[club]
  const squad = squadOf(t)
  const xi = lineupFor(s, club).map((id) => squad.find((p) => p.id === id)!)
  const bench = squad
    .filter((p) => !xi.includes(p) && isAvailable(s, p))
    .sort((a, b) => ability(b) - ability(a))
    .slice(0, BENCH_SIZE)
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
export const matchdays = (s: Season): number => (s.teams.length - 1) * 2

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

export const isOver = (s: Season): boolean => s.matchday > matchdays(s)

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
  // The final whistle: penalties after extra time aren't minutes played.
  const end = m.events.find((e) => e.type === 'shootout')?.tick ?? m.tick
  const appearances: Appearance[] = [...on.entries()].map(([i, from]) => {
    const l = lines[i]
    const p = m.players[i]
    const minutes = Math.max(1, Math.round((((off.get(i) ?? end) - from) / end) * (m.period >= 3 ? 120 : 90)))
    const a: Appearance = {
      id: p.def.id,
      starts: from === 0 ? 1 : 0,
      minutes,
      rating: l.rating,
      goals: l.goals,
      assists: l.assists,
      energy: p.energy,
      // A keeper's clean sheet: most of the match in goal without conceding.
      cleanSheets: p.slot.role === 'GK' && minutes >= 60 && l.conceded === 0 ? 1 : 0,
      yellows: l.yellow ? 1 : 0,
      reds: l.red ? 1 : 0,
    }
    // Only what he did: zeros are left out, to keep saved results small.
    for (const k of LINE_COUNTERS) if (l[k]) a[k] = Math.round(l[k] * 1000) / 1000
    return a
  })
  const total = m.stats[0].possessionTicks + m.stats[1].possessionTicks || 1
  const teams = m.stats.map((t) => ({
    possession: t.possessionTicks / total,
    passes: t.passes,
    passesCompleted: t.passesCompleted,
    shots: t.shots,
    onTarget: t.shotsOnTarget,
    corners: t.corners,
    fouls: t.fouls,
  })) as [TeamLine, TeamLine]
  const result: Result = { score: [m.score[0], m.score[1]], goals, xg: [m.stats[0].xg, m.stats[1].xg], appearances, injuries, teams }
  if (m.period >= 3) result.aet = true
  if (m.shootout) {
    const pens: [number, number] = [0, 0]
    for (const k of m.shootout.kicks) if (k.scored) pens[k.team]++
    result.pens = pens
  }
  return result
}

/**
 * Record a matchday's results and move on to the next. `results` maps fixture id to result and
 * must cover every fixture on the current matchday.
 */
export function completeMatchday(s: Season, results: Map<number, Result>): Season {
  const today = fixturesOn(s, s.matchday)
  for (const f of today) if (!results.has(f.id)) throw new Error(`no result for fixture ${f.id}`)
  const condition = recover(s, [...results.values()])
  const stats = { ...s.stats }
  for (const r of results.values()) {
    for (const a of r.appearances) {
      const st = stats[a.id]
      const rated = a.minutes >= RATED_MINUTES
      const next: SeasonStats = {
        apps: st.apps + 1,
        goals: st.goals + a.goals,
        assists: st.assists + a.assists,
        ratings: st.ratings + (rated ? a.rating : 0),
        rated: (st.rated ?? st.apps) + (rated ? 1 : 0),
      }
      // A save from before starts were counted: its earlier appearances count as starts.
      for (const k of COUNTERS) next[k] = (st[k] ?? (k === 'starts' ? st.apps : 0)) + (a[k] ?? 0)
      stats[a.id] = next
    }
  }
  return {
    ...s,
    fixtures: s.fixtures.map((f) => (f.matchday === s.matchday ? { ...f, result: results.get(f.id)! } : f)),
    matchday: s.matchday + 1,
    condition,
    stats,
  }
}

/**
 * Everyone's condition after a matchday: a week to recover, most of the way back but not all of it
 * after a full ninety; and whoever was hurt is out for a while.
 */
export function recover(s: Season, results: Result[]): Record<string, Condition> {
  const condition: Record<string, Condition> = {}
  for (const [id, c] of Object.entries(s.condition)) condition[id] = { ...c, fitness: Math.min(1, c.fitness + REST_RECOVERY) }
  for (const r of results) {
    // (A cup guest's condition starts with his first match.)
    const was = (id: string): Condition => condition[id] ?? { fitness: 1, injuredUntil: 0 }
    for (const a of r.appearances) condition[a.id] = { ...was(a.id), fitness: Math.min(1, a.energy + (1 - a.energy) * MATCH_RECOVERY) }
    for (const inj of r.injuries) condition[inj.id] = { ...was(inj.id), injuredUntil: s.matchday + 1 + inj.weeks }
  }
  return condition
}

/** Fitness regained in a week by a player who didn't play. */
const REST_RECOVERY = 0.3
/**
 * Of what a match took out of him, the share he gets back by the next matchday: ~0.9 after a full
 * ninety from fresh. (A flat 0.25 on top of what was left let fitness spiral down over a season:
 * regulars started matches at ~0.55 and the whole league played at a walk, ~2.2 goals a match.)
 */
const MATCH_RECOVERY = 0.75

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

/**
 * A player's overall, 1-99, on one FIFA-like scale: a real player's own, otherwise his position's
 * weighted skills as a real player of those skills would be rated (`cardOverall`).
 */
export const playerRating = (p: PlayerDef): number => p.overall ?? Math.round(cardOverall(p.attrs, p.role))

/** A squad's overall strength, 1-100: its first eleven's average. */
export function squadRating(t: TeamDef): number {
  return Math.round(t.players.reduce((n, p) => n + playerRating(p), 0) / t.players.length)
}
