/**
 * Career mode (club mode, season after season): players' ages and hidden potential, how they
 * develop and decline over a summer, retirements, the academy's intake, signings that replace
 * retirements, the board's target, and the history of seasons gone. Pure and deterministic, like
 * the season: `nextSeason` turns a finished season into the next one.
 */
import { type Attributes, OVERALL_WEIGHTS, type PlayerDef, type Role, type TeamDef, Rng, ability, freshName, makePlayerAt } from '../engine/index.ts'
import { type Finance, ROLE_OFFSET, WAGE_BUDGET, settle, startFinance, wageAt } from './money.ts'
import { type Cup, type Season, avgRating, autoPick, createSeason, matchdays, playerRating, squadOf, table } from '../season/season.ts'
import { POINT_VALUE, sideOf } from '../draft/transfers.ts'
import {
  type Contract,
  type FreeAgent,
  type FreeSigning,
  POOL_MAX,
  addToClub,
  askedWage,
  contractLength,
  firstContract,
  freeAgentWage,
  newContract,
  seasonYear,
  staffKeeps,
  staffWorth,
  withCondition,
} from './contracts.ts'
import { cupRun, cupSchedule, domesticWinner, startCup } from './cup.ts'

/** What the game knows about a player beyond his attributes. */
export interface Person {
  age: number
  /** The overall he could reach (hidden from the manager). */
  potential: number
  /** His overall's change over the summer just gone (unset in a career's first season). */
  change?: number
  /** Came up from the academy this summer. */
  academy?: boolean
  /** His deal (from save version 5; every career player has one). */
  contract?: Contract
}

export type Aim = 'title' | 'topHalf' | 'survive'
export const AIM_LINE: Record<Aim, string> = {
  title: 'Challenge for the title',
  topHalf: 'Finish in the top half',
  survive: 'Avoid relegation',
}

/** A player's season, kept when the season is over. */
export interface SeasonLine {
  club: number
  age: number
  overall: number
  apps: number
  starts: number
  goals: number
  assists: number
  rating: number | null
}

export interface PastSeason {
  /** 1 for a career's first season. */
  number: number
  /** The year it started. */
  year: number
  place: number
  points: number
  aim: Aim
  met: boolean
  champion: number
  /** The league's top scorer, and the manager's club's. */
  topScorer: { name: string; club: number; goals: number } | null
  clubTopScorer: { name: string; goals: number } | null
  trophies: string[]
  lines: Record<string, SeasonLine>
  /** The domestic cup (from save version 5): who won it, and how far the manager's club went. */
  cup?: { winner: number; run: string }
  /** The manager's matches that season, league and cup (from save version 5). */
  record?: { won: number; drawn: number; lost: number }
}

/** What happened at the manager's club over the summer, for the hub. */
export interface Summer {
  retired: { name: string; age: number }[]
  academy: string[]
  signed: string[]
  released: string[]
  /** Whose contracts ran out (they left as free agents). */
  expired?: string[]
}

export interface Career {
  /** This season's number, from 1. */
  number: number
  people: Record<string, Person>
  aim: Aim
  history: PastSeason[]
  /** Each club's strength when the career began (its eleven's overall), which signings keep up. */
  levels: number[]
  /** Each club's money (from stage 2; a save without it gets it on loading). */
  finance?: Finance
  summer?: Summer
  /** The summer's free agents still unsigned (from save version 5). */
  freeAgents?: FreeAgent[]
  /** Free agents signed this season. */
  signings?: FreeSigning[]
  /** This season's domestic cup (from save version 5; an upgraded save gets one from its next season). */
  cup?: Cup
}

/** A squad's largest size: the eleven, nine on the bench and a few reserves. */
export const SQUAD_MAX = 24
const TITLE_PLACES = 2
/**
 * A signing's overall against his club's level; an academy player's against it (from, and a range
 * up), and his potential against the league's (overalls on the draft's FIFA-like scale, session 22:
 * a point is 0.8 of the old club scale's, so these are 0.8 of what they were).
 */
const SIGNING_LEVEL = -3
const ACADEMY_FROM = -11
const ACADEMY_RANGE = 8
const GEM_FLOOR = -10
const GEM_RANGE = 19
const DRIFT_PULL = 6
/** The most a player improves in one summer. */
const MAX_GROWTH = 5
/** The bottom places a side must stay out of: three of twenty, two of ten. */
export const relegationPlaces = (n: number): number => Math.round(n * 0.15)

