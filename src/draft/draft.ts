/**
 * Draft mode, after 38-0: each round offers one club-season's squad; pick one and put him in an
 * open place in your side (eleven starters, nine substitutes). Then a season against other
 * club-seasons, one per club. A player can be in several seasons' squads, but only ever turns up
 * once: in your side, or for one opponent.
 */
import { ARCHETYPES, FORMATIONS, Rng, TRAIT_LEAN, ROLE_OFFSET, archetypeOf, cardAttributes, cardFor, fitFor, freshName, makeAttributes, makePlayerAt, makeTraits, shapedAttributes, traitMean, type Archetype, type Card, type Formation, type Kit, type PlayerDef, type Role, type TeamDef, type Traits } from '../engine/index.ts'
import { cardOf } from './cards.ts'
import { ARCHETYPE, FLAIR, HOT_HEADS, LEFT_FOOTED, POOLS, type League, type Pool, SIDE, TIRELESS, WEAK_FOOT } from './pools.ts'

/** Nine on the bench, as in the Premier League. */
export const DRAFT_SUBS = 9
export const DRAFT_ROUNDS = 11 + DRAFT_SUBS
/** Teams in a draft league: yours and 19 club-seasons, for a 38-match season. */
export const DRAFT_LEAGUE_SIZE = 20

export interface Draft {
  seed: number
  /** Whose club-seasons are drafted and played against; unset in old saves (the Premier League). */
  league?: League
  formation: Formation
  /** Pool (index into POOLS) offered in each round. */
  rounds: number[]
  /** The eleven, by formation slot; null until filled. */
  xi: (PlayerDef | null)[]
  bench: (PlayerDef | null)[]
  /** A themed draft (club-seasons of all five leagues, filtered); unset: one league, every season. */
  theme?: ThemeId
  /** A budget draft: £m left to spend; unset: a classic draft, no money. */
  money?: number
  /** A daily draft: the UTC date (yyyy-mm-dd) its seed comes from. */
  daily?: string
}

/** Where a pick goes: a starting place (formation slot) or a place on the bench. */
export type Place = { xi: number } | { bench: number }

export const poolName = (pool: Pool): string => `${pool.club} ${pool.season}`

export const leagueOf = (pool: Pool): League => pool.league ?? 'Premier League'

/** Leagues with club-seasons to draft, in the order they're offered. */
export const LEAGUES: League[] = (['Premier League', 'La Liga', 'Bundesliga', 'Serie A', 'Ligue 1'] as League[]).filter((l) => POOLS.some((p) => leagueOf(p) === l))

/** Indices into POOLS of one league's club-seasons. */
const poolsIn = (league: League): number[] => POOLS.flatMap((p, i) => (leagueOf(p) === league ? [i] : []))

// ---- Themes ----

export type ThemeId = 'era-2010' | 'era-2015' | 'era-2020' | 'underdogs' | 'no-stars'

export interface Theme {
  id: ThemeId
  name: string
  blurb: string
  /** Which club-seasons are in it. */
  pool: (p: Pool) => boolean
  /** Which of a club-season's players are in it (all of them if unset). */
  player?: (overall: number) => boolean
}

const startYear = (p: Pool): number => Number(p.season.slice(0, 4))

/** Each league's usual top clubs: what the underdogs theme leaves out. */
export const TOP_CLUBS = new Set([
  'Arsenal', 'Chelsea', 'Liverpool', 'Manchester City', 'Manchester United', 'Tottenham Hotspur',
  'Real Madrid', 'Barcelona', 'Atlético Madrid',
  'Bayern Munich', 'Borussia Dortmund', 'RB Leipzig', 'Bayer Leverkusen',
  'Juventus', 'Inter', 'AC Milan', 'Napoli',
  'Paris Saint-Germain', 'Monaco', 'Lyon', 'Marseille',
])

/** The highest overall in a "no stars" draft. */
export const NO_STARS_CAP = 80

