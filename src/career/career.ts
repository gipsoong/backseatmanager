/**
 * Career mode (club mode, season after season): players' ages and hidden potential, how they
 * develop and decline over a summer, retirements, the academy's intake, signings that replace
 * retirements, the board's target, and the history of seasons gone. Pure and deterministic, like
 * the season: `nextSeason` turns a finished season into the next one.
 */
import { type Attributes, type PlayerDef, type Role, type TeamDef, Rng, freshName, makePlayer } from '../engine/index.ts'
import { type Finance, settle, startFinance } from './money.ts'
import { type Season, avgRating, autoPick, createSeason, matchdays, playerRating, squadOf, table } from '../season/season.ts'

/** What the game knows about a player beyond his attributes. */
export interface Person {
  age: number
  /** The overall he could reach (hidden from the manager). */
  potential: number
  /** His overall's change over the summer just gone (unset in a career's first season). */
  change?: number
  /** Came up from the academy this summer. */
  academy?: boolean
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
}

/** What happened at the manager's club over the summer, for the hub. */
export interface Summer {
  retired: { name: string; age: number }[]
  academy: string[]
  signed: string[]
  released: string[]
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
}

/** A squad's largest size: the eleven, nine on the bench and a few reserves. */
export const SQUAD_MAX = 24
const TITLE_PLACES = 2
/** A signing's overall against his club's level; an academy player's potential against the league's. */
const SIGNING_LEVEL = -4
const GEM_FLOOR = -12
const GEM_RANGE = 24
const DRIFT_PULL = 6
/** The most a player improves in one summer. */
const MAX_GROWTH = 6
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
  const career: Career = { number: 1, people, aim: 'topHalf', history: [], levels: s.teams.map((_, i) => elevenRating(s, i)) }
  const started = { ...s, career: { ...career, aim: aimFor(s, s.userTeam) } }
  return { ...started, career: { ...started.career, finance: startFinance(started) } }
}