// ---------------------------------------------------------------------------
// Starting out

/** A new career from a club-mode season: everyone gets an age and a potential. */
export function startCareer(s: Season): Season {
  const rng = new Rng(s.seed * 31 + 7)
  const people: Record<string, Person> = {}
  for (const t of s.teams) {
    for (const p of t.players) people[p.id] = firstPerson(rng, p, 27, 3.5)
    for (const p of t.bench) people[p.id] = firstPerson(rng, p, 25, 4.5)
  }
  const year = seasonYear(s)
  for (const p of s.teams.flatMap(squadOf)) people[p.id].contract = firstContract(rng, p, people[p.id], year)
  const career: Career = { number: 1, people, aim: 'topHalf', history: [], levels: s.teams.map((_, i) => elevenRating(s, i)), freeAgents: [] }
  const started = { ...s, career: { ...career, aim: aimFor(s, s.userTeam) } }
  return { ...started, career: { ...started.career, finance: startFinance(started), cup: startCup(started) } }
}

function firstPerson(rng: Rng, p: PlayerDef, mean: number, sd: number): Person {
  const age = Math.round(Math.max(17, Math.min(35, mean + rng.gauss() * sd)))
  const now = playerRating(p)
  const room = age < 26 ? Math.max(0, (26 - age) * 0.8 + rng.gauss() * 2) : 0
  return { age, potential: Math.round(now + room) }
}

/** The board's target for a club, from where its squad ranks in the league. */
export function aimFor(s: Season, club: number): Aim {
  const ratings = s.teams.map((_, i) => elevenRating(s, i))
  const rank = 1 + ratings.filter((r, i) => r > ratings[club] || (r === ratings[club] && i < club)).length
  const n = s.teams.length
  return rank <= Math.max(1, Math.round(n * 0.15)) ? 'title' : rank <= n / 2 ? 'topHalf' : 'survive'
}

/** Whether a finish meets the target. */
export function aimMet(aim: Aim, place: number, n: number): boolean {
  return aim === 'title' ? place <= TITLE_PLACES : aim === 'topHalf' ? place <= n / 2 : place <= n - relegationPlaces(n)
}

// ---------------------------------------------------------------------------
// Development

const KEEPER_SUBS: (keyof Attributes)[] = ['diving', 'handling', 'reflexes', 'gkPositioning', 'kicking']
/** Ageing takes the legs first. */
const DECLINE_WEIGHT: Partial<Record<keyof Attributes, number>> = {
  sprintSpeed: 4,
  acceleration: 4,
  agility: 2.5,
  stamina: 2.5,
  jumping: 1.5,
  reflexes: 2,
  diving: 2,
}

/** A young player fills out: his pace and physique come on more than the rest, as decline takes them first. */
const YOUNG_GROWTH_WEIGHT: Partial<Record<keyof Attributes, number>> = {
  sprintSpeed: 2.5,
  acceleration: 2.5,
  agility: 1.5,
  stamina: 2,
  strength: 2,
  jumping: 1.5,
}

/** How readily a card-made player's legs and physique move, at the least (1 is an even share). */
const BODY_RELEVANCE = 1.5

/**
 * His attributes moved a point at a time until his overall is `target` (or as near as 1-20 allows):
 * the legs first on the way down, and for a young player (`young`) on the way up too.
 */
