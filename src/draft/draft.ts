/**
 * Draft mode, after 38-0: each round offers one club-season's squad; pick one and put him in an
 * open place in your side (eleven starters, nine substitutes). Then a season against other
 * club-seasons, one per club. A player can be in several seasons' squads, but only ever turns up
 * once: in your side, or for one opponent.
 */
import { ARCHETYPES, FORMATIONS, Rng, archetypeOf, fitFor, makeAttributes, makeTraits, shapedAttributes, type Formation, type Kit, type PlayerDef, type Role, type TeamDef } from '../engine/index.ts'
import { ARCHETYPE, LEFT_FOOTED, POOLS, type Pool, WEAK_FOOT } from './pools.ts'

/** Nine on the bench, as in the Premier League. */
export const DRAFT_SUBS = 9
export const DRAFT_ROUNDS = 11 + DRAFT_SUBS
/** Teams in a draft league: yours and 19 club-seasons, for a 38-match season. */
export const DRAFT_LEAGUE_SIZE = 20

export interface Draft {
  seed: number
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

/** Stable across sessions: the same name always gets the same attributes. */
function hash(text: string): number {
  let h = 2166136261
  for (let i = 0; i < text.length; i++) h = Math.imul(h ^ text.charCodeAt(i), 16777619)
  return h >>> 0
}

/**
 * A pool player as the engine sees him: attributes to match his overall, shaped by his
 * archetype (a poacher finishes, a playmaker passes), so players of the same overall and type are
 * about as good as each other. The overall maps onto the made-up league's scale, where a mid-table side's
 * players are around 70 and the best around 90.
 */
export function poolPlayer(poolIdx: number, i: number): PlayerDef {
  const pool = POOLS[poolIdx]
  const [name, positions, overall] = pool.players[i]
  const [role, ...others] = positions.split('/') as Role[]
  const rng = new Rng(hash(name))
  const quality = (overall - 45) / 2.6
  // Players without a curated archetype get one read off a random profile for his position.
  const traits = makeTraits(rng, role)
  const known = ARCHETYPE[name]
  const archetype = known && ARCHETYPES[role].includes(known) ? known : archetypeOf({ role, attrs: makeAttributes(rng, role, quality), traits } as PlayerDef)
  return {
    id: `p${poolIdx}-${i}`,
    name,
    shirt: 0,
    role,
    positions: others.length ? others : undefined,
    archetype,
    foot: LEFT_FOOTED.has(name) ? 'left' : 'right',
    weakFoot: WEAK_FOOT[name] ?? 3,
    attrs: shapedAttributes(rng, role, archetype, quality),
    traits,
    overall,
  }
}

export function newDraft(seed: number, formation: Formation): Draft {
  const rng = new Rng(seed)
  const rounds = rng.shuffle(POOLS.map((_, i) => i)).slice(0, DRAFT_ROUNDS)
  return { seed, formation, rounds, xi: Array(11).fill(null), bench: Array(DRAFT_SUBS).fill(null) }
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
export const fitted = (p: PlayerDef, slot: number, formation: Formation): number => (p.overall ?? 0) * fitFor(p, FORMATIONS[formation][slot].role)

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
    const best = left.reduce((a, b) => ((b.overall ?? 0) * fitFor(b, slot.role) > (a.overall ?? 0) * fitFor(a, slot.role) ? b : a))
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
  const pools = rng.shuffle(POOLS.map((_, i) => i)).filter((i) => !clubs.has(POOLS[i].club) && clubs.add(POOLS[i].club))
  const teams = pools.slice(0, DRAFT_LEAGUE_SIZE - 1).map((i) => {
    const team = poolTeam(i, taken)
    for (const p of [...team.players, ...team.bench]) taken.add(p.name)
    return team
  })
  return [draftTeam(d, name), ...teams]
}
