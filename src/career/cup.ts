/**
 * The domestic cup (career mode, session 25): every club in the league, one match a tie, extra time
 * and penalties if it's level. A first round for the weakest sides gets the field down to a power
 * of two (twenty clubs: the eight weakest play off, twelve have a bye), then an open draw each
 * round. Rounds are played midweek, before set league matchdays spread through the season; the
 * final comes before the run-in. Like the European cup (draft/cup.ts), cup matches don't count in
 * the league's player stats, but fitness and injuries carry on. Pure.
 */
import { Rng } from '../engine/index.ts'
import {
  type Cup,
  type CupFixture,
  type CupSide,
  type Result,
  type Season,
  matchTeam,
  matchdayDate,
  matchdays,
  recover,
} from '../season/season.ts'
import { tieWinner } from '../draft/cup.ts'
import { elevenRating } from './career.ts'

export const DOMESTIC_CUP = 'Cup'

/** How many rounds a cup of `n` clubs has, the first a play-off round if n isn't a power of two. */
export function cupRounds(n: number): number {
  const full = 2 ** Math.floor(Math.log2(n))
  return Math.log2(full) + (n > full ? 1 : 0)
}

/** A round's name, counting back from the final. */
export function roundName(round: number, rounds: number): string {
  const back = rounds - 1 - round
  if (back === 0) return 'Final'
  if (back === 1) return 'Semi-final'
  if (back === 2) return 'Quarter-final'
  if (round === 0) return 'First round'
  return `Last ${2 ** (back + 1)}`
}
/** As a heading: "Quarter-finals". */
export const roundTitle = (round: number, rounds: number): string => {
  const n = roundName(round, rounds)
  return n === 'Final' || n === 'First round' || n.startsWith('Last') ? n : `${n}s`
}

/**
 * The league matchday each round is played before (midweek): spread evenly through the season,
 * none in its first or last few weeks.
 */
export function cupSchedule(s: Season, rounds = cupRounds(s.teams.length)): number[] {
  const md = matchdays(s)
  const first = Math.max(2, Math.round(md * 0.16))
  const last = Math.max(first + rounds - 1, Math.round(md * 0.84))
  return Array.from({ length: rounds }, (_, r) => Math.round(first + ((last - first) * r) / Math.max(1, rounds - 1)))
}

/** The date of a cup round: the Wednesday before its league matchday. */
export function cupDate(s: Season, f: CupFixture): Date {
  const d = matchdayDate(s, f.matchday)
  d.setUTCDate(d.getUTCDate() - 3)
  return d
}

export const cupOf = (s: Season): Cup | undefined => s.career?.cup

/** Pairs drawn from `sides` in order, one match each, all on `matchday`. */
function drawRound(s: Season, cup: Cup, round: number, sides: CupSide[], matchday: number): CupFixture[] {
  let id = cup.fixtures.length
  const out: CupFixture[] = []
  for (let tie = 0; tie * 2 < sides.length; tie++) {
    out.push({
      id,
      round,
      tie,
      leg: 0,
      matchday,
      home: sides[tie * 2],
      away: sides[tie * 2 + 1],
      seed: s.seed * 7919 + 5_000_000 + id * 104729,
      result: null,
    })
    id++
  }
  return out
}

/**
 * A season's cup, drawn when it starts: the weakest clubs (by their elevens) play the first round,
 * the rest go straight into the next. `entrants` lists everyone, the first round's sides first.
 */
export function startCup(s: Season): Cup {
  const n = s.teams.length
  const full = 2 ** Math.floor(Math.log2(n))
  const playing = n > full ? 2 * (n - full) : n
  const rng = new Rng(s.seed * 613 + 17)
  const strength = s.teams.map((_, i) => elevenRating(s, i))
  const order = s.teams.map((_, i) => i).sort((a, b) => strength[a] - strength[b] || a - b)
  const first = rng.shuffle(order.slice(0, playing))
  const byes = order.slice(playing)
  const cup: Cup = { guests: [], entrants: [...first, ...byes], fixtures: [] }
  cup.fixtures = drawRound(s, cup, 0, first, cupSchedule(s)[0])
  return cup
}

