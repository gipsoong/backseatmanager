/**
 * Draft mode, after 38-0: each round offers one club-season's squad; pick one and put him in an
 * open place in your side (eleven starters, nine substitutes). Then a season against other
 * club-seasons, one per club. A player can be in several seasons' squads, but only ever turns up
 * once: in your side, or for one opponent.
 */
import { ARCHETYPES, FORMATIONS, Rng, TRAIT_LEAN, archetypeOf, cardAttributes, cardFor, fitFor, makeAttributes, makeTraits, shapedAttributes, type Archetype, type Formation, type Kit, type PlayerDef, type Role, type TeamDef, type Traits } from '../engine/index.ts'
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
}

/** Where a pick goes: a starting place (formation slot) or a place on the bench. */
export type Place = { xi: number } | { bench: number }

export const poolName = (pool: Pool): string => `${pool.club} ${pool.season}`

export const leagueOf = (pool: Pool): League => pool.league ?? 'Premier League'

/** Leagues with club-seasons to draft, in the order they're offered. */
export const LEAGUES: League[] = (['Premier League', 'La Liga', 'Bundesliga', 'Serie A', 'Ligue 1'] as League[]).filter((l) => POOLS.some((p) => leagueOf(p) === l))

/** Indices into POOLS of one league's club-seasons. */
const poolsIn = (league: League): number[] => POOLS.flatMap((p, i) => (leagueOf(p) === league ? [i] : []))

/** Stable across sessions: the same name always gets the same attributes. */
function hash(text: string): number {
  let h = 2166136261
  for (let i = 0; i < text.length; i++) h = Math.imul(h ^ text.charCodeAt(i), 16777619)
  return h >>> 0
}

/**
 * A real player's personality: his archetype's, a little varied, then what we know of him (a
 * flair player, a hot head, a tireless runner). Not rolled at random: Hazard plays like Hazard.
 */
function draftTraits(rng: Rng, name: string, archetype: Archetype): Traits {
  const lean = TRAIT_LEAN[archetype]
  const vary = (v: number): number => Math.max(0, Math.min(1, v + rng.gauss() * 0.1))
  return {
    flair: FLAIR.has(name) ? Math.max(0.85, vary(lean.flair)) : vary(lean.flair),
    temper: HOT_HEADS.has(name) ? Math.max(0.8, vary(lean.temper)) : vary(lean.temper),
    aggression: vary(lean.aggression),
    workRate: TIRELESS.has(name) ? Math.max(0.9, vary(lean.workRate)) : vary(lean.workRate),
    directness: vary(lean.directness),
  }
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
  const traits = draftTraits(rng, name, archetype)
  const card = cardOf(name, Number(pool.season.slice(0, 4)), overall, role === 'GK') ?? cardFor(archetype, overall)
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
    attrs: cardAttributes(shapedAttributes(rng, role, archetype, quality), card, role, archetype, () => rng.gauss() * 0.7),
    traits,
    overall,
  }
}

export function newDraft(seed: number, formation: Formation, league: League = 'Premier League'): Draft {
  const rng = new Rng(seed)
  const rounds = rng.shuffle(poolsIn(league)).slice(0, DRAFT_ROUNDS)
  return { seed, league, formation, rounds, xi: Array(11).fill(null), bench: Array(DRAFT_SUBS).fill(null) }
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
  const players = POOLS[idx].players.map((_, i) => poolPlayer(idx, i)).filter((p) => !drafted.has(p.name))
  return { pool: POOLS[idx], players }
}

/** How much a player counts in a starting place: his overall, less out of position. */
export const fitted = (p: PlayerDef, slot: number, formation: Formation): number => (p.overall ?? 0) * fitFor(p, FORMATIONS[formation][slot])

export function place(d: Draft, p: PlayerDef, at: Place): Draft {
  if ('xi' in at) {
    if (d.xi[at.xi]) return d
    return { ...d, xi: d.xi.map((q, i) => (i === at.xi ? p : q)) }
  }
  if (d.bench[at.bench]) return d
  return { ...d, bench: d.bench.map((q, i) => (i === at.bench ? p : q)) }
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
 * another side in the league) are gone.
 */
export function poolTeam(poolIdx: number, taken: Set<string>, formation = POOLS[poolIdx].formation): TeamDef {
  const pool = POOLS[poolIdx]
  const left = pool.players.map((_, i) => poolPlayer(poolIdx, i)).filter((p) => !taken.has(p.name))
  const players = FORMATIONS[formation].map((slot, i) => {
    const best = left.reduce((a, b) => ((b.overall ?? 0) * fitFor(b, slot) > (a.overall ?? 0) * fitFor(a, slot) ? b : a))
    left.splice(left.indexOf(best), 1)
    return { ...best, shirt: i + 1 }
  })
  const bench = left
    .sort((a, b) => (b.overall ?? 0) - (a.overall ?? 0))
    .slice(0, DRAFT_SUBS)
    .map((p, i) => ({ ...p, shirt: 12 + i }))
  return {
    name: poolName(pool),
    shortName: `${pool.shortName}${pool.season.slice(-2)}`,
    kit: pool.kit,
    formation,
    block: 'mid',
    players,
    bench,
  }
}

/**
 * The league: the drafted side first, then 19 clubs, each in one of its seasons, picked at
 * random. Nobody plays for two sides: a player is gone from a squad once he's in an earlier one.
 */
export function draftLeague(d: Draft, name: string): TeamDef[] {
  const taken = draftedNames(d)
  const rng = new Rng(d.seed + 1)
  const clubs = new Set<string>()
  const pools = rng.shuffle(poolsIn(d.league ?? 'Premier League')).filter((i) => !clubs.has(POOLS[i].club) && clubs.add(POOLS[i].club))
  const teams = pools.slice(0, DRAFT_LEAGUE_SIZE - 1).map((i) => {
    const team = poolTeam(i, taken)
    for (const p of [...team.players, ...team.bench]) taken.add(p.name)
    return team
  })
  return [draftTeam(d, name), ...teams]
}