function firstPerson(rng: Rng, p: PlayerDef, mean: number, sd: number): Person {
  const age = Math.round(Math.max(17, Math.min(35, mean + rng.gauss() * sd)))
  const now = playerRating(p)
  const room = age < 26 ? Math.max(0, (26 - age) * 1.0 + rng.gauss() * 2.5) : 0
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

/**
 * His attributes moved a point at a time until his overall is `target` (or as near as 1-20 allows):
 * the legs first on the way down, and for a young player (`young`) on the way up too.
 */
export function shiftTo(p: PlayerDef, target: number, rng: Rng, declining: boolean, young = false): PlayerDef {
  const attrs = { ...p.attrs }
  const subs = p.role === 'GK' ? KEEPER_SUBS : (Object.keys(attrs) as (keyof Attributes)[]).filter((k) => !KEEPER_SUBS.includes(k))
  const def = { ...p, attrs }
  for (let i = 0; i < 400; i++) {
    const dir = Math.sign(target - playerRating(def))
    if (dir === 0) break
    const open = subs.filter((k) => (dir > 0 ? attrs[k] < 20 : attrs[k] > 1))
    if (!open.length) break
    const w = open.map((k) => (declining && dir < 0 ? (DECLINE_WEIGHT[k] ?? 0.6) : young && dir > 0 ? (YOUNG_GROWTH_WEIGHT[k] ?? 1) : 1))
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
  const noise = rng.gauss() * 0.8
  if (a <= 26) {
    const gap = Math.max(0, potential - now)
    const rate = a <= 20 ? 0.32 : a <= 23 ? 0.26 : 0.18
    const form = played.rating === null ? 0 : Math.max(-0.15, Math.min(0.2, (played.rating - 6.75) * 0.4))
    const minutes = 0.5 + 0.6 * Math.min(1, played.share) + form
    return Math.min(gap + 1, MAX_GROWTH, gap * rate * minutes + noise)
  }
  if (a <= 30) return noise * 0.8 - (a === 30 ? 0.3 : 0)
  const fall = a === 31 ? 1 : a === 32 ? 1.6 : a === 33 ? 2.3 : a === 34 ? 3 : 3.6
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

/** A made-up player at an overall: a profile near it, then moved there exactly. */
function madeAt(rng: Rng, id: string, name: string, shirt: number, role: Role, overall: number): PlayerDef {
  return shiftTo(makePlayer(rng, id, name, shirt, role, overall / 5 + 0.5), overall, rng, false)
}

/** The season over: on to the next, with the same clubs, a summer's development and a fresh fixture list. */
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
  const summer: Summer = { retired: [], academy: [], signed: [], released: [] }
  const names = new Set(s.teams.flatMap(squadOf).map((p) => p.name))
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
      people[p.id] = { age, potential: who.potential, change: playerRating(next) - now }
    }
    const shirts = new Set(squad.map((p) => p.shirt))
    const shirt = (): number => {
      let n = 12
      while (shirts.has(n)) n++
      shirts.add(n)
      return n
    }
    // A signing for each retirement, at about the club's own level, in the same position (the
    // manager signs his own, in the market).
    left.forEach((p, i) => {
      if (mine) return
      const overall = Math.round(c.levels[club] - DRIFT_PULL * drift + SIGNING_LEVEL + rng.gauss() * 2.5)
      const q = madeAt(rng, `${s.seed}-c${c.number}-${club}-s${i}`, fresh(squad), shirt(), p.role, overall)
      squad.push(q)
      people[q.id] = { age: rng.int(24, 29), potential: overall }
    })
    // The academy: two or three a summer, 16 to 18, a long way off the first team, now and then a gem.
    const intake = rng.int(2, 3)
    for (let i = 0; i < intake; i++) {
      // Below the club's own first team (a weak club's kids are weaker), however high they may go.
      const overall = Math.round(c.levels[club] - DRIFT_PULL * drift - 14 + rng.next() * 10)
      const potential = Math.max(overall + 3, Math.round(level + GEM_FLOOR + GEM_RANGE * rng.next() ** 2))
      // A keeper if the club is short of them, otherwise any position.
      const role = squad.filter((p) => p.role === 'GK').length < 2 ? 'GK' : rng.pick(ACADEMY_ROLES)
      const q = madeAt(rng, `${s.seed}-c${c.number}-${club}-a${i}`, fresh(squad), shirt(), role, overall)
      squad.push(q)
      people[q.id] = { age: rng.int(16, 18), potential, academy: true }
      if (mine) summer.academy.push(q.id)
    }
    // Too many: the least promising of 19 and over go (as the staff judge it: a young player's
    // room to grow counts for a little), never the second keeper.
    const worth = (p: PlayerDef): number => {
      const who = people[p.id]
      return playerRating(p) + (who.age < 23 ? 0.3 * (who.potential - playerRating(p)) : 0)
    }
    while (squad.length > SQUAD_MAX) {
      const keepers = squad.filter((p) => p.role === 'GK').length
      const out = squad
        .filter((p) => people[p.id].age >= 19 && (p.role !== 'GK' || keepers > 2))
        .sort((a, b) => worth(a) - worth(b))[0]
      if (!out) break
      squad.splice(squad.indexOf(out), 1)
      delete people[out.id]
      if (mine) summer.released.push(out.name)
    }
    return { ...t, players: squad.slice(0, 11), bench: squad.slice(11) }
  })

  const year = Number(s.startDate.slice(0, 4)) + 1
  const seed = (s.seed * 7 + c.number * 7919) % 1_000_003
  const base = createSeason(seed, s.userTeam, new Date(Date.UTC(year, 0, 1)), teams)
  // Each club's eleven picked afresh from who's there now.
  const picked = teams.map((t, club) => {
    const squad = squadOf(t)
    const xi = autoPick(base, club).map((id) => squad.find((p) => p.id === id)!)
    return { ...t, players: xi, bench: squad.filter((p) => !xi.includes(p)) }
  })
  const next: Season = { ...base, teams: picked }
  return { ...next, career: { number: c.number + 1, people, aim: aimFor(next, s.userTeam), history, levels: c.levels, finance, summer } }
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
    trophies: place === 1 ? ['League title'] : [],
    lines,
  }
}

// ---------------------------------------------------------------------------
// Saves

/** A save from before careers (version 2): club mode becomes a career's first season. */
export function upgradeCareer(s: Season): Season {
  const v3 = { ...s, version: 3 as const }
  if (v3.mode === 'draft') return v3
  if (!v3.career) return startCareer(v3)
  return v3.career.finance ? v3 : { ...v3, career: { ...v3.career, finance: startFinance(v3) } }
}