export function shiftTo(p: PlayerDef, target: number, rng: Rng, declining: boolean, young = false): PlayerDef {
  const attrs = { ...p.attrs }
  const subs = p.role === 'GK' ? KEEPER_SUBS : (Object.keys(attrs) as (keyof Attributes)[]).filter((k) => !KEEPER_SUBS.includes(k))
  const def = { ...p, attrs }
  // A card-made player's overall is his position's skills (`OVERALL_WEIGHTS`): those move most, the
  // rest a little, but the legs and physique as much as ever, whether or not they count in his
  // overall (an even average of everything for older players, so all alike).
  const weights = OVERALL_WEIGHTS[p.role]
  const total = Object.values(weights).reduce((a, b) => a + b, 0)
  const bodily = (k: keyof Attributes): boolean => k in DECLINE_WEIGHT || k in YOUNG_GROWTH_WEIGHT
  const relevance = Object.fromEntries(
    subs.map((k) => [k, p.card ? Math.max(bodily(k) ? BODY_RELEVANCE : 0, 0.3 + ((weights[k] ?? 0) / total) * subs.length) : 1]),
  ) as Record<keyof Attributes, number>
  for (let i = 0; i < 400; i++) {
    const dir = Math.sign(target - playerRating(def))
    if (dir === 0) break
    const open = subs.filter((k) => (dir > 0 ? attrs[k] < 20 : attrs[k] > 1))
    if (!open.length) break
    const w = open.map((k) => (declining && dir < 0 ? (DECLINE_WEIGHT[k] ?? 0.6) : young && dir > 0 ? (YOUNG_GROWTH_WEIGHT[k] ?? 1) : 1) * relevance[k])
    let r = rng.next() * w.reduce((a, b) => a + b, 0)
    let k = open[open.length - 1]
    for (let j = 0; j < open.length; j++) if ((r -= w[j]) < 0) {
      k = open[j]
      break
    }
    attrs[k] += dir
  }
  // A keeper's legs go too, though it doesn't show in his overall.
  if (declining && p.role === 'GK' && rng.chance(0.5)) {
    attrs.sprintSpeed = Math.max(1, attrs.sprintSpeed - 1)
    attrs.acceleration = Math.max(1, attrs.acceleration - 1)
  }
  return def
}

/** How he played: his share of the league's minutes and his average rating. */
export interface Played {
  share: number
  rating: number | null
}

/**
 * His overall's change over a summer, before it's rounded into attributes. Young players close a
 * share of the gap to their potential, more if they played and played well; 27-30 hold; from 31
 * they decline, faster each year (keepers two years later).
 */
export function development(age: number, now: number, potential: number, played: Played, keeper: boolean, rng: Rng): number {
  const a = keeper ? age - 2 : age
  const noise = rng.gauss() * 0.65
  if (a <= 26) {
    const gap = Math.max(0, potential - now)
    const rate = a <= 20 ? 0.32 : a <= 23 ? 0.26 : 0.18
    const form = played.rating === null ? 0 : Math.max(-0.15, Math.min(0.2, (played.rating - 6.75) * 0.4))
    const minutes = 0.5 + 0.6 * Math.min(1, played.share) + form
    return Math.min(gap + 0.8, MAX_GROWTH, gap * rate * minutes + noise)
  }
  if (a <= 30) return noise * 0.8 - (a === 30 ? 0.25 : 0)
  const fall = a === 31 ? 0.8 : a === 32 ? 1.3 : a === 33 ? 1.85 : a === 34 ? 2.4 : 2.9
  return -Math.max(0, fall + noise)
}

/** Whether he hangs up his boots this summer (at his new age). */
function retires(age: number, keeper: boolean, played: Played, rng: Rng): boolean {
  const a = keeper ? age - 2 : age
  if (a < 34) return false
  if (a >= 38) return true
  return rng.chance(Math.min(0.95, 0.25 + 0.2 * (a - 34) + (played.share < 0.25 ? 0.2 : 0)))
}

// ---------------------------------------------------------------------------
// The summer

/** The academy's roles: every line, keepers less often. */
const ACADEMY_ROLES: Role[] = ['GK', 'CB', 'CB', 'FB', 'FB', 'DM', 'CM', 'CM', 'WM', 'W', 'W', 'ST', 'ST']

/** The league's strength: its elevens' average overall. */
export const leagueLevel = (s: Season): number => s.teams.reduce((n, _, i) => n + elevenRating(s, i), 0) / s.teams.length

/** A club's strength: the overall of the eleven the staff would pick with everyone fit. */
export function elevenRating(s: Season, club: number): number {
  const fit = { ...s, matchday: 1, condition: Object.fromEntries(squadOf(s.teams[club]).map((p) => [p.id, { fitness: 1, injuredUntil: 0 }])) }
  const squad = squadOf(s.teams[club])
  const xi = autoPick(fit, club).map((id) => squad.find((p) => p.id === id)!)
  return xi.reduce((n, p) => n + playerRating(p), 0) / xi.length
}

