/**
 * Money in a career: what a player is worth and earns, what each club has to spend, and what a
 * season brings in. Pure. Amounts are in £m (wages in £k a week).
 *
 * A player's value comes from his overall, his age and his room to grow: a 19-year-old who could
 * become an 85 is worth far more than a 30-year-old of the same overall today.
 */
import type { PlayerDef, Role } from '../engine/index.ts'
import { type Season, playerRating, squadOf } from '../season/season.ts'
import type { Person } from './career.ts'

export interface Finance {
  /** Money to spend, by club. */
  cash: number[]
  /** What a club takes in a season before prize money (gate, television, sponsors), by club. */
  income: number[]
}

/**
 * How far a position's overalls sit from the league's (made-up players on the draft's scale: a
 * centre-midfielder reads ~2 high, a striker ~4 low), so a striker of 76 is priced like an average
 * player, not a poor one. Signings and academy players are made at it too.
 */
export const ROLE_OFFSET: Record<Role, number> = { GK: 0, CB: 0, FB: 1, DM: 1, CM: 2, WM: 1, W: -2, ST: -4 }

/** The overall his value is priced at: today's, plus some of what he could become while he's young. */
function pricedAt(overall: number, who: Person | undefined): number {
  if (!who) return overall
  const room = Math.max(0, who.potential - overall)
  const share = who.age <= 20 ? 0.7 : who.age <= 23 ? 0.5 : who.age <= 26 ? 0.25 : 0
  return overall + room * share
}

/** What a club would pay for him with nothing else to weigh, £m (a tenth at the least). */
export function marketValue(p: PlayerDef, who: Person | undefined): number {
  const age = who?.age ?? 26
  const ageing = age <= 29 ? 1 : Math.max(0.25, 1 - 0.17 * (age - 29))
  // An average player of the league (~78) is worth £2m, and a point of overall ~20% more.
  const v = 2 * 1.2 ** (pricedAt(playerRating(p), who) - ROLE_OFFSET[p.role] - 78) * ageing
  return Math.max(0.1, Math.round(v * 10) / 10)
}

/** His wages, £k a week: by what he's worth now (not what he might become), from a floor of 3. */
export function wage(p: PlayerDef, who: Person | undefined): number {
  const now = marketValue(p, who && { ...who, potential: 0 })
  return Math.round(3 + now * 2.5)
}

/**
 * What his contract does to his price: a club selling a man in his last year gets less for him (he
 * could walk away for nothing in the summer), a little less with two years left.
 */
export const CONTRACT_FACTOR = [0.6, 0.85, 1] as const

/** Seasons left on his deal, this one included (1 in his last year), or null without a contract. */
export function yearsLeft(s: Season, who: Person | undefined): number | null {
  return who?.contract ? who.contract.until - Number(s.startDate.slice(0, 4)) : null
}

/** His transfer value: his market value, less if his contract is running down. */
export function valueOf(s: Season, p: PlayerDef): number {
  const who = s.career?.people[p.id]
  const left = yearsLeft(s, who)
  const v = marketValue(p, who)
  if (left === null) return v
  return Math.max(0.1, Math.round(v * CONTRACT_FACTOR[Math.max(0, Math.min(2, left - 1))] * 10) / 10)
}

/** What he's paid, £k a week: his contract's wage, or what he'd be worth without one. */
export const wageOf = (p: PlayerDef, who: Person | undefined): number => who?.contract?.wage ?? wage(p, who)

/** A club's wage bill for a season, £m. */
export function wageBill(s: Season, club: number): number {
  const weekly = squadOf(s.teams[club]).reduce((n, p) => n + wageOf(p, s.career?.people[p.id]), 0)
  return Math.round(weekly * 52) / 1000
}

/** Prize money for a league finish, £m: £300k a place from the bottom. */
export const prizeFor = (place: number, n: number): number => round1(0.3 * (n - place))

/**
 * Each club's money when a career begins: an income that covers its wages (prize money is the
 * profit), and cash to spend in proportion to its squad's worth.
 */
export function startFinance(s: Season): Finance {
  const income = s.teams.map((_, c) => round1(wageBill(s, c)))
  const cash = s.teams.map((t) => round1(5 + 0.12 * squadOf(t).reduce((n, p) => n + valueOf(s, p), 0)))
  return { cash, income }
}

/** The summer's accounts: income and prize money in, a season's wages out. */
export function settle(s: Season, f: Finance, places: number[]): Finance {
  return {
    income: f.income,
    cash: f.cash.map((c, club) => round1(c + f.income[club] + prizeFor(places[club], s.teams.length) - wageBill(s, club))),
  }
}

export const round1 = (v: number): number => Math.round(v * 10) / 10

/** £12.5m, £800k. */
export function money(v: number): string {
  const a = Math.abs(v)
  const s = a >= 1 ? `£${a.toFixed(a >= 10 ? 0 : 1)}m` : `£${Math.round(a * 1000)}k`
  return v < 0 ? `−${s}` : s
}
