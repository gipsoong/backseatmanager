/**
 * Real leagues for a career (session 32): a league season's real clubs and squads, made into
 * engine players as the draft makes its club-season players (`cardPlayer`: his own card from
 * cards.ts, else his archetype's at his overall, moved by his position's ROLE_OFFSET so he plays at
 * draft calibration; `shownRatings` puts FIFA's numbers back on screen). Each league is one file in
 * `leagues/`, `CLUBS` of `RealClub` and the year its season starts; add another league the same
 * way and list it in `REAL_LEAGUES`.
 *
 * In a real career every player carries his overall on the FIFA-like scale (`PlayerDef.overall`),
 * newcomers too (`newcomer` in career.ts), so the league reads as FC 25 does.
 */
import { FORMATIONS, Rng, type Formation, type Kit, type PlayerDef, type TeamDef, fitFor } from '../engine/index.ts'
import { cardPlayer, withBlocks } from '../draft/draft.ts'
import * as premierLeague2024 from './leagues/premier-league-2024.ts'
import * as laLiga2024 from './leagues/la-liga-2024.ts'
import * as bundesliga2024 from './leagues/bundesliga-2024.ts'
import * as serieA2024 from './leagues/serie-a-2024.ts'

export interface RealClub {
  club: string
  shortName: string
  kit: Kit
  formation: Formation
  /** One player a line: `Name, POS[/POS…], overall, born, L|R[, known as]`. */
  players: string
}

export interface RealLeague {
  /** Saved with the career (`Career.league`). */
  id: string
  /** What the career start offers: "Premier League 2024/25". */
  name: string
  /** The year its season starts. */
  season: number
  /** Ids' prefix: short, as every stat is keyed by a player's id. */
  key: string
  clubs: RealClub[]
}

export const REAL_LEAGUES: RealLeague[] = [
  { id: 'premier-league-2024', name: 'Premier League 2024/25', season: premierLeague2024.SEASON, key: 'pl24', clubs: premierLeague2024.CLUBS },
  { id: 'la-liga-2024', name: 'La Liga 2024/25', season: laLiga2024.SEASON, key: 'll24', clubs: laLiga2024.CLUBS },
  { id: 'bundesliga-2024', name: 'Bundesliga 2024/25', season: bundesliga2024.SEASON, key: 'bl24', clubs: bundesliga2024.CLUBS },
  { id: 'serie-a-2024', name: 'Serie A 2024/25', season: serieA2024.SEASON, key: 'sa24', clubs: serieA2024.CLUBS },
]

export const realLeague = (id: string | undefined): RealLeague | undefined => REAL_LEAGUES.find((l) => l.id === id)

export interface RealPlayer {
  name: string
  positions: string
  overall: number
  born: number
  foot: 'left' | 'right'
  knownAs?: string
}

/** A club's squad lines read. */
export function squadLines(lines: string): RealPlayer[] {
  return lines
    .trim()
    .split('\n')
    .map((line) => {
      const [name, positions, overall, born, foot, knownAs] = line.split(',').map((x) => x.trim())
      if (foot !== 'L' && foot !== 'R') throw new Error(`foot for ${name}: ${foot}`)
      return { name, positions, overall: Number(overall), born: Number(born), foot: foot === 'L' ? 'left' : 'right', ...(knownAs ? { knownAs } : {}) }
    })
}

/** Every real league's known-as names ("Son", "Gabriel"), for names.ts. */
export const REAL_KNOWN_AS: [string, string][] = REAL_LEAGUES.flatMap((l) =>
  l.clubs.flatMap((c) => squadLines(c.players).flatMap((p) => (p.knownAs ? [[p.name, p.knownAs] as [string, string]] : []))),
)

const playerId = (league: RealLeague, club: number, i: number): string => `${league.key}-${club}-${i}`

/**
 * The league's clubs as teams, in the file's order: for each place in the club's formation its best
 * fit (overall by fit), the rest of the squad behind them (the season's staff pick the eleven again);
 * blocks by where the eleven ranks, as a draft league's are (`withBlocks`).
 */
export function realTeams(league: RealLeague, seed: number): TeamDef[] {
  const teams = league.clubs.map((c, club): TeamDef => {
    const left: PlayerDef[] = squadLines(c.players).map((p, i) => cardPlayer(playerId(league, club, i), p.name, p.positions, p.overall, league.season, p.foot))
    const players = FORMATIONS[c.formation].map((slot, i) => {
      const best = left.reduce((a, b) => ((b.overall ?? 0) * fitFor(b, slot) > (a.overall ?? 0) * fitFor(a, slot) ? b : a))
      left.splice(left.indexOf(best), 1)
      return { ...best, shirt: i + 1 }
    })
    const bench = left.sort((a, b) => (b.overall ?? 0) - (a.overall ?? 0)).map((p, i) => ({ ...p, shirt: 12 + i }))
    return { name: c.club, shortName: c.shortName, kit: c.kit, formation: c.formation, block: 'mid', players, bench }
  })
  return withBlocks(teams, new Rng(seed * 13 + 5))
}

/** Each real player's birth year, by id. */
export function birthYears(league: RealLeague): Record<string, number> {
  const out: Record<string, number> = {}
  league.clubs.forEach((c, club) => squadLines(c.players).forEach((p, i) => (out[playerId(league, club, i)] = p.born)))
  return out
}

/** The highest potential anyone gets. */
const POTENTIAL_CAP = 95

/**
 * A real player's hidden potential, from his age and overall: nothing beyond today's from 26; before
 * that a little more for each year short of it, and more the younger he is (a 17-year-old in a
 * first-team squad is a real prospect): about +2 at 24, +8 at 20, +14 at 17, give or take a couple.
 * Varied by the career's seed, so it isn't the same in every career.
 */
export function realPotential(age: number, overall: number, rng: Rng): number {
  const d = Math.max(0, 26 - age)
  const room = d ? Math.max(0, d * (1 + 0.07 * d) + rng.gauss() * 1.5) : 0
  return Math.min(POTENTIAL_CAP, Math.max(overall, Math.round(overall + room)))
}
