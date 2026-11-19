/**
 * Dynasty (session 38): a draft run carried into another season. In the summer the side keeps its
 * drafted men (made-up reserves are made again), each a year older: a man in the database the next
 * season (or the one after) plays at that club-season's overall and card, anyone else drifts a
 * little, mostly down (a prime run's men stay at their peak). A few leave: every unhappy star
 * (draft/morale.ts) asks to go, and others are bought by bigger clubs (`LEAVERS` in all, stars
 * likelier), and the summer draft fills their places, one club-season a round. The league is drawn
 * afresh, as the first season's was.
 */
import { Rng, type PlayerDef } from '../engine/index.ts'
import { DRAFT_SUBS, clubsOf, cardPlayer, newDraft, poolPlayer, type Draft, type Difficulty, type RuleId, type ThemeId } from './draft.ts'
import { POOLS, type League } from './pools.ts'
import { STAR, unhappyStars } from './morale.ts'
import { squadOf, table, type Season } from '../season/season.ts'
import { starsOf, starsPossible } from './goals.ts'
import { cupWinner } from './cup.ts'

/** Leavers each summer, at least (every unhappy star goes too, up to `LEAVERS_MAX`). */
export const LEAVERS = 3
export const LEAVERS_MAX = 6

/** A season of the dynasty, once it's over. */
export interface DynastySeason {
  name: string
  place: number
  points: number
  stars: number
  of: number
  /** Won the European Cup. */
  cup?: boolean
  /** The side's top league scorer. */
  scorer?: { name: string; goals: number }
}

/** A man's numbers over a dynasty's league seasons, by name (his id changes as he ages). */
export interface DynastyLine {
  apps: number
  goals: number
  assists: number
}

/** What a dynasty season carries (Season.dynasty). */
export interface Dynasty {
  /** This season's number in the run, from 1. */
  season: number
  past: DynastySeason[]
  /** Who left last summer, and why. */
  left?: { name: string; why: string }[]
  /** Who moved most last summer: overall before and after. */
  aged?: { name: string; from: number; to: number }[]
  /** Everyone's league numbers in the dynasty's finished seasons, by name. */
  totals?: Record<string, DynastyLine>
}

/** The dynasty's numbers so far: its finished seasons and this one (for the manager's men). */
export function dynastyTotals(s: Season): Record<string, DynastyLine> {
  const out: Record<string, DynastyLine> = {}
  for (const [name, l] of Object.entries(s.dynasty?.totals ?? {})) out[name] = { ...l }
  for (const p of squadOf(s.teams[s.userTeam])) {
    const st = s.stats[p.id]
    if (!st?.apps) continue
    const was = out[p.name] ?? { apps: 0, goals: 0, assists: 0 }
    out[p.name] = { apps: was.apps + st.apps, goals: was.goals + st.goals, assists: was.assists + st.assists }
  }
  return out
}

const startYear = (poolIdx: number): number => Number(POOLS[poolIdx].season.slice(0, 4))

let BY_NAME: Map<string, [number, number, number][]> | null = null
/** Every club-season a name is in: [pool, index, start year]. */
function seasonsOf(name: string): [number, number, number][] {
  if (!BY_NAME) {
    BY_NAME = new Map()
    POOLS.forEach((pool, pi) =>
      pool.players.forEach(([n], i) => {
        const list = BY_NAME!.get(n) ?? []
        list.push([pi, i, startYear(pi)])
        BY_NAME!.set(n, list)
      }),
    )
  }
  return BY_NAME.get(name) ?? []
}

/** A drafted man's pool, index and the years since that season: `p<pool>-<i>` or `p<pool>-<i>y<k>`. */
function origin(id: string): [number, number, number] | null {
  const m = /^p(\d+)-(\d+)(?:y(\d+))?$/.exec(id)
  return m ? [Number(m[1]), Number(m[2]), Number(m[3] ?? 0)] : null
}

/** Him a year on: his next club-season in the database (within two years), else a little drift. */
export function aged(p: PlayerDef, rng: Rng, prime = false): PlayerDef {
  const o = origin(p.id)
  const drift = Math.max(-3, Math.min(2, Math.round(rng.gauss() * 1.5 - 0.3)))
  if (!o || prime) return p
  const [pool, i, k] = o
  const year = startYear(pool) + k + 1
  const next = seasonsOf(p.name)
    .filter(([, , y]) => y === year || y === year + 1)
    .sort((a, b) => a[2] - b[2] || b[0] - a[0])[0]
  if (next) return { ...poolPlayer(next[0], next[1]), shirt: p.shirt }
  const overall = Math.max(55, Math.min(95, (p.overall ?? 75) + drift))
  return { ...cardPlayer(`p${pool}-${i}y${k + 1}`, p.name, POOLS[pool].players[i][1], overall, year), clubs: clubsOf(p.name), shirt: p.shirt }
}