/** Everyone's average overall, squads and all. */
export const squadsLevel = (teams: TeamDef[]): number => {
  const all = teams.flatMap(squadOf)
  return all.reduce((n, p) => n + playerRating(p), 0) / all.length
}

/** A made-up player at an overall: his card at about it, then moved there exactly. */
function madeAt(rng: Rng, id: string, name: string, shirt: number, role: Role, overall: number): PlayerDef {
  return shiftTo(makePlayerAt(rng, id, name, shirt, role, overall), overall, rng, false)
}

/** Free agents made up each summer: players from elsewhere, around the league's level. */
const OUTSIDE_FREE_AGENTS = 6
/** A replacement signing from the free agents: within this of the overall the club would sign at. */
const FREE_FIT = 3
/** The fewest players another club keeps to stay within its wage budget. */
const AI_MIN_SQUAD = 20
/** The fewest players the manager's club starts a season with (the staff sign to it if he's let too many go). */
export const MANAGER_MIN = 16

/**
 * The season over: on to the next, with the same clubs, a summer's development, contracts run out
 * or renewed, the free agents' market, and a fresh fixture list and cup.
 */
export function nextSeason(s: Season): Season {
  const c = s.career
  if (!c) throw new Error('not a career')
  const rng = new Rng(s.seed * 104729 + c.number * 7919)
  const history = [...c.history, pastSeason(s)]
  // The season's accounts, before anyone leaves: income and prize money in, wages out.
  const places = new Array<number>(s.teams.length)
  table(s).forEach((r, i) => (places[r.team] = i + 1))
  const finance = settle(s, c.finance ?? startFinance(s), places)
  const full = matchdays(s) * 90
  const people: Record<string, Person> = {}
  const summer: Summer = { retired: [], academy: [], signed: [], released: [], expired: [] }
  const names = new Set([...s.teams.flatMap(squadOf), ...(c.freeAgents ?? []).map((f) => f.player)].map((p) => p.name))
  /** A new name: nobody in the league has it, nobody at his club shares the surname. */
  const fresh = (squad: PlayerDef[]): string => {
    let n = freshName(rng, squad.map((p) => p.name))
    while (names.has(n)) n = freshName(rng, squad.map((p) => p.name))
    names.add(n)
    return n
  }
  // The academy's standard is the league's when the career began, so the league can't drift.
  // A league that has grown stronger than it began finds its newcomers a little weaker, and the
  // other way round, so the league neither inflates nor drains over the years.
  const start = c.levels.reduce((a, b) => a + b, 0) / c.levels.length
  const drift = leagueLevel(s) - start
  const level = start - DRIFT_PULL * drift
  /** The season just finished started in `was`; the new one starts a year on. */
  const was = seasonYear(s)
  const year = was + 1
  /** This summer's free agents: whose deals ran out, whoever was released, and a few from elsewhere. */
  const pool: FreeAgent[] = []
  /** What each club has to replace (the manager signs his own), and at what overall. */
  const wanted: { role: Role; overall: number }[][] = s.teams.map(() => [])
  const freeAgent = (p: PlayerDef, who: Person, from: number | null): FreeAgent => ({
    player: p,
    person: { age: who.age, potential: who.potential, ...(who.change === undefined ? {} : { change: who.change }) },
    wage: freeAgentWage(p, who),
    from,
  })

  const teams = s.teams.map((t, club) => {
    const mine = club === s.userTeam
    const squad: PlayerDef[] = []
    const left: PlayerDef[] = []
    for (const p of squadOf(t)) {
      const who = c.people[p.id]
      const st = s.stats[p.id]
      const played: Played = { share: (st?.minutes ?? 0) / full, rating: avgRating(st) }
      const now = playerRating(p)
      const age = who.age + 1
      const keeper = p.role === 'GK'
      const delta = development(who.age, now, who.potential, played, keeper, rng)
      const next = shiftTo(p, Math.max(1, Math.round(now + delta)), rng, delta < 0, who.age <= 23)
      if (retires(age, keeper, played, rng)) {
        left.push(p)
        if (mine) summer.retired.push({ name: p.name, age })
        continue
      }
      squad.push(next)
      // A deal that has run out is settled below.
      people[p.id] = { age, potential: who.potential, change: playerRating(next) - now, contract: who.contract ?? newContract(next, { ...who, age }, year, 2) }
    }
    // Contracts that ran out this summer: the manager's go (he renewed those he wanted); the
    // other clubs' staff keep most of theirs.
    // They keep within their wage budget: the regulars are renewed whatever, the rest only if there's room.
    const budget = (finance.income[club] * WAGE_BUDGET * 1000) / 52
    const expires = (p: PlayerDef): boolean => people[p.id].contract!.until <= was + 1
    let committed = squad.filter((p) => !expires(p)).reduce((n, p) => n + people[p.id].contract!.wage, 0)
    const ranked = [...squad].sort((a, b) => staffWorth(b, people[b.id]) - staffWorth(a, people[a.id]))
    ranked.forEach((p, rank) => {
      const who = people[p.id]
      if (!expires(p)) return
      const asked = askedWage(p, who)
      if (!mine && staffKeeps(rank, who.age, who.potential - playerRating(p), rng) && (rank < 11 || committed + asked <= budget)) {
        people[p.id] = { ...who, contract: { until: year + contractLength(who.age), wage: asked } }
        committed += asked
        return
      }
      squad.splice(squad.indexOf(p), 1)
      left.push(p)
      delete people[p.id]
      pool.push(freeAgent(p, who, club))
      if (mine) summer.expired!.push(p.name)
    })
    const shirts = new Set(squad.map((p) => p.shirt))
    const shirt = (): number => {
      let n = 12
      while (shirts.has(n)) n++
      shirts.add(n)
      return n
    }
    // A signing for each player gone, at about the club's own level, in the same position (made
    // once the free agents are known; the manager signs his own, in the market).
    if (!mine)
      for (const p of left)
        wanted[club].push({ role: p.role, overall: Math.round(c.levels[club] - DRIFT_PULL * drift + SIGNING_LEVEL + ROLE_OFFSET[p.role] + rng.gauss() * 2) })
    // The academy: two or three a summer, 16 to 18, a long way off the first team, now and then a gem.
    const intake = rng.int(2, 3)
    for (let i = 0; i < intake; i++) {
      // Below the club's own first team (a weak club's kids are weaker), however high they may go.
      const lift = ACADEMY_FROM + rng.next() * ACADEMY_RANGE
      const potential0 = level + GEM_FLOOR + GEM_RANGE * rng.next() ** 2
      // A keeper if the club is short of them, otherwise any position.
      const role = squad.filter((p) => p.role === 'GK').length < 2 ? 'GK' : rng.pick(ACADEMY_ROLES)
      const overall = Math.round(c.levels[club] - DRIFT_PULL * drift + lift + ROLE_OFFSET[role])
      const potential = Math.max(overall + 2, Math.round(potential0 + ROLE_OFFSET[role]))
      const q = madeAt(rng, `${s.seed}-c${c.number}-${club}-a${i}`, fresh(squad), shirt(), role, overall)
      squad.push(q)
      const who: Person = { age: rng.int(16, 18), potential, academy: true }
      people[q.id] = { ...who, contract: newContract(q, who, year, 3) }
      if (mine) summer.academy.push(q.id)
    }
    // The manager's club signs nobody on its own, unless he's let so many go that it can't put out
    // a side: then the staff fill it to the least it needs, in the places that were left.
    if (mine)
      for (let i = 0; squad.length + wanted[club].length < MANAGER_MIN; i++) {
        const role = left[i]?.role ?? rng.pick(ACADEMY_ROLES)
        wanted[club].push({ role, overall: Math.round(c.levels[club] - DRIFT_PULL * drift + SIGNING_LEVEL + ROLE_OFFSET[role] + rng.gauss() * 2) })
      }
    // Too many (the places still to fill counted): the least promising of 19 and over go, as the
    // staff judge it, never the second keeper. They're free agents now.
    while (squad.length + wanted[club].length > SQUAD_MAX) {
      const keepers = squad.filter((p) => p.role === 'GK').length
      const out = squad
        .filter((p) => people[p.id].age >= 19 && (p.role !== 'GK' || keepers > 2))
        .sort((a, b) => staffWorth(a, people[a.id]) - staffWorth(b, people[b.id]))[0]
      if (!out) break
      squad.splice(squad.indexOf(out), 1)
      pool.push(freeAgent(out, people[out.id], club))
      delete people[out.id]
      if (mine) summer.released.push(out.name)
    }
    // Over its wage budget (the places still to fill counted at what they'd cost): a club leaves
    // places unfilled, then lets its least promising go, down to twenty.
    const bill = (): number => squad.reduce((n, p) => n + people[p.id].contract!.wage, 0) + wanted[club].reduce((n, w) => n + wageAt(w.overall, w.role), 0)
    while (!mine && bill() > budget && squad.length + wanted[club].length > AI_MIN_SQUAD) {
      const keepers = squad.filter((p) => p.role === 'GK').length
      // (Never the place of a second keeper.)
      const skip = wanted[club].findLastIndex((w) => w.role !== 'GK' || keepers >= 2)
      if (skip >= 0) {
        wanted[club].splice(skip, 1)
        continue
      }
      const out = squad
        .filter((p) => people[p.id].age >= 19 && (p.role !== 'GK' || keepers > 2))
        .sort((a, b) => staffWorth(a, people[a.id]) - staffWorth(b, people[b.id]))[0]
      if (!out) break
      squad.splice(squad.indexOf(out), 1)
      pool.push(freeAgent(out, people[out.id], club))
      delete people[out.id]
    }
    return { ...t, players: squad.slice(0, 11), bench: squad.slice(11) }
  })
  // A few free agents from elsewhere, around the league's level, in their twenties and thirties.
  for (let i = 0; i < OUTSIDE_FREE_AGENTS; i++) {
    const role = rng.pick(ACADEMY_ROLES)
    const overall = Math.round(level - 8 + rng.next() * 9 + ROLE_OFFSET[role])
    const p = madeAt(rng, `${s.seed}-c${c.number}-f${i}`, fresh([]), 30, role, overall)
    pool.push(freeAgent(p, { age: rng.int(23, 32), potential: overall }, null))
  }

  const seed = (s.seed * 7 + c.number * 7919) % 1_000_003
  const base = createSeason(seed, s.userTeam, new Date(Date.UTC(year, 0, 1)), teams)
  let next: Season = { ...base, career: { number: c.number + 1, people, aim: 'topHalf', history, levels: c.levels, finance, summer } }
  // The other clubs fill their places: from the free agents if one fits (near the overall they'd
  // sign at; the one who does most for their eleven for his wages), otherwise a signing from elsewhere.
  // (The manager's club, filled only if he's left it short, leaves the free agents to him.)
  const free = [...pool]
  for (const club of rng.shuffle(s.teams.map((_, i) => i))) {
    wanted[club].forEach((w, i) => {
      if (club === s.userTeam) {
        const q = madeAt(rng, `${s.seed}-c${c.number}-${club}-s${i}`, fresh(squadOf(next.teams[club])), 30, w.role, w.overall)
        const who: Person = { age: rng.int(24, 29), potential: w.overall }
        next = addToClub(next, club, q, { ...who, contract: newContract(q, who, year, 2) })
        summer.signed.push(q.name)
        return
      }
      const cash = next.career!.finance!.cash[club]
      // (Nobody at a club shares a surname: it reads as one man on screen.)
      const surnames = new Set(squadOf(next.teams[club]).map((p) => p.name.split(' ').at(-1)))
      let pick: FreeAgent | null = null
      let best = -Infinity
      for (const f of free) {
        if (f.player.role !== w.role || Math.abs(playerRating(f.player) - w.overall) > FREE_FIT || f.person.age > 32) continue
        if (surnames.has(f.player.name.split(' ').at(-1))) continue
        const wages = (f.wage * 52) / 1000
        if (wages > cash) continue
        const v = sideOf(withCondition(next, [f.player]), club, [], [f.player]).value * POINT_VALUE - wages
        if (v > best) {
          best = v
          pick = f
        }
      }
      if (pick) {
        free.splice(free.indexOf(pick), 1)
        next = addToClub(next, club, pick.player, { ...pick.person, contract: { until: year + contractLength(pick.person.age), wage: pick.wage } })
        return
      }
      const q = madeAt(rng, `${s.seed}-c${c.number}-${club}-s${i}`, fresh(squadOf(next.teams[club])), 30, w.role, w.overall)
      const who: Person = { age: rng.int(24, 29), potential: w.overall }
      next = addToClub(next, club, q, { ...who, contract: newContract(q, who, year, rng.int(2, 4)) })
    })
  }
  // Each club's eleven picked afresh from who's there now.
  const picked = next.teams.map((t, club) => {
    const squad = squadOf(t)
    const xi = autoPick(next, club).map((id) => squad.find((p) => p.id === id)!)
    return { ...t, players: xi, bench: squad.filter((p) => !xi.includes(p)) }
  })
  next = { ...next, teams: picked }
  // The free agents left for the manager: the best of them.
  const freeAgents = free.sort((a, b) => playerRating(b.player) - playerRating(a.player)).slice(0, POOL_MAX)
  return { ...next, career: { ...next.career!, aim: aimFor(next, s.userTeam), freeAgents, signings: [], cup: startCup(next) } }
}

