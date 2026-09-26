/** The saved season, in IndexedDB: one slot, replaced after every matchday. */
import { openDB } from 'idb'
import type { Season } from './season.ts'

const db = () =>
  openDB('matchday', 1, {
    upgrade(d) {
      d.createObjectStore('saves')
    },
  })

export async function loadSeason(): Promise<Season | null> {
  const s = (await (await db()).get('saves', 'season')) as Season | undefined
  return s?.version === 1 ? s : null
}

export async function saveSeason(s: Season): Promise<void> {
  await (await db()).put('saves', s, 'season')
}

export async function clearSeason(): Promise<void> {
  await (await db()).delete('saves', 'season')
}