/** Where a leaver went, for the news: a big club of the run's leagues. */
const BUYERS = ['Real Madrid', 'Barcelona', 'Bayern Munich', 'Manchester City', 'Paris Saint-Germain', 'Juventus', 'Liverpool', 'Chelsea', 'Inter', 'Manchester United', 'Arsenal', 'AC Milan', 'Atlético Madrid', 'Borussia Dortmund']

/** The finished season as the dynasty's record keeps it. */
export function seasonRecord(s: Season): DynastySeason {
  const rows = table(s)
  const place = rows.findIndex((r) => r.team === s.userTeam) + 1
  const scorer = squadOf(s.teams[s.userTeam])
    .map((p) => ({ name: p.name, goals: s.stats[p.id]?.goals ?? 0 }))
    .sort((a, b) => b.goals - a.goals)[0]
  return {
    name: s.teams[s.userTeam].name,
    place,
    points: rows[place - 1].points,
    stars: starsOf(s),
    of: starsPossible(s),
    ...(s.cup && cupWinner(s.cup) === s.userTeam ? { cup: true } : {}),
    ...(scorer && scorer.goals ? { scorer } : {}),
  }
}

/** The summer: the side a year on with its leavers gone, as a draft with their places open. */
export function summerDraft(s: Season): { draft: Draft; dynasty: Dynasty } {
  const n = (s.dynasty?.season ?? 1) + 1
  const rng = new Rng(s.seed * 41 + n * 7 + 3)
  const team = s.teams[s.userTeam]
  const style = s.draftStyle
  // A fresh draft for the offers (a classic one: a budget run's money was for the first summer).
  const seed = new Rng(s.seed * 53 + n).int(1, 99_999)
  const d = newDraft(seed, team.formation, (s.league as League | undefined) ?? 'Premier League', {
    theme: style?.theme as ThemeId | undefined,
    difficulty: style?.difficulty as Difficulty | undefined,
    rules: style?.rules as RuleId[] | undefined,
    prime: style?.prime,
    twists: true,
  })
  // Kept: the eleven by slot and the bench, without the made-up reserves (made again for the new squad).
  const own = (p: PlayerDef): boolean => !p.id.startsWith('r')
  const xi: (PlayerDef | null)[] = team.players.map((p) => (own(p) ? p : null))
  const bench: (PlayerDef | null)[] = team.bench.filter(own).slice(0, DRAFT_SUBS)
  while (bench.length < DRAFT_SUBS) bench.push(null)
  const kept = [...xi, ...bench].filter((p): p is PlayerDef => !!p)
  // Leavers: unhappy stars, then others, stars twice as likely to be bought.
  const leaving = new Map<string, string>()
  const buyer = (): string => rng.pick(BUYERS)
  for (const p of unhappyStars(s).slice(0, LEAVERS_MAX)) leaving.set(p.id, `asked to leave and joined ${buyer()}`)
  // (Never a keeper: the summer's offers might have nobody to replace him.)
  const rest = kept.filter((p) => !leaving.has(p.id) && p.role !== 'GK')
  while (leaving.size < LEAVERS && rest.length) {
    const weights = rest.map((p) => ((p.overall ?? 0) >= STAR ? 2 : 1))
    let u = rng.next() * weights.reduce((a, b) => a + b, 0)
    let k = 0
    while (u >= weights[k] && k < rest.length - 1) u -= weights[k++]
    const [p] = rest.splice(k, 1)
    leaving.set(p.id, `was sold to ${buyer()}`)
  }
  const moved: Dynasty['aged'] = []
  const onward = (p: PlayerDef | null): PlayerDef | null => {
    if (!p || leaving.has(p.id)) return null
    const q = aged(p, rng, style?.prime)
    if (q.overall !== p.overall) moved.push({ name: p.name, from: p.overall ?? 0, to: q.overall ?? 0 })
    return q
  }
  const draft: Draft = {
    ...d,
    xi: xi.map(onward),
    bench: bench.map(onward),
    // No twists in a summer draft (a few rounds only), but one reroll.
    twists: undefined,
    rerolls: Math.min(1, d.rerolls ?? 1),
  }
  if (!draft.twists) delete draft.twists
  const left = kept.filter((p) => leaving.has(p.id)).map((p) => ({ name: p.name, why: leaving.get(p.id)! }))
  moved.sort((a, b) => Math.abs(b.to - b.from) - Math.abs(a.to - a.from))
  return { draft, dynasty: { season: n, past: [...(s.dynasty?.past ?? []), seasonRecord(s)], left, aged: moved.slice(0, 6), totals: dynastyTotals(s) } }
}
