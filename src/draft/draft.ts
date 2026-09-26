/**
 * Draft mode, after 38-0: each round offers one club-decade's players; pick one and put him in an
 * open place in your side (eleven starters, five substitutes). Then a season against the other
 * club-decades. No transfers: the drafted squad is the squad.
 */
import { FORMATIONS, Rng, fitFor, makeAttributes, makeTraits, type Formation, type Kit, type PlayerDef, type TeamDef } from '../engine/index.ts'
import { POOLS, type Pool } from './pools.ts'

export const DRAFT_SUBS = 5
export const DRAFT_ROUNDS = 11 + DRAFT_SUBS
/** Teams in a draft league: yours and 19 club-decades, for a 38-match season. */
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

export const poolName = (pool: Pool): string => `${pool.club} ${pool.decade}`

/** Stable across sessions: the same name always gets the same attributes. */
function hash(text: string): number {
  let h = 2166136261
  for (let i = 0; i < text.length; i++) h = Math.imul(h ^ text.charCodeAt(i), 16777619)
  return h >>> 0
}

/**
 * A pool player as the engine sees him: attributes to match his overall, strengths where his
 * position has them. The overall maps onto the made-up league's scale, where a mid-table side's
 * players are around 70 and the best around 90.
 */
export function poolPlayer(poolIdx: number, i: number): PlayerDef {
  const pool = POOLS[poolIdx]
  const [name, role, overall] = pool.players[i]
  const rng = new Rng(hash(name))
  const quality = (overall - 45) / 2.6
  return { id: `p${poolIdx}-${i}`, name, shirt: 0, role, attrs: makeAttributes(rng, role, quality), traits: makeTraits(rng, role), overall }
}

export function newDraft(seed: number, formation: Formation): Draft {
  const rng = new Rng(seed)
  const rounds = rng.shuffle(POOLS.map((_, i) => i)).slice(0, DRAFT_ROUNDS)
  return { seed, formation, rounds, xi: Array(11).fill(null), bench: Array(DRAFT_SUBS).fill(null) }
}

/** The round being played (0-based): how many have been picked so far. */
export const roundOf = (d: Draft): number => [...d.xi, ...d.bench].filter(Boolean).length

export const isComplete = (d: Draft): boolean => roundOf(d) >= DRAFT_ROUNDS

/** This round's offer: the pool and its players. */
export function offer(d: Draft): { pool: Pool; players: PlayerDef[] } {
  const idx = d.rounds[roundOf(d)]
  return { pool: POOLS[idx], players: POOLS[idx].players.map((_, i) => poolPlayer(idx, i)) }
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

/** The drafted side as a team: the eleven in slot order, the five on the bench. */
export function draftTeam(d: Draft, name: string): TeamDef {
  const shirt = (p: PlayerDef, n: number): PlayerDef => ({ ...p, shirt: n })
  const players = d.xi.map((p, i) => shirt(p!, i + 1))
  const bench = d.bench.map((p, i) => shirt(p!, 12 + i))
  return { name, shortName: name.replace(/[^A-Za-z]/g, '').slice(0, 3).toUpperCase() || 'YOU', kit: YOURS, formation: d.formation, block: 'mid', players, bench }
}

/**
 * A club-decade as an opponent: for each position in its formation, its best remaining fit;
 * the next seven on the bench. Players the manager drafted from it are gone.
 */
export function poolTeam(poolIdx: number, taken: Set<string>): TeamDef {
  const pool = POOLS[poolIdx]
  const left = pool.players.map((_, i) => poolPlayer(poolIdx, i)).filter((p) => !taken.has(p.id))
  const players = FORMATIONS[pool.formation].map((slot, i) => {
    const best = left.reduce((a, b) => ((b.overall ?? 0) * fitFor(b, slot.role) > (a.overall ?? 0) * fitFor(a, slot.role) ? b : a))
    left.splice(left.indexOf(best), 1)
    return { ...best, shirt: i + 1 }
  })
  const bench = left
    .sort((a, b) => (b.overall ?? 0) - (a.overall ?? 0))
    .slice(0, 7)
    .map((p, i) => ({ ...p, shirt: 12 + i }))
  return {
    name: poolName(pool),
    shortName: `${pool.shortName}${pool.decade.slice(2, 4)}`,
    kit: pool.kit,
    formation: pool.formation,
    block: 'mid',
    players,
    bench,
  }
}

/** The league: the drafted side first, then 19 club-decades (one left out at random). */
export function draftLeague(d: Draft, name: string): TeamDef[] {
  const taken = new Set([...d.xi, ...d.bench].map((p) => p!.id))
  const rng = new Rng(d.seed + 1)
  const pools = rng.shuffle(POOLS.map((_, i) => i)).slice(0, DRAFT_LEAGUE_SIZE - 1)
  return [draftTeam(d, name), ...pools.map((i) => poolTeam(i, taken))]
}