/** Themed drafts take club-seasons from all five leagues; the league you play in follows the theme. */
export const THEMES: Theme[] = [
  { id: 'era-2010', name: '2010–2015', blurb: 'Seasons 2010/11 to 2014/15', pool: (p) => startYear(p) <= 2014 },
  { id: 'era-2015', name: '2015–2020', blurb: 'Seasons 2015/16 to 2019/20', pool: (p) => startYear(p) >= 2015 && startYear(p) <= 2019 },
  { id: 'era-2020', name: '2020–now', blurb: 'Seasons 2020/21 to 2024/25', pool: (p) => startYear(p) >= 2020 },
  { id: 'underdogs', name: 'Underdogs', blurb: "No club-season from a league's usual top clubs", pool: (p) => !TOP_CLUBS.has(p.club) },
  { id: 'no-stars', name: 'No stars', blurb: `Nobody rated above ${NO_STARS_CAP}`, pool: () => true, player: (o) => o <= NO_STARS_CAP },
]

export const themeOf = (id: string | undefined): Theme | undefined => THEMES.find((t) => t.id === id)

/** A player of a club-season is in the theme (always, with none). */
const inTheme = (theme: Theme | undefined, overall: number): boolean => !theme?.player || theme.player(overall)

/** Club-seasons in a theme: with a player filter, only those it leaves a squad (two keepers, 18 in all). */
export function themePools(theme: Theme): number[] {
  return POOLS.flatMap((p, i) => {
    if (!theme.pool(p)) return []
    const left = p.players.filter(([, , o]) => inTheme(theme, o))
    return left.length >= 18 && left.filter(([, pos]) => pos === 'GK').length >= 2 ? [i] : []
  })
}

/** The club-seasons a draft offers and plays against. */
export function draftPools(d: { theme?: string; league?: League }): number[] {
  const theme = themeOf(d.theme)
  return theme ? themePools(theme) : poolsIn(d.league ?? 'Premier League')
}

/** What a draft is of, in a few words: "Premier League 2010–now", "Underdogs · Europe's top five". */
export function draftLabel(d: { theme?: string; league?: string }): string {
  const theme = themeOf(d.theme)
  return theme ? `${theme.name} · Europe's top five` : `${d.league ?? 'Premier League'} 2010–now`
}

/** A draft's eyebrow: "Draft · Underdogs · Europe's top five · Budget · Daily". */
export function draftEyebrow(d: { theme?: string; league?: string; budget?: boolean; daily?: string }): string {
  return ['Draft', draftLabel(d), d.budget && 'Budget', d.daily && 'Daily'].filter(Boolean).join(' · ')
}

// ---- Budget ----

/** The least a player costs, in £m. */
export const MIN_PRICE = 1
/** A budget buys eleven players this many overall above the league's level, plus a bench at the least price. */
export const BUDGET_EDGE = 1

/**
 * The level of a draft's league: the average club-season's best eleven overalls (in the theme),
 * a little above what its sides put out once the draft and earlier sides have taken their men.
 */
export function leagueLevel(d: { theme?: string; league?: League }): number {
  const theme = themeOf(d.theme)
  const elevens = draftPools(d).map((i) => {
    const best = POOLS[i].players.map(([, , o]) => o).filter((o) => inTheme(theme, o)).sort((a, b) => b - a).slice(0, 11)
    return best.reduce((a, b) => a + b, 0) / best.length
  })
  return elevens.reduce((a, b) => a + b, 0) / elevens.length
}

/**
 * What a budget draft has to spend on twenty players, in £m: eleven at a little over the
 * league's level, nine subs at the least price, rounded to £5m. The Premier League's is £85m, Ligue 1's £45m.
 */
export function budgetFor(d: { theme?: string; league?: League }): number {
  const eleven = 11 * 2 ** ((leagueLevel(d) + BUDGET_EDGE - 72) / 4)
  return Math.round((eleven + DRAFT_SUBS * MIN_PRICE) / 5) * 5
}

/**
 * A player's price in £m, by his overall: £1m up to 72, doubling every 4 points (an 80 is £4m, an
 * 84 £8m, an 88 £16m, a 92 £32m). Stars are dear: a side of them is out of reach.
 */
export const priceOf = (overall: number): number => Math.max(MIN_PRICE, Math.round(2 ** ((overall - 72) / 4)))

/** Money set aside so every place still open after this pick can be filled at the least price. */
export const reserveFor = (d: Draft): number => Math.max(0, DRAFT_ROUNDS - roundOf(d) - 1) * MIN_PRICE

/** The most this round's pick can cost. */
export const spendable = (d: Draft): number => (d.money ?? Infinity) - reserveFor(d)

