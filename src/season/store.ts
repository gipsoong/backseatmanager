/** The saved season, in IndexedDB: one slot, replaced after every matchday. */
import { openDB } from 'idb'
import { type Attributes, type LegacyAttributes, type PlayerDef, archetypeFrom, upgradeAttributes } from '../engine/index.ts'
import type { Season } from './season.ts'
import { upgradeCareer } from '../career/career.ts'

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
  return upgradeCareer(upgraded(s))
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
