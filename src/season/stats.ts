/**
 * The league's numbers, from the results so far: player leaderboards, and each club's record and
 * style of play. Pure, like the rest of the season.
 */
import type { PlayerDef } from '../engine/index.ts'
import { type Counter, type Season, type SeasonStats, avgRating, squadOf } from './season.ts'

export interface LeaderRow {
  player: PlayerDef
  club: number
  value: number
  apps: number
}

export interface Leaderboard {
  title: string
  rows: LeaderRow[]
  /** How a value reads: a count, a percentage, a rating. */
  format: (v: number) => string
}

export const count = (st: SeasonStats, k: Counter | 'goals' | 'assists'): number => st[k] ?? 0

/** Matchdays played so far, for "regular starter" qualifiers. */
const played = (s: Season): number => Math.max(1, s.matchday - 1)

function board(s: Season, title: string, value: (st: SeasonStats, p: PlayerDef) => number | null, format: Leaderboard['format'], n: number): Leaderboard {
  const rows: LeaderRow[] = []
  s.teams.forEach((t, club) => {
    for (const player of squadOf(t)) {
      const st = s.stats[player.id]
      if (!st?.apps) continue
      const v = value(st, player)
      if (v !== null && v > 0) rows.push({ player, club, value: v, apps: st.apps })
    }
  })
  rows.sort((a, b) => b.value - a.value || a.apps - b.apps)
  return { title, rows: rows.slice(0, n), format }
}

/** The leaderboards shown in the Stats tab. */
export function leaderboards(s: Season, n = 5): Leaderboard[] {
  const whole = (v: number): string => String(Math.round(v))
  // Rates and averages only for regulars: half the minutes so far.
  const regular = (st: SeasonStats): boolean => count(st, 'minutes') >= played(s) * 45
  return [
    board(s, 'Goals', (st) => st.goals, whole, n),
    board(s, 'Expected goals', (st) => count(st, 'xg'), (v) => v.toFixed(1), n),
    board(s, 'Goals above expected', (st) => st.goals - count(st, 'xg'), (v) => `+${v.toFixed(1)}`, n),
    board(s, 'Assists', (st) => st.assists, whole, n),
    board(s, 'Expected assists', (st) => count(st, 'xa'), (v) => v.toFixed(1), n),
    board(s, 'Chances created', (st) => count(st, 'keyPasses'), whole, n),
    board(s, 'Average rating', (st) => (regular(st) ? avgRating(st) : null), (v) => v.toFixed(2), n),
    board(
      s,
      'Pass completion',
      (st) => (regular(st) && count(st, 'passes') >= played(s) * 20 ? count(st, 'passesCompleted') / count(st, 'passes') : null),
      (v) => `${Math.round(v * 100)}%`,
      n,
    ),
    board(s, 'Tackles + interceptions', (st) => count(st, 'tackles') + count(st, 'interceptions'), whole, n),
    board(s, 'Dribbles', (st) => count(st, 'dribbles'), whole, n),
    board(s, 'Clean sheets', (st, p) => (p.role === 'GK' ? count(st, 'cleanSheets') : null), whole, n),
    board(s, 'Saves', (st, p) => (p.role === 'GK' ? count(st, 'saves') : null), whole, n),
  ]
}

export interface ClubRecord {
  team: number
  played: number
  won: number
  drawn: number
  lost: number
  goalsFor: number
  goalsAgainst: number
  xgFor: number
  xgAgainst: number
  cleanSheets: number
  /** Averages per match, from results that kept team numbers. */
  possession: number
  passPct: number
  shots: number
  /** Longest runs, in matches. */
  unbeaten: number
  wins: number
  /** Biggest win: the score, the opponent. */
  biggestWin: { for: number; against: number; opponent: number } | null
  topScorer: { player: PlayerDef; goals: number } | null
}