/**
 * What a player costs this round: his price, except that if nobody in the offer is affordable
 * (it doesn't happen with the pools as they are, but it's a guarantee) the cheapest costs what's left.
 */
export function priceIn(d: Draft, p: PlayerDef, offered: PlayerDef[] = offer(d).players): number {
  const price = priceOf(p.overall ?? 0)
  if (d.money === undefined) return price
  const max = spendable(d)
  const cheapest = Math.min(...offered.map((q) => priceOf(q.overall ?? 0)))
  return cheapest > max && price === cheapest ? Math.max(0, max) : price
}

/** He can be bought this round (always, in a classic draft). */
export const canAfford = (d: Draft, p: PlayerDef, offered?: PlayerDef[]): boolean => d.money === undefined || priceIn(d, p, offered) <= spendable(d)

// ---- Daily ----

/** Today's UTC date, yyyy-mm-dd: the same for everyone, wherever they are. */
export const today = (now = new Date()): string => now.toISOString().slice(0, 10)

/** The daily draft's seed: the date alone, so everyone gets the same offers that day. */
export const dailySeed = (date: string): number => hash(`matchday-daily-${date}`)

/** Stable across sessions: the same name always gets the same attributes. */
function hash(text: string): number {
  let h = 2166136261
  for (let i = 0; i < text.length; i++) h = Math.imul(h ^ text.charCodeAt(i), 16777619)
  return h >>> 0
}

/**
 * A real player's personality: his archetype's, a little varied, then what we know of him (a
 * flair player, a hot head, a tireless runner). Not rolled at random: Hazard plays like Hazard.
 * The archetypes' leans are centred on the made-up players of his position (`traitMean`, what the
 * engine was tuned on; session 28): uncentred, draft forwards had more flair and directness than
 * any made-up ones, defenders less, midfielders worked harder, and draft leagues scored ~0.15 a
 * match more. Each archetype still differs from the others of his position as much as before.
 */
function draftTraits(rng: Rng, name: string, archetype: Archetype, role: Role): Traits {
  const lean = centredLean(archetype, role)
  const vary = (v: number): number => Math.max(0, Math.min(1, v + rng.gauss() * 0.1))
  return {
    flair: FLAIR.has(name) ? Math.max(0.85, vary(lean.flair)) : vary(lean.flair),
    temper: HOT_HEADS.has(name) ? Math.max(0.8, vary(lean.temper)) : vary(lean.temper),
    aggression: vary(lean.aggression),
    workRate: TIRELESS.has(name) ? Math.max(0.9, vary(lean.workRate)) : vary(lean.workRate),
    directness: vary(lean.directness),
  }
}

const TRAIT_KEYS: (keyof Traits)[] = ['flair', 'temper', 'aggression', 'workRate', 'directness']

/** An archetype's lean, moved so his position's archetypes average its made-up players. */
function centredLean(archetype: Archetype, role: Role): Traits {
  const mean = traitMean(role)
  const kinds = ARCHETYPES[role]
  const out = { ...TRAIT_LEAN[archetype] }
  for (const k of TRAIT_KEYS) out[k] = TRAIT_LEAN[archetype][k] + mean[k] - kinds.reduce((n, a) => n + TRAIT_LEAN[a][k], 0) / kinds.length
  return out
}

/**
 * An overall as a level (1-20): 80 is 13.5, and 4 overall points are one attribute point (FIFA's
 * 1-99 against our 1-20), so an 88 is better than an 80, not another sport. Above 86 it's 6 a
 * point: a 94 was a level of 17, and with his archetype's strengths on top (finishing, pace and
 * reactions at 19-20) a 94 striker in a drafted side scored 60 a season, half again what an 85
 * did in the same side. Real stars are a quarter or so better than very good players, not half.
 */
export const levelOf = (overall: number): number => 13.5 + (Math.min(overall, 86) - 80) / 4 + Math.max(0, overall - 86) / 6

/**
 * A pool player as the engine sees him: his card (his own from `CARDS` for that season, otherwise
 * his archetype's at his overall), made into sub-attributes spread by position and archetype.
 * Anything off the card (a keeper's outfield skills) comes from his archetype's shape at his level.
 */