/** A finished season, for the history. */
export function pastSeason(s: Season): PastSeason {
  const c = s.career!
  const rows = table(s)
  const place = rows.findIndex((r) => r.team === s.userTeam) + 1
  const lines: Record<string, SeasonLine> = {}
  let top: PastSeason['topScorer'] = null
  let mine: PastSeason['clubTopScorer'] = null
  s.teams.forEach((t, club) => {
    for (const p of squadOf(t)) {
      const st = s.stats[p.id]
      if (!st?.apps) continue
      const r = avgRating(st)
      lines[p.id] = {
        club,
        age: c.people[p.id]?.age ?? 0,
        overall: playerRating(p),
        apps: st.apps,
        starts: st.starts ?? st.apps,
        goals: st.goals,
        assists: st.assists,
        rating: r === null ? null : Math.round(r * 100) / 100,
      }
      if (st.goals > 0 && (!top || st.goals > top.goals)) top = { name: p.name, club, goals: st.goals }
      if (club === s.userTeam && st.goals > 0 && (!mine || st.goals > mine.goals)) mine = { name: p.name, goals: st.goals }
    }
  })
  const cup = c.cup
  const winner = cup ? domesticWinner(cup) : null
  const cupWon = winner === s.userTeam
  const record = recordOf(s)
  return {
    number: c.number,
    year: Number(s.startDate.slice(0, 4)),
    place,
    points: rows[place - 1].points,
    aim: c.aim,
    met: aimMet(c.aim, place, s.teams.length),
    champion: rows[0].team,
    topScorer: top,
    clubTopScorer: mine,
    trophies: [...(place === 1 ? ['League title'] : []), ...(cupWon ? [CUP_TROPHY] : [])],
    lines,
    ...(cup && winner !== null ? { cup: { winner, run: cupRun(cup, s.userTeam) ?? '' } } : {}),
    record,
  }
}

