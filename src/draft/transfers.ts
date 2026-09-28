/**
 * The January window, in draft mode: swap players with the other clubs. No money, only players:
 * you offer one or two of yours for one or two of theirs, and they take it if it's worth it to
 * them. Pure: a deal is judged and applied the same way every time.
 *
 * How a club judges a deal:
 * - Each player has a worth: his overall on a steep curve (one 88 is worth more than two 80s),
 *   nudged by his form this season and less if he's injured.
 * - A player is worth more to a club he'd start for than one he'd sit on the bench at: a club
 *   gives up a squad player more easily than a starter, and wants players who'd get in its side.
 * - They agree if what they get is worth at least 10% more to them than what they give up, and
 *   their best eleven isn't weakened.
 */
import { FORMATIONS, type PlayerDef, fitFor } from '../engine/index.ts'
import { type Season, autoPick, avgRating, isOver, matchdayDate, matchdays, squadOf } from '../season/season.ts'

/** Deals the manager can make in one window. */
export const DEALS_PER_WINDOW = 3
/** Players each side can put into one deal. */
export const MAX_PER_SIDE = 2
/** Squad sizes a deal can leave a club with. */
const MIN_SQUAD = 18
const MAX_SQUAD = 22
/** What a club wants over and above a like-for-like swap. */
export const PREMIUM = 1.1
/** A bench player's worth to a club, next to a starter's. */
const BENCH_USE = 0.6

export interface Deal {
  /** The club you're dealing with. */
  club: number
  /** Your players going to them, and theirs coming to you (ids). */
  give: string[]
  get: string[]
}

/** The matchdays played in January (their dates), or none if it's not a draft season. */
export function windowMatchdays(s: Season): number[] {
  if (s.mode !== 'draft') return []
  return Array.from({ length: matchdays(s) }, (_, i) => i + 1).filter((md) => matchdayDate(s, md).getUTCMonth() === 0)
}

/** Open while the next match to be played is in January. */
export const windowOpen = (s: Season): boolean => !isOver(s) && windowMatchdays(s).includes(s.matchday)

/** Deals done in this season's window. */
export const dealsDone = (s: Season): number => (s.transfers ?? []).filter((t) => t.to.includes(s.userTeam) || t.from.includes(s.userTeam)).length

const byId = (s: Season, id: string): PlayerDef | undefined => s.teams.flatMap(squadOf).find((p) => p.id === id)

/** A player's worth: his overall on a steep curve, his form, his fitness. */
export function worth(s: Season, p: PlayerDef): number {
  const st = s.stats[p.id]
  const avg = avgRating(st)
  const form = avg !== null && st.apps >= 5 ? Math.min(1.25, Math.max(0.8, 1 + (avg - 6.75) * 0.3)) : 1
  const out = Math.max(0, s.condition[p.id].injuredUntil - s.matchday)
  return 100 * 1.12 ** ((p.overall ?? 70) - 80) * form * Math.max(0.4, 1 - out * 0.1)
}

/** A squad's best eleven for its shape: the average of its players' overalls, each weighed by fit. */
function strength(s: Season, club: number, squad: PlayerDef[]): { rating: number; starters: Set<string> } {
  const probe: Season = { ...s, teams: s.teams.map((t, i) => (i === club ? { ...t, players: squad.slice(0, 11), bench: squad.slice(11) } : t)) }
  const ids = autoPick(probe, club)
  const slots = FORMATIONS[s.teams[club].formation]
  const total = ids.reduce((a, id, i) => {
    const p = squad.find((q) => q.id === id)!
    return a + (p.overall ?? 70) * fitFor(p, slots[i].role)
  }, 0)
  return { rating: total / 11, starters: new Set(ids) }
}

export interface Verdict {
  ok: boolean
  /** Worth to them of what they get over what they give up (1 = like for like). */
  ratio: number
  /** Their best eleven's rating before and after. */
  before: number
  after: number
  /** Why it can't be done or why they said no, in a line. */
  reason: string
}

