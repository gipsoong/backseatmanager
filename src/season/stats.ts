/**
 * The league's numbers, from the results so far: player leaderboards, and each club's record and
 * style of play. Pure, like the rest of the season.
 */
import type { PlayerDef } from '../engine/index.ts'
import { type Counter, type Season, type SeasonStats, squadOf } from './season.ts'

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

const count = (st: SeasonStats, k: Counter | 'goals' | 'assists'): number => st[k] ?? 0

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
    board(s, 'Assists', (st) => st.assists, whole, n),
    board(s, 'Chances created', (st) => count(st, 'keyPasses'), whole, n),
    board(s, 'Average rating', (st) => (regular(st) ? st.ratings / st.apps : null), (v) => v.toFixed(2), n),
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