export function poolPlayer(poolIdx: number, i: number): PlayerDef {
  const pool = POOLS[poolIdx]
  const [name, positions, overall] = pool.players[i]
  const [role, ...others] = positions.split('/') as Role[]
  const rng = new Rng(hash(name))
  const quality = levelOf(overall)
  // Players without a curated archetype get one read off a random profile for his position.
  const known = ARCHETYPE[name]
  const archetype = known && ARCHETYPES[role].includes(known) ? known : archetypeOf({ role, attrs: makeAttributes(rng, role, quality, makeTraits(rng, role)), traits: makeTraits(rng, role) } as PlayerDef)
  const traits = draftTraits(rng, name, archetype, role)
  // He plays as a made-up player of his position does at the same standing (ROLE_OFFSET: a FIFA
  // card gives a striker ~4 more points of skill than the engine's positions were tuned with, a
  // centre-midfielder ~2 fewer), so a draft league plays like a career one; his card shows as FIFA's
  // (`cardShift`, put back by `shownRatings`).
  const off = ROLE_OFFSET[role]
  const card = (cardOf(name, Number(pool.season.slice(0, 4)), overall, role === 'GK') ?? cardFor(archetype, overall)).map((v) => v + off) as Card
  return {
    id: `p${poolIdx}-${i}`,
    name,
    shirt: 0,
    role,
    positions: others.length ? others : undefined,
    archetype,
    foot: LEFT_FOOTED.has(name) ? 'left' : 'right',
    weakFoot: WEAK_FOOT[name] ?? 3,
    side: SIDE[name],
    attrs: cardAttributes(shapedAttributes(rng, role, archetype, quality), card, role, archetype, overall + off, () => rng.gauss() * 0.7),
    traits,
    overall,
    ...(off ? { cardShift: off } : {}),
  }
}

export interface DraftOptions {
  theme?: ThemeId
  budget?: boolean
  /** A daily draft's date (yyyy-mm-dd). */
  daily?: string
}

/**
 * A new draft: twenty club-seasons, one a round, from one league or a theme. A daily draft
 * takes its seed from the date (the seed passed in is ignored), so its offers are everyone's.
 */
export function newDraft(seed: number, formation: Formation, league: League = 'Premier League', opts: DraftOptions = {}): Draft {
  const s = opts.daily ? dailySeed(opts.daily) : seed
  const theme = themeOf(opts.theme)
  const rng = new Rng(s)
  const rounds = rng.shuffle(draftPools({ theme: theme?.id, league })).slice(0, DRAFT_ROUNDS)
  const d: Draft = { seed: s, league, formation, rounds, xi: Array(11).fill(null), bench: Array(DRAFT_SUBS).fill(null) }
  if (theme) {
    d.theme = theme.id
    delete d.league
  }
  if (opts.budget) d.money = budgetFor(d)
  if (opts.daily) d.daily = opts.daily
  return d
}

/** The round being played (0-based): how many have been picked so far. */
export const roundOf = (d: Draft): number => [...d.xi, ...d.bench].filter(Boolean).length

export const isComplete = (d: Draft): boolean => roundOf(d) >= DRAFT_ROUNDS

/** Names of the players drafted so far. */
const draftedNames = (d: Draft): Set<string> => new Set([...d.xi, ...d.bench].flatMap((p) => (p ? [p.name] : [])))

/** This round's offer: the pool and its players, less any already drafted from another season. */
export function offer(d: Draft): { pool: Pool; players: PlayerDef[] } {
  const idx = d.rounds[roundOf(d)]
  const drafted = draftedNames(d)
  const theme = themeOf(d.theme)
  const players = POOLS[idx].players.map((_, i) => poolPlayer(idx, i)).filter((p) => !drafted.has(p.name) && inTheme(theme, p.overall ?? 0))
  return { pool: POOLS[idx], players }
}

/** How much a player counts in a starting place: his overall, less out of position. */
export const fitted = (p: PlayerDef, slot: number, formation: Formation): number => (p.overall ?? 0) * fitFor(p, FORMATIONS[formation][slot])

