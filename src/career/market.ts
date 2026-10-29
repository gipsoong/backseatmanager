/**
 * The other clubs' business in a window: a few deals among themselves, never with the manager
 * (their offers to him are in draft/transfers.ts). A club buys for its weakest place, from a club
 * that can spare the player at his price; the strongest sides don't take rivals' best players, and
 * nobody strips the league's best side.
 */
import { FORMATIONS, Rng, fitFor } from '../engine/index.ts'
import { type Season, isOver, playerRating, squadOf } from '../season/season.ts'
import { POINT_VALUE, movePlayers, needs, sideOf, thisWindow, windowOpen } from '../draft/transfers.ts'
import { elevenRating } from './career.ts'
import { round1, valueOf } from './money.ts'

/** Deals among the other clubs: at most this many on a window matchday, and in a window. */
export const AI_DEALS_PER_MATCHDAY = 2
export const AI_DEALS_PER_WINDOW = 5
/** Squad sizes a deal can leave a club with. */
const MIN_SQUAD = 18
const MAX_SQUAD = 26

/** The other clubs' deals before this matchday's games (none outside a window, or once done today). */
export function marketDay(s: Season): Season {
  const c = s.career
  if (!c?.finance || isOver(s) || !windowOpen(s)) return s
  const done = thisWindow(s).filter((t) => !t.from.includes(s.userTeam) && !t.to.includes(s.userTeam))
  if (done.some((t) => t.matchday === s.matchday) || done.length >= AI_DEALS_PER_WINDOW) return s
  const rng = new Rng(s.seed * 977 + s.matchday * 31 + c.number)
  const strength = s.teams.map((_, i) => elevenRating(s, i))
  const rank = (club: number): number => strength.filter((r) => r > strength[club]).length
  const best = strength.indexOf(Math.max(...strength))
  let out = s
  let deals = 0
  const busy = new Set(done.flatMap((t) => [...t.from, ...t.to]))
  const clubs = rng.shuffle(s.teams.map((_, i) => i).filter((i) => i !== s.userTeam))
  for (const buyer of clubs) {
    if (deals >= AI_DEALS_PER_MATCHDAY || done.length + deals >= AI_DEALS_PER_WINDOW) break
    if (busy.has(buyer) || !rng.chance(0.6)) continue
    const deal = findDeal(out, buyer, rank, best, busy)
    if (!deal) continue
    const seller = deal.seller
    out = movePlayers(out, {
      matchday: s.matchday,
      ids: [deal.id],
      from: [seller],
      to: [buyer],
      fee: { from: buyer, to: seller, amount: deal.fee },
    })
    busy.add(buyer).add(seller)
    deals++
  }
  return out
}

/** The best buy a club can make for its weakest place, or null. */
function findDeal(
  s: Season,
  buyer: number,
  rank: (club: number) => number,
  best: number,
  busy: Set<number>,
): { id: string; seller: number; fee: number } | null {
  const cash = s.career!.finance!.cash[buyer]
  const squad = squadOf(s.teams[buyer])
  if (squad.length >= MAX_SQUAD || cash < 1) return null
  const weak = needs(s, buyer)[0]
  if (!weak) return null
  const slots = FORMATIONS[s.teams[buyer].formation]
  const slot = slots.find((x) => x === weak.slot)!
  const people = s.career!.people
  let pick: { id: string; seller: number; fee: number; gain: number } | null = null
  s.teams.forEach((t, seller) => {
    if (seller === buyer || seller === s.userTeam || seller === best || busy.has(seller)) return
    const theirs = squadOf(t)
    if (theirs.length <= MIN_SQUAD) return
    const theirBest = [...theirs].sort((a, b) => playerRating(b) - playerRating(a)).slice(0, 2)
    for (const p of theirs) {
      if (fitFor(p, slot) < 0.9 || (people[p.id]?.age ?? 26) > 31) continue
      if (p.role === 'GK' && theirs.filter((q) => q.role === 'GK').length <= 2) continue
      const gain = playerRating(p) * fitFor(p, slot) - weak.fitted
      if (gain < 1.5) continue
      // The top sides don't take a rival's best players.
      if (rank(buyer) < 4 && theirBest.includes(p)) continue
      const value = valueOf(s, p)
      // The seller's price: his value, a margin, and what losing him does to their side.
      const side = sideOf(s, seller, [p], [])
      const price = round1(value * 1.15 - side.value * POINT_VALUE)
      if (price > cash * 0.8) continue
      // The buyer pays it only if he's worth that much to them.
      const forThem = value + sideOf(s, buyer, [], [p]).value * POINT_VALUE
      if (forThem < price) continue
      if (!pick || gain > pick.gain) pick = { id: p.id, seller, fee: price, gain }
    }
  })
  if (!pick) return null
  const { id, seller, fee } = pick
  return { id, seller, fee }
}