/** The domestic cup, in a season's trophies. */
export const CUP_TROPHY = 'Cup'

/** The manager's career so far, from its finished seasons. */
export interface ManagerRecord {
  seasons: number
  titles: number
  cups: number
  /** League and cup matches (seasons saved before records were kept count none). */
  won: number
  drawn: number
  lost: number
  played: number
  /** Seasons the board's target was met. */
  met: number
  /** Best league finish. */
  best: number
}

export function managerRecord(history: PastSeason[]): ManagerRecord {
  const r: ManagerRecord = { seasons: history.length, titles: 0, cups: 0, won: 0, drawn: 0, lost: 0, played: 0, met: 0, best: 0 }
  for (const h of history) {
    if (h.trophies.includes('League title')) r.titles++
    if (h.trophies.includes(CUP_TROPHY)) r.cups++
    if (h.met) r.met++
    r.best = r.best ? Math.min(r.best, h.place) : h.place
    if (h.record) {
      r.won += h.record.won
      r.drawn += h.record.drawn
      r.lost += h.record.lost
    }
  }
  r.played = r.won + r.drawn + r.lost
  return r
}

/** The manager's matches in a season, league and cup: won, drawn, lost (a tie on penalties is drawn). */
export function recordOf(s: Season): { won: number; drawn: number; lost: number } {
  const r = { won: 0, drawn: 0, lost: 0 }
  for (const f of [...s.fixtures, ...(s.career?.cup?.fixtures ?? [])]) {
    if (!f.result || (f.home !== s.userTeam && f.away !== s.userTeam)) continue
    const [h, a] = f.result.score
    const d = f.home === s.userTeam ? h - a : a - h
    if (d > 0) r.won++
    else if (d < 0) r.lost++
    else r.drawn++
  }
  return r
}