/** Put a pick in an open place. In a budget draft he's paid for, and one you can't afford is refused. */
export function place(d: Draft, p: PlayerDef, at: Place): Draft {
  if ('xi' in at ? d.xi[at.xi] : d.bench[at.bench]) return d
  let next = d
  if (d.money !== undefined) {
    if (!canAfford(d, p)) return d
    next = { ...d, money: d.money - priceIn(d, p) }
  }
  if ('xi' in at) return { ...next, xi: d.xi.map((q, i) => (i === at.xi ? p : q)) }
  return { ...next, bench: d.bench.map((q, i) => (i === at.bench ? p : q)) }
}

/** The side's strength as 38-0 judges it: the eleven's overalls, each weighed by how well he fits. */
export function draftRating(d: Draft): number {
  const filled = d.xi.map((p, i) => (p ? fitted(p, i, d.formation) : null)).filter((x): x is number => x !== null)
  return filled.length ? Math.round(filled.reduce((a, b) => a + b, 0) / filled.length) : 0
}

const YOURS: Kit = { shirt: '#f2f2ee', number: '#1b1f1c', family: 'white' }

/** The drafted side as a team: the eleven in slot order, the rest on the bench. */
export function draftTeam(d: Draft, name: string): TeamDef {
  const shirt = (p: PlayerDef, n: number): PlayerDef => ({ ...p, shirt: n })
  const players = d.xi.map((p, i) => shirt(p!, i + 1))
  const bench = d.bench.map((p, i) => shirt(p!, 12 + i))
  return { name, shortName: name.replace(/[^A-Za-z]/g, '').slice(0, 3).toUpperCase() || 'YOU', kit: YOURS, formation: d.formation, block: 'mid', players, bench }
}

/**
 * A club-season as an opponent: for each position in its formation, its best remaining fit;
 * the next nine on the bench. Players in `taken` (by name: drafted, or already playing for
 * another side in the league) are gone. With `fill` a short bench is made up to nine (`fillBench`).
 */
export function poolTeam(poolIdx: number, taken: Set<string>, formation = POOLS[poolIdx].formation, theme?: string, fill = true): TeamDef {
  const pool = POOLS[poolIdx]
  const t = themeOf(theme)
  const left = pool.players.map((_, i) => poolPlayer(poolIdx, i)).filter((p) => !taken.has(p.name) && inTheme(t, p.overall ?? 0))
  const players = FORMATIONS[formation].map((slot, i) => {
    const best = left.reduce((a, b) => ((b.overall ?? 0) * fitFor(b, slot) > (a.overall ?? 0) * fitFor(a, slot) ? b : a))
    left.splice(left.indexOf(best), 1)
    return { ...best, shirt: i + 1 }
  })
  const bench = left
    .sort((a, b) => (b.overall ?? 0) - (a.overall ?? 0))
    .slice(0, DRAFT_SUBS)
    .map((p, i) => ({ ...p, shirt: 12 + i }))
  const team: TeamDef = {
    name: poolName(pool),
    shortName: `${pool.shortName}${pool.season.slice(-2)}`,
    kit: pool.kit,
    formation,
    block: 'mid',
    players,
    bench,
  }
  return fill ? fillBench(team, poolIdx, new Set([...taken, ...players.map((p) => p.name), ...bench.map((p) => p.name)]), theme) : team
}

/**
 * What a short bench is made up with (a squad file is ~20 men, and anyone drafted or already playing
 * for another side is gone, so most club-seasons are short): men of the same club in its other
 * seasons, nearest first, no better than its weakest starter (fringe players, so the side stays that
 * season's), then made-up ones a little below that, for what the bench lacks (a keeper first).
 */
const BENCH_NEEDS: Role[] = ['GK', 'CB', 'FB', 'CM', 'ST', 'CB', 'W', 'DM', 'FB']
const MADE_UP_BELOW = 2

