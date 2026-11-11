/** The saved season, in IndexedDB: one slot, replaced after every matchday. */
import { openDB } from 'idb'
import { type Attributes, type LegacyAttributes, type PlayerDef, archetypeFrom, upgradeAttributes } from '../engine/index.ts'
import type { Season } from './season.ts'
import { upgradeCareer } from '../career/career.ts'
import { poolPlayer, withReserves } from '../draft/draft.ts'
import { POOLS } from '../draft/pools.ts'

const db = () =>
  openDB('matchday', 1, {
    upgrade(d) {
      d.createObjectStore('saves')
    },
  })

export async function loadSeason(): Promise<Season | null> {
  const s = (await (await db()).get('saves', 'season')) as Season | undefined
  // An older save (from before squads and fitness) can't be carried on.
  return s && [2, 3, 4, 5].includes(s.version as number) ? upgradeSave(s) : null
}

/** Any save we can carry on, brought up to date: sub-attributes, then a career for club mode. */
export function upgradeSave(s: Season): Season {
  return upgradeCareer(reserved(shifted(upgraded(s))))
}

/**
 * A draft save from before reserves (session 35): every club gets its reserves now, fit and with an
 * empty season, so deals in the window it's in aren't held up by squad sizes.
 */
function reserved(s: Season): Season {
  if (s.mode !== 'draft' || s.teams.some((t) => [...t.players, ...t.bench].some((p) => /^r\d+-/.test(p.id)))) return s
  const taken = new Set(s.teams.flatMap((t) => [...t.players, ...t.bench].map((p) => p.name)))
  const teams = s.teams.map((t, k) => withReserves(t, k, taken, s.seed))
  const fresh = teams.flatMap((t) => t.bench).filter((p) => !s.condition[p.id])
  return {
    ...s,
    teams,
    condition: { ...s.condition, ...Object.fromEntries(fresh.map((p) => [p.id, { fitness: 1, injuredUntil: 0 }])) },
    stats: { ...s.stats, ...Object.fromEntries(fresh.map((p) => [p.id, { apps: 0, goals: 0, assists: 0, ratings: 0 }])) },
  }
}

/**
 * A draft save from before session 28: its club-season players play from their FIFA cards as they
 * are; they're remade as the draft now makes them (their card moved by ROLE_OFFSET), so an old
 * draft league scores like a new one. Only players who are still who their id says.
 */
function shifted(s: Season): Season {
  if (s.mode !== 'draft') return s
  const up = (p: PlayerDef): PlayerDef => {
    const m = /^p(\d+)-(\d+)$/.exec(p.id)
    if (!m || p.card || p.cardShift !== undefined || p.overall === undefined) return p
    const [pi, i] = [Number(m[1]), Number(m[2])]
    if (POOLS[pi]?.players[i]?.[0] !== p.name || POOLS[pi].players[i][2] !== p.overall) return p
    const fresh = poolPlayer(pi, i)
    return { ...p, attrs: fresh.attrs, ...(fresh.cardShift ? { cardShift: fresh.cardShift } : {}) }
  }
  return { ...s, teams: s.teams.map((t) => ({ ...t, players: t.players.map(up), bench: t.bench.map(up) })) }
}

/** A save from before sub-attributes (17 Oct 2026): each player expanded from his old attributes. */
function upgraded(s: Season): Season {
  const up = (p: PlayerDef): PlayerDef => {
    const old = p.attrs as Attributes | LegacyAttributes
    if (!('pace' in old)) return p
    return { ...p, attrs: upgradeAttributes(old, p.role, p.archetype ?? archetypeFrom(old, p.traits, p.role)) }
  }
  return { ...s, teams: s.teams.map((t) => ({ ...t, players: t.players.map(up), bench: t.bench.map(up) })) }
}

export async function saveSeason(s: Season): Promise<void> {
  await (await db()).put('saves', s, 'season')
}

export async function clearSeason(): Promise<void> {
  await (await db()).delete('saves', 'season')
}