/** The rounds this cup has (from its entrants). */
export const roundsOf = (cup: Cup): number => cupRounds(cup.entrants.length)

/** Who won the cup, once the final's played. */
export const domesticWinner = (cup: Cup): CupSide | null => {
  const r = roundsOf(cup) - 1
  return cup.fixtures.some((f) => f.round === r) ? tieWinner(cup, r, 0) : null
}

/** Cup ties still to be played before this league matchday. */
export const cupToday = (s: Season): CupFixture[] => (cupOf(s)?.fixtures ?? []).filter((f) => f.matchday === s.matchday && !f.result)

/** A cup round is due before the next league matchday. */
export const isDomesticCupDay = (s: Season): boolean => cupToday(s).length > 0

/** The manager's tie in today's round, if he's in it. */
export const userCupTie = (s: Season): CupFixture | undefined => cupToday(s).find((f) => f.home === s.userTeam || f.away === s.userTeam)

/** Today's ties as matches for the engine: the clubs as they'd line up, a winner on the night. */
export const domesticCupMatches = (s: Season, fixtures = cupToday(s)) =>
  fixtures.map((f) => ({ id: f.id, home: matchTeam(s, f.home), away: matchTeam(s, f.away), seed: f.seed, knockout: {} }))

/**
 * Record today's cup round: results in, fitness and injuries carried on (it's midweek, so an injury
 * counts from this week's league match), and once the round is done the next is drawn at random
 * from its winners and the clubs that had a bye.
 */
export function completeCupDay(s: Season, results: Map<number, Result>): Season {
  const cup = cupOf(s)!
  const today = cupToday(s)
  for (const f of today) if (!results.has(f.id)) throw new Error(`no result for cup tie ${f.id}`)
  const fixtures = cup.fixtures.map((f) => (today.includes(f) ? { ...f, result: results.get(f.id)! } : f))
  let next: Cup = { ...cup, fixtures }
  const round = Math.max(...fixtures.map((f) => f.round))
  const rounds = roundsOf(cup)
  if (round < rounds - 1 && fixtures.every((f) => f.result)) {
    const ties = fixtures.filter((f) => f.round === round)
    const winners = ties.map((f) => tieWinner(next, round, f.tie)!)
    // The first round's winners join the clubs that had a bye.
    const sides = round === 0 ? [...winners, ...cup.entrants.slice(ties.length * 2)] : winners
    const rng = new Rng(s.seed * 613 + 101 * (round + 1))
    next = { ...next, fixtures: [...fixtures, ...drawRound(s, next, round + 1, rng.shuffle(sides), cupSchedule(s)[round + 1])] }
  }
  return {
    ...s,
    condition: recover({ ...s, matchday: s.matchday - 1 }, [...results.values()]),
    career: { ...s.career!, cup: next },
  }
}

/** How far a club went: "Winners", "Final", "Semi-final", …, or null if the cup hasn't started. */
export function cupRun(cup: Cup, club: number): string | null {
  const mine = cup.fixtures.filter((f) => f.home === club || f.away === club)
  if (!mine.length) return null
  const last = mine.reduce((a, b) => (b.round > a.round ? b : a))
  const rounds = roundsOf(cup)
  if (last.round === rounds - 1 && last.result && tieWinner(cup, last.round, last.tie) === club) return 'Winners'
  return roundName(last.round, rounds)
}

/** Still in the cup: no tie he's played has gone against him (and it's still on). */
export function stillInCup(cup: Cup, club: number): boolean {
  if (domesticWinner(cup) !== null) return false
  return cup.fixtures.every((f) => (f.home !== club && f.away !== club) || !f.result || tieWinner(cup, f.round, f.tie) === club)
}