/** Every club's season: record, runs, style, best win, top scorer. */
export function clubRecords(s: Season): ClubRecord[] {
  return s.teams.map((t, team) => {
    const games = s.fixtures
      .filter((f) => f.result && (f.home === team || f.away === team))
      .sort((a, b) => a.matchday - b.matchday)
      .map((f) => {
        const side = f.home === team ? 0 : 1
        const r = f.result!
        return { gf: r.score[side], ga: r.score[1 - side], xgf: r.xg[side], xga: r.xg[1 - side], line: r.teams?.[side], opponent: side === 0 ? f.away : f.home }
      })
    let unbeaten = 0
    let wins = 0
    let runU = 0
    let runW = 0
    let biggestWin: ClubRecord['biggestWin'] = null
    for (const g of games) {
      runU = g.gf >= g.ga ? runU + 1 : 0
      runW = g.gf > g.ga ? runW + 1 : 0
      unbeaten = Math.max(unbeaten, runU)
      wins = Math.max(wins, runW)
      if (g.gf > g.ga && (!biggestWin || g.gf - g.ga > biggestWin.for - biggestWin.against || (g.gf - g.ga === biggestWin.for - biggestWin.against && g.gf > biggestWin.for))) {
        biggestWin = { for: g.gf, against: g.ga, opponent: g.opponent }
      }
    }
    const lines = games.flatMap((g) => (g.line ? [g.line] : []))
    const avg = (f: (l: (typeof lines)[number]) => number): number => (lines.length ? lines.reduce((a, l) => a + f(l), 0) / lines.length : 0)
    const passes = lines.reduce((a, l) => a + l.passes, 0)
    const scorer = squadOf(t)
      .map((player) => ({ player, goals: s.stats[player.id]?.goals ?? 0 }))
      .sort((a, b) => b.goals - a.goals)[0]
    return {
      team,
      played: games.length,
      won: games.filter((g) => g.gf > g.ga).length,
      drawn: games.filter((g) => g.gf === g.ga).length,
      lost: games.filter((g) => g.gf < g.ga).length,
      goalsFor: games.reduce((a, g) => a + g.gf, 0),
      goalsAgainst: games.reduce((a, g) => a + g.ga, 0),
      xgFor: games.reduce((a, g) => a + g.xgf, 0),
      xgAgainst: games.reduce((a, g) => a + g.xga, 0),
      cleanSheets: games.filter((g) => g.ga === 0).length,
      possession: avg((l) => l.possession),
      passPct: passes ? lines.reduce((a, l) => a + l.passesCompleted, 0) / passes : 0,
      shots: avg((l) => l.shots),
      unbeaten,
      wins,
      biggestWin,
      topScorer: scorer && scorer.goals > 0 ? scorer : null,
    }
  })
}

/** Where a player is now: his club's index, or -1. */
export const clubOf = (s: Season, id: string): number => s.teams.findIndex((t) => squadOf(t).some((p) => p.id === id))

export interface LogRow {
  matchday: number
  opponent: number
  home: boolean
  /** Goals for and against his side. */
  score: [number, number]
  minutes: number
  started: boolean
  rating: number
  goals: number
  assists: number
  xg: number
  xa: number
}

/** Every match he played, in order: the season behind his totals. */
export function matchLog(s: Season, id: string): LogRow[] {
  const rows: LogRow[] = []
  for (const f of s.fixtures) {
    const a = f.result?.appearances.find((x) => x.id === id)
    if (!a) continue
    // His side that day, from whether he was in the home or away club's squad then: the side
    // whose players' appearances he's listed with (a traded player may have played for both).
    const side = sideOf(s, f, id)
    rows.push({
      matchday: f.matchday,
      opponent: side === 0 ? f.away : f.home,
      home: side === 0,
      score: side === 0 ? [f.result!.score[0], f.result!.score[1]] : [f.result!.score[1], f.result!.score[0]],
      minutes: a.minutes,
      started: a.starts !== 0,
      rating: a.rating,
      goals: a.goals,
      assists: a.assists,
      xg: a.xg ?? 0,
      xa: a.xa ?? 0,
    })
  }
  return rows.sort((x, y) => x.matchday - y.matchday)
}

/** Which side of a fixture a player played on. */
function sideOf(s: Season, f: Season['fixtures'][number], id: string): 0 | 1 {
  const moved = s.transfers?.find((t) => t.ids.includes(id) && t.matchday > f.matchday)
  // Before a move he played for the club he left.
  const club = moved ? moved.from[moved.ids.indexOf(id)] : clubOf(s, id)
  return club === f.away ? 1 : 0
}

/** A per-90 rate, or null if he's barely played. */
export const per90 = (v: number, minutes: number): number | null => (minutes >= 90 ? (v / minutes) * 90 : null)

/**
 * How many goals an average keeper in this league lets in per xG of shots on target: the xG of a
 * shot doesn't know it was on target, so an on-target shot is worth more than its xG.
 */
export function onTargetRate(s: Season): number {
  let faced = 0
  let conceded = 0
  // Only keepers face shots (and everyone on the pitch concedes: count keepers' goals only).
  for (const st of Object.values(s.stats)) {
    if (!st.facedXg) continue
    faced += st.facedXg
    conceded += st.conceded ?? 0
  }
  return faced > 0 ? conceded / faced : 0
}

/**
 * A keeper's goals prevented: what an average keeper here would have let in from the shots on
 * target he faced, less what he did. Positive is good.
 */
export const goalsPrevented = (st: SeasonStats, rate: number): number => count(st, 'facedXg') * rate - count(st, 'conceded')
