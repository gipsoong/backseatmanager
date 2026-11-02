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
import * as ligue12024 from './leagues/ligue-1-2024.ts'

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
  { id: 'ligue-1-2024', name: 'Ligue 1 2024/25', season: ligue12024.SEASON, key: 'l124', clubs: ligue12024.CLUBS },
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
 * How far a real player plays from his league's middle, against how far his overall says (session 34):
 * FIFA-like overalls spread a real league's elevens 11-16 points from best to worst, made-up careers
 * (which the engine was tuned on) 8-9, so real champions ran away with it (95-110 points) and lopsided
 * games lifted goals. Each real player plays his card moved toward the league's mean eleven by this
 * share of the gap (`balanceShift`), on top of ROLE_OFFSET, in `cardShift`, so cards and overalls on
 * screen are FIFA's. The career keeps it (`Career.balance`), newcomers are made the same way, and
 * development moves the shift with the overall (`shiftTo`).
 */
export const REAL_BALANCE = 0.7

export interface Balance {
  /** The share of a player's distance from the league's middle that he plays (REAL_BALANCE). */
  factor: number
  /** The league's mean eleven overall when the career began. */
  mean: number
}

/** What a player of this overall plays beyond his card (card points, + below the middle). */
export const balanceShift = (overall: number, b: Balance): number => (b.factor - 1) * (overall - b.mean)

/** The clubs' squads, each player made by `make`, elevens picked by overall by fit. */
function teamsOf(league: RealLeague, make: (id: string, p: RealPlayer) => PlayerDef): TeamDef[] {
  return league.clubs.map((c, club): TeamDef => {
    const left: PlayerDef[] = squadLines(c.players).map((p, i) => make(playerId(league, club, i), p))
    const players = FORMATIONS[c.formation].map((slot, i) => {
      const best = left.reduce((a, b) => ((b.overall ?? 0) * fitFor(b, slot) > (a.overall ?? 0) * fitFor(a, slot) ? b : a))
      left.splice(left.indexOf(best), 1)
      return { ...best, shirt: i + 1 }
    })
    const bench = left.sort((a, b) => (b.overall ?? 0) - (a.overall ?? 0)).map((p, i) => ({ ...p, shirt: 12 + i }))
    return { name: c.club, shortName: c.shortName, kit: c.kit, formation: c.formation, block: 'mid', players, bench }
  })
}

const card = (league: RealLeague, extra: (overall: number) => number) => (id: string, p: RealPlayer): PlayerDef =>
  cardPlayer(id, p.name, p.positions, p.overall, league.season, p.foot, extra(p.overall))

const balances = new Map<string, Balance>()

/** The league's balance: REAL_BALANCE about the mean overall of the elevens as `realTeams` picks them. */
export function balanceOf(league: RealLeague): Balance {
  let b = balances.get(league.id)
  if (!b) {
    const elevens = teamsOf(league, card(league, () => 0)).flatMap((t) => t.players)
    b = { factor: REAL_BALANCE, mean: elevens.reduce((n, p) => n + (p.overall ?? 0), 0) / elevens.length }
    balances.set(league.id, b)
  }
  return b
}

/**
 * The league's clubs as teams, in the file's order: for each place in the club's formation its best
 * fit (overall by fit), the rest of the squad behind them (the season's staff pick the eleven again);
 * every player balanced toward the league's middle (`balanceOf`); blocks by where the eleven ranks,
 * as a draft league's are (`withBlocks`).
 */
export function realTeams(league: RealLeague, seed: number): TeamDef[] {
  const b = balanceOf(league)
  return withBlocks(teamsOf(league, card(league, (o) => balanceShift(o, b))), new Rng(seed * 13 + 5))
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
