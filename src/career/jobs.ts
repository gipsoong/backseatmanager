/**
 * The manager's job (session 37): at a season's end the board judges it against its target, and
 * other clubs judge him by how far his side finished above (or below) where its eleven ranked.
 * Do well and bigger clubs call; miss the target twice running, or go down when he wasn't meant
 * to, and he's let go, with only smaller clubs interested. Nothing here touches a match.
 */
import { Rng } from '../engine/index.ts'
import { type Season, table, tipsOf } from '../season/season.ts'
import { aimFor, aimMet, relegationPlaces } from './career.ts'

export interface JobOffer {
  club: number
  /** Where its eleven ranks in the league (1 = strongest). */
  rank: number
}

export interface JobNews {
  /** The board has let him go: he must take one of the offers (or start a new career). */
  sacked: boolean
  /** How far above where his eleven ranked his side finished (negative: below). */
  overachieved: number
  offers: JobOffer[]
}

/** The clubs' ranks by eleven (1 = strongest), by club index. */
export const elevenRanks = tipsOf

/** What the summer holds for the manager, once the league is over (career mode only). */
export function jobNews(s: Season): JobNews | null {
  const c = s.career
  if (!c) return null
  const n = s.teams.length
  const rows = table(s)
  const place = rows.findIndex((r) => r.team === s.userTeam) + 1
  const ranks = elevenRanks(s)
  const mine = ranks[s.userTeam]
  const met = aimMet(c.aim, place, n)
  const lastMissed = c.history.length > 0 && !c.history[c.history.length - 1].met
  const down = place > n - relegationPlaces(n)
  const sacked = !met && (lastMissed || (down && c.aim !== 'survive'))
  const overachieved = mine - place
  const trophies = place === 1 ? 2 : 0
  const rng = new Rng(s.seed * 613 + c.number * 97)
  const pick = (clubs: number[], k: number): JobOffer[] =>
    rng
      .shuffle(clubs)
      .slice(0, k)
      .map((club) => ({ club, rank: ranks[club] }))
      .sort((a, b) => a.rank - b.rank)
  const others = s.teams.map((_, i) => i).filter((i) => i !== s.userTeam)
  let offers: JobOffer[]
  if (sacked) {
    // Clubs below his, a few places at least.
    offers = pick(others.filter((i) => ranks[i] > mine + 1), 2)
    if (!offers.length) offers = pick(others.filter((i) => ranks[i] > mine), 2)
  } else if (met || overachieved >= 2) {
    // A step up: how far, by how much he beat his eleven's rank (and a title).
    const reach = Math.max(2, Math.min(7, overachieved + 2 + trophies))
    const up = others.filter((i) => ranks[i] < mine && ranks[i] >= mine - reach)
    offers = pick(up, overachieved >= 4 || trophies ? 3 : 2)
  } else {
    // Missed it, but kept on: perhaps one club his own size.
    offers = rng.next() < 0.5 ? pick(others.filter((i) => Math.abs(ranks[i] - mine) <= 2), 1) : []
  }
  return { sacked, overachieved, offers }
}

/**
 * The new season with the manager at `club` (taken over the summer, after `nextSeason`): his
 * target is the new club's, the staff pick its side, and the summer's news is the move.
 */
export function takeJob(next: Season, club: number, sacked: boolean): Season {
  const c = next.career
  if (!c || club === next.userTeam) return next
  const moved = { ...next, userTeam: club, lineup: null }
  return {
    ...moved,
    career: {
      ...c,
      aim: aimFor(moved, club),
      summer: { retired: [], academy: [], signed: [], released: [], expired: [] },
      moved: { from: next.userTeam, sacked },
    },
  }
}
