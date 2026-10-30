/**
 * Contracts and free agents (career mode, session 25). Pure, like the rest of the career.
 *
 * Every career player has a contract: the summer it ends and his wage. In his last year the manager
 * can renew him at the wage he asks (by his value, his room to grow while he's young, less once he's
 * old) or let him go; the other clubs' staff renew most of theirs (`staffKeeps`). Whoever's deal runs
 * out leaves in the summer as a free agent. The summer's free agents (expired, released, and a few
 * from elsewhere) sign for wages only: the other clubs replace their departures from them first, and
 * the manager can sign any left while a window is open, judged by what he does to the eleven
 * (`sideOf`, as for a transfer). A contract's length also prices a transfer (money.ts `valueOf`).
 */
import type { PlayerDef, Rng } from '../engine/index.ts'
import { type Season, playerRating, squadOf } from '../season/season.ts'
import { type Side, sideOf, windowOpen } from '../draft/transfers.ts'
import type { Person } from './career.ts'
import { marketValue, money, wage, yearsLeft } from './money.ts'

export interface Contract {
  /** The summer it runs out (the year): a deal to 2028 ends after the 2027–28 season. */
  until: number
  /** £k a week. */
  wage: number
  /** The manager has told him he won't be offered a new one. */
  leaving?: boolean
}

/** A player without a club, who signs for wages only. */
export interface FreeAgent {
  player: PlayerDef
  person: Person
  /** What he asks, £k a week. */
  wage: number
  /** The club he left (an index into Season.teams), or null if he's from elsewhere. */
  from: number | null
}

/** A season's free signing, for the Deals tab. */
export interface FreeSigning {
  matchday: number
  id: string
  club: number
  wage: number
}

/** The year a season starts. */
export const seasonYear = (s: Season): number => Number(s.startDate.slice(0, 4))

/** The most a squad can hold after a signing (as for a transfer). */
export const FREE_SQUAD_MAX = 26
/** Free agents kept in the pool, the best of them. */
export const POOL_MAX = 60
/** A free agent asks a little more than he'd get renewing: there's no fee to pay for him. */
const FREE_PREMIUM = 1.1

/** How long a new deal runs, by his age: four years for a young man, a year at a time from 33. */
export function contractLength(age: number): number {
  return age <= 28 ? 4 : age <= 30 ? 3 : age <= 32 ? 2 : 1
}

/**
 * The wage he asks for a new deal, £k a week: by his value (a young man's room to grow counts),
 * less once he's 33 and knows it.
 */
export function askedWage(p: PlayerDef, who: Person): number {
  const v = marketValue(p, who)
  return Math.max(3, Math.round((3 + v * 2.5) * (who.age >= 33 ? 0.8 : 1)))
}

/** A free agent's asking wage. */
export const freeAgentWage = (p: PlayerDef, who: Person): number => Math.round(askedWage(p, who) * FREE_PREMIUM)

/** A contract for a player a career starts with: one to five years left, shorter for older men; today's wage. */
export function firstContract(rng: Rng, p: PlayerDef, who: Person, year: number): Contract {
  const most = who.age <= 23 ? 5 : who.age <= 29 ? 4 : who.age <= 32 ? 3 : 2
  return { until: year + rng.int(1, most), wage: wage(p, who) }
}

/** A new signing's or academy player's deal, from next season (`year` is the season it starts). */
export const newContract = (p: PlayerDef, who: Person, year: number, years = contractLength(who.age)): Contract => ({
  until: year + years,
  wage: wage(p, who),
})

// ---------------------------------------------------------------------------
// Renewals

/** In the last year of his deal (this season is the last). */
export const inLastYear = (s: Season, id: string): boolean => (yearsLeft(s, s.career?.people[id]) ?? 99) <= 1

/** The manager's players whose deals end this summer, soonest first. */
export function expiringAt(s: Season, club = s.userTeam): PlayerDef[] {
  return squadOf(s.teams[club]).filter((p) => inLastYear(s, p.id))
}

/** What he asks to stay: a wage and a length, from next season. */
export function renewalTerms(s: Season, id: string): { wage: number; years: number; until: number } {
  const who = s.career!.people[id]
  const years = contractLength(who.age + 1)
  return { wage: askedWage(byId(s, id), who), years, until: seasonYear(s) + 1 + years }
}

/** He signs a new deal on his terms (the new wage from now on). */
export function renew(s: Season, id: string): Season {
  const c = s.career!
  if (!inLastYear(s, id)) throw new Error('not in his last year')
  const { wage, until } = renewalTerms(s, id)
  return { ...s, career: { ...c, people: { ...c.people, [id]: { ...c.people[id], contract: { until, wage } } } } }
}

/** He's told he won't get a new deal (he leaves in the summer); `stay` takes it back. */
export function letGo(s: Season, id: string, leaving = true): Season {
  const c = s.career!
  const who = c.people[id]
  if (!who.contract) return s
  const contract = { ...who.contract }
  if (leaving) contract.leaving = true
  else delete contract.leaving
  return { ...s, career: { ...c, people: { ...c.people, [id]: { ...who, contract } } } }
}

/**
 * Whether a club's staff offer him a new deal, by where he ranks in the squad (0 is the best) and
 * his age: nearly every regular, most of the rest of the squad, young players with room to grow;
 * an old man only if he still starts, and not always then.
 */