// ---------------------------------------------------------------------------
// Saves

/**
 * An older save brought up to version 5 (contracts, free agents and the cup: `withContracts`). Version 2 (before careers): club mode becomes a career's
 * first season. Version 3: club players' overalls were on the old club scale (~45-65, an even
 * average); they're now on the draft's (`cardOverall`), so what was kept on the old scale (each
 * man's potential and last change, the clubs' starting levels, past seasons' overalls) is moved
 * across: a point of the old scale is 0.8 of the new, from where he (or the league) reads now.
 */
export function upgradeCareer(s: Season): Season {
  const v5 = { ...s, version: 5 as const }
  if (v5.mode === 'draft') return v5
  if (!v5.career) return startCareer(v5)
  const c = (s.version as number) === 3 ? rescaled(v5, v5.career) : v5.career
  const v4 = { ...v5, career: c.finance ? c : { ...c, finance: startFinance({ ...v5, career: c }) } }
  return (s.version as number) < 5 ? withContracts(v4) : v4
}

/**
 * Version 5: everyone gets a contract (as a career's first season hands them out), the free agents'
 * pool starts empty, and the cup starts with this season if its first round is still to come
 * (otherwise next season).
 */
function withContracts(s: Season): Season {
  const c = s.career!
  const rng = new Rng(s.seed * 31 + 11 + c.number)
  const people = { ...c.people }
  const year = seasonYear(s)
  for (const p of s.teams.flatMap(squadOf)) {
    const who = people[p.id]
    if (who && !who.contract) people[p.id] = { ...who, contract: firstContract(rng, p, who, year) }
  }
  const career: Career = { ...c, people, freeAgents: c.freeAgents ?? [] }
  if (!c.cup && s.matchday <= cupSchedule(s)[0]) career.cup = startCup(s)
  return { ...s, career }
}