/** A club-season's bench made up to nine, with a keeper on it; `taken` (names) gets the newcomers. */
export function fillBench(team: TeamDef, poolIdx: number, taken: Set<string>, theme?: string): TeamDef {
  const pool = POOLS[poolIdx]
  const t = themeOf(theme)
  const bench = [...team.bench]
  const weakest = Math.min(...team.players.map((p) => p.overall ?? 0))
  const hasKeeper = (): boolean => bench.some((p) => p.role === 'GK')
  if (bench.length >= DRAFT_SUBS && hasKeeper()) return team
  // The same club's other seasons, nearest first (a name once, at his nearest season).
  const year = Number(pool.season.slice(0, 4))
  const seen = new Set<string>()
  const others: PlayerDef[] = []
  POOLS.flatMap((q, qi) => (q.club === pool.club && leagueOf(q) === leagueOf(pool) && qi !== poolIdx ? [qi] : []))
    .sort((a, b) => Math.abs(Number(POOLS[a].season.slice(0, 4)) - year) - Math.abs(Number(POOLS[b].season.slice(0, 4)) - year) || a - b)
    .forEach((qi) =>
      POOLS[qi].players.forEach(([name, , overall], i) => {
        if (taken.has(name) || seen.has(name) || !inTheme(t, overall) || overall > weakest) return
        seen.add(name)
        others.push(poolPlayer(qi, i))
      }),
    )
  const rng = new Rng(hash(poolName(pool)) + 7)
  let made = 0
  const madeUp = (role: Role): PlayerDef => makePlayerAt(rng, `m${poolIdx}-${made++}`, freshName(rng, taken), 0, role, weakest - MADE_UP_BELOW)
  const add = (p: PlayerDef): void => {
    taken.add(p.name)
    bench.push(p)
  }
  if (!hasKeeper()) {
    // No keeper among the subs: the weakest outfield sub makes way for one.
    if (bench.length >= DRAFT_SUBS) bench.splice(bench.length - 1, 1)
    const gk = others.find((p) => p.role === 'GK')
    if (gk) others.splice(others.indexOf(gk), 1)
    add(gk ?? madeUp('GK'))
  }
  while (bench.length < DRAFT_SUBS && others.length) add(others.shift()!)
  const need = [...BENCH_NEEDS]
  for (const p of bench) if (need.includes(p.role)) need.splice(need.indexOf(p.role), 1)
  while (bench.length < DRAFT_SUBS) add(madeUp(need.shift() ?? 'CM'))
  return { ...team, bench: bench.map((p, i) => ({ ...p, shirt: 12 + i })) }
}

/**
 * The league: the drafted side first, then 19 clubs, each in one of its seasons, picked at
 * random. Nobody plays for two sides: a player is gone from a squad once he's in an earlier one.
 */
export function draftLeague(d: Draft, name: string): TeamDef[] {
  const taken = draftedNames(d)
  const rng = new Rng(d.seed + 1)
  const clubs = new Set<string>()
  const pools = rng.shuffle(draftPools(d)).filter((i) => !clubs.has(POOLS[i].club) && clubs.add(POOLS[i].club))
  const chosen = pools.slice(0, DRAFT_LEAGUE_SIZE - 1)
  const teams = chosen.map((i) => {
    const team = poolTeam(i, taken, POOLS[i].formation, d.theme, false)
    for (const p of [...team.players, ...team.bench]) taken.add(p.name)
    return team
  })
  // Then short benches are made up, once every side has its own men (fill-ins take nobody's).
  const filled = teams.map((t, k) => fillBench(t, chosen[k], taken, d.theme))
  return [draftTeam(d, name), ...withBlocks(filled, new Rng(d.seed + 2))]
}

/**
 * How the league's sides defend, by where their eleven ranks (strongest third, middle, weakest):
 * chances of a high, mid and low block. Not everyone sits in a mid block: the best sides tend to
 * press, the weakest to sit deep, as in a career league's mix (where they're even). Blocks are
 * level against each other (session 24), so this is about how matches look, not who wins them.
 */
const BLOCK_ODDS: [number, number, number][] = [
  [0.5, 0.35, 0.15],
  [0.3, 0.4, 0.3],
  [0.15, 0.35, 0.5],
]

function withBlocks(teams: TeamDef[], rng: Rng): TeamDef[] {
  const xi = (t: TeamDef): number => t.players.reduce((n, p) => n + (p.overall ?? 0), 0) / t.players.length
  const order = teams.map((t, i) => [xi(t), i] as const).sort((a, b) => b[0] - a[0] || a[1] - b[1]).map(([, i]) => i)
  return teams.map((t, i) => {
    const [high, mid] = BLOCK_ODDS[Math.min(2, Math.floor((order.indexOf(i) * 3) / teams.length))]
    const u = rng.next()
    return { ...t, block: u < high ? 'high' : u < high + mid ? 'mid' : 'low' }
  })
}