export function staffKeeps(rank: number, age: number, room: number, rng: Rng): boolean {
  if (age >= 34) return rank < 11 && rng.chance(0.5)
  if (rank < 14) return rng.chance(age >= 32 ? 0.7 : 0.92)
  if (rank < 18) return rng.chance(age <= 30 ? 0.7 : 0.35)
  return age <= 22 && room >= 4 && rng.chance(0.8)
}

/** How the staff rank a squad: overall, and some of a young player's room to grow. */
export function staffWorth(p: PlayerDef, who: Person): number {
  return playerRating(p) + (who.age < 23 ? 0.3 * (who.potential - playerRating(p)) : 0)
}

/**
 * The staff deal with the manager's expiring contracts as they would at another club: the ones
 * they'd keep are renewed, the rest let go (the manager's own decisions stand).
 */
export function staffRenewals(s: Season, rng: Rng): Season {
  const people = s.career!.people
  const squad = squadOf(s.teams[s.userTeam])
  const ranked = [...squad].sort((a, b) => staffWorth(b, people[b.id]) - staffWorth(a, people[a.id]))
  let out = s
  for (const p of expiringAt(s)) {
    const who = people[p.id]
    if (who.contract?.leaving) continue
    const keep = staffKeeps(ranked.indexOf(p), who.age + 1, who.potential - playerRating(p), rng)
    out = keep ? renew(out, p.id) : letGo(out, p.id)
  }
  return out
}

// ---------------------------------------------------------------------------
// Free agents

const byId = (s: Season, id: string): PlayerDef => s.teams.flatMap(squadOf).find((p) => p.id === id)!

/** The season with someone not yet in it fit and available, so the staff can pick him in a probe. */
export function withCondition(s: Season, ps: PlayerDef[]): Season {
  const condition = { ...s.condition }
  for (const p of ps) condition[p.id] ??= { fitness: 1, injuredUntil: 0 }
  return { ...s, condition }
}

export interface FreeVerdict {
  ok: boolean
  reason: string
  /** What signing him does to the manager's eleven. */
  you: Side | null
  wage: number
  years: number
}

/** Whether the manager can sign a free agent, and on what terms. */
export function judgeFreeAgent(s: Season, id: string): FreeVerdict {
  const fa = s.career?.freeAgents?.find((f) => f.player.id === id)
  const years = fa ? contractLength(fa.person.age) : 0
  const no = (reason: string, you: Side | null = null): FreeVerdict => ({ ok: false, reason, you, wage: fa?.wage ?? 0, years })
  if (!fa) return no('He has signed elsewhere.')
  if (!windowOpen(s)) return no('Free agents can sign while a window is open.')
  const squad = squadOf(s.teams[s.userTeam])
  if (squad.length >= FREE_SQUAD_MAX) return no(`Your squad is full (${FREE_SQUAD_MAX}).`)
  const you = sideOf(withCondition(s, [fa.player]), s.userTeam, [], [fa.player])
  const season = (fa.wage * 52) / 1000
  const cash = s.career!.finance?.cash[s.userTeam] ?? Infinity
  if (cash < season) return no(`You can't afford his wages: ${money(season)} a season.`, you)
  // A good player wants to play: he won't sign to sit on the bench.
  if (!you.after.xi.includes(fa.player) && playerRating(fa.player) >= you.before.rating - 2)
    return no("He wants first-team football, and he wouldn't start for you.", you)
  return { ok: true, reason: `He'd sign for £${fa.wage}k a week, for ${years === 1 ? 'a year' : `${years} years`}.`, you, wage: fa.wage, years }
}

/** A player joins a club (no fee): a shirt number, his fitness and season line, and a contract. */
export function addToClub(s: Season, club: number, p: PlayerDef, who: Person): Season {
  const t = s.teams[club]
  const taken = new Set(squadOf(t).map((q) => q.shirt))
  let shirt = 12
  while (taken.has(shirt)) shirt++
  const joined = { ...p, shirt }
  const c = s.career!
  return {
    ...s,
    teams: s.teams.map((x, i) => (i === club ? { ...x, bench: [...x.bench, joined] } : x)),
    condition: { ...s.condition, [p.id]: s.condition[p.id] ?? { fitness: 1, injuredUntil: 0 } },
    stats: { ...s.stats, [p.id]: s.stats[p.id] ?? { apps: 0, goals: 0, assists: 0, ratings: 0 } },
    career: { ...c, people: { ...c.people, [p.id]: who } },
  }
}

/** The manager signs a free agent on his terms. */
export function signFreeAgent(s: Season, id: string): Season {
  const v = judgeFreeAgent(s, id)
  if (!v.ok) throw new Error(v.reason)
  const fa = s.career!.freeAgents!.find((f) => f.player.id === id)!
  // The deal runs from this season: a year's deal ends next summer.
  const contract: Contract = { until: seasonYear(s) + v.years, wage: v.wage }
  const added = addToClub(s, s.userTeam, fa.player, { ...fa.person, contract })
  const c = added.career!
  return {
    ...added,
    career: {
      ...c,
      freeAgents: c.freeAgents!.filter((f) => f.player.id !== id),
      signings: [...(c.signings ?? []), { matchday: s.matchday, id, club: s.userTeam, wage: v.wage }],
    },
  }
}