/** A version 3 club player's overall: his `ability` (the staff's 1-20 view) times 5. */
const oldRating = (p: PlayerDef): number => p.overall ?? Math.round(ability(p) * 5)

/** A version 3 career's old-scale numbers on the new scale. */
function rescaled(s: Season, c: Career): Career {
  const all = s.teams.flatMap(squadOf)
  const byId = new Map(all.map((p) => [p.id, p]))
  // Where the old scale's 0 sits on the new: his own, or the league's on average.
  const zero = (p: PlayerDef): number => playerRating(p) - 0.8 * oldRating(p)
  const league = all.reduce((n, p) => n + zero(p), 0) / all.length
  const at = (id: string, old: number): number => Math.round(0.8 * old + (byId.has(id) ? zero(byId.get(id)!) : league))
  const people = Object.fromEntries(
    Object.entries(c.people).map(([id, who]) => {
      const p = byId.get(id)
      const potential = p ? Math.round(playerRating(p) + 0.8 * (who.potential - oldRating(p))) : at(id, who.potential)
      return [id, { ...who, potential, ...(who.change === undefined ? {} : { change: Math.round(who.change * 0.8) }) }]
    }),
  )
  const levels = c.levels.map((l, club) => {
    const xi = autoPick({ ...s, matchday: 1, condition: Object.fromEntries(squadOf(s.teams[club]).map((p) => [p.id, { fitness: 1, injuredUntil: 0 }])) }, club)
    const ps = xi.map((id) => byId.get(id)!)
    const now = ps.reduce((n, p) => n + playerRating(p), 0) / ps.length
    const was = ps.reduce((n, p) => n + oldRating(p), 0) / ps.length
    return 0.8 * l + now - 0.8 * was
  })
  const history = c.history.map((h) => ({ ...h, lines: Object.fromEntries(Object.entries(h.lines).map(([id, l]) => [id, { ...l, overall: at(id, l.overall) }])) }))
  return { ...c, people, levels, history }
}