/** Whether the deal can be made at all, and whether they'd take it. */
export function judge(s: Season, deal: Deal): Verdict {
  const none = (reason: string): Verdict => ({ ok: false, ratio: 0, before: 0, after: 0, reason })
  if (!windowOpen(s)) return none('The window is shut.')
  if (dealsDone(s) >= DEALS_PER_WINDOW) return none(`That's ${DEALS_PER_WINDOW} deals this window, the most you can do.`)
  if (deal.club === s.userTeam) return none('Pick another club.')
  if (!deal.give.length || !deal.get.length) return none('Choose who you want and who you offer.')
  if (deal.give.length > MAX_PER_SIDE || deal.get.length > MAX_PER_SIDE) return none(`At most ${MAX_PER_SIDE} players each way.`)
  if ((s.transfers ?? []).some((t) => t.from.includes(deal.club) || t.to.includes(deal.club)))
    return none(`You've already done a deal with ${s.teams[deal.club].name} this window.`)
  const mine = squadOf(s.teams[s.userTeam])
  const theirs = squadOf(s.teams[deal.club])
  const give = deal.give.map((id) => mine.find((p) => p.id === id))
  const get = deal.get.map((id) => theirs.find((p) => p.id === id))
  if (give.some((p) => !p) || get.some((p) => !p)) return none('Those players have moved on.')
  const moved = new Set((s.transfers ?? []).flatMap((t) => t.ids))
  const already = [...give, ...get].find((p) => moved.has(p!.id))
  if (already) return none(`${already.name} has already moved this window.`)
  const mineAfter = mine.length - give.length + get.length
  const theirsAfter = theirs.length - get.length + give.length
  if (mineAfter < MIN_SQUAD || theirsAfter < MIN_SQUAD) return none(`Both squads need at least ${MIN_SQUAD} players.`)
  if (mineAfter > MAX_SQUAD || theirsAfter > MAX_SQUAD) return none(`Squads can't go over ${MAX_SQUAD} players.`)
  const keepers = (ps: (PlayerDef | undefined)[]): number => ps.filter((p) => p!.role === 'GK').length
  if (keepers(mine) - keepers(give) + keepers(get) < 1 || keepers(theirs) - keepers(get) + keepers(give) < 1) return none('Both sides need a goalkeeper.')

  // How they see it: what they get, as it would fit in their side, against what they lose, as
  // it fits in their side now.
  const now = strength(s, deal.club, theirs)
  const nextSquad = [...theirs.filter((p) => !deal.get.includes(p.id)), ...(give as PlayerDef[])]
  const next = strength(s, deal.club, nextSquad)
  const use = (starters: Set<string>, p: PlayerDef): number => (starters.has(p.id) ? 1 : BENCH_USE)
  const gain = (give as PlayerDef[]).reduce((a, p) => a + worth(s, p) * use(next.starters, p), 0)
  const loss = (get as PlayerDef[]).reduce((a, p) => a + worth(s, p) * use(now.starters, p), 0)
  const ratio = gain / loss
  const base = { ratio, before: now.rating, after: next.rating }
  if (next.rating < now.rating - 0.5) return { ...base, ok: false, reason: `It would weaken their side (${now.rating.toFixed(1)} → ${next.rating.toFixed(1)}).` }
  if (ratio < PREMIUM) return { ...base, ok: false, reason: ratio < 0.7 ? 'Not interested: nowhere near enough.' : 'Close, but they want a bit more.' }
  return { ...base, ok: true, reason: 'They would take that.' }
}

/**
 * Make the deal: the players change clubs (their season's numbers, fitness and injuries go with
 * them), and both clubs' usual elevens are picked again. Your own pick is dropped if it had
 * anyone in it who's left.
 */
export function makeDeal(s: Season, deal: Deal): Season {
  const v = judge(s, deal)
  if (!v.ok) throw new Error(v.reason)
  const ids = [...deal.give, ...deal.get]
  const from = [...deal.give.map(() => s.userTeam), ...deal.get.map(() => deal.club)]
  const to = [...deal.give.map(() => deal.club), ...deal.get.map(() => s.userTeam)]
  const players = ids.map((id) => byId(s, id)!)
  let teams = s.teams.map((t, club) => {
    const staying = squadOf(t).filter((p) => !ids.includes(p.id))
    const arriving = players.filter((_, i) => to[i] === club)
    if (!arriving.length && staying.length === squadOf(t).length) return t
    // Newcomers take the lowest free shirt numbers from 12 up.
    const taken = new Set(staying.map((p) => p.shirt))
    const shirts: number[] = []
    for (let n = 12; shirts.length < arriving.length; n++) if (!taken.has(n)) shirts.push(n)
    const squad = [...staying, ...arriving.map((p, i) => ({ ...p, shirt: shirts[i] }))]
    return { ...t, players: squad.slice(0, 11), bench: squad.slice(11) }
  })
  const moved: Season = { ...s, teams, transfers: [...(s.transfers ?? []), { matchday: s.matchday, ids, from, to }] }
  // The usual eleven, in slot order, for both clubs: the staff's pick with the new squad.
  teams = moved.teams.map((t, club) => {
    if (club !== s.userTeam && club !== deal.club) return t
    const squad = squadOf(t)
    const xi = autoPick(moved, club).map((id) => squad.find((p) => p.id === id)!)
    return { ...t, players: xi, bench: squad.filter((p) => !xi.includes(p)) }
  })
  const lineup = s.lineup && s.lineup.some((id) => deal.give.includes(id)) ? null : s.lineup
  return { ...moved, teams, lineup }
}
