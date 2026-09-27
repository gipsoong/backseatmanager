/**
 * How a player is referred to in commentary, captions and lists: his surname with its particles
 * ("van Persie", "De Bruyne", "Mac Allister"), or the name he's known by ("Son", "Alisson").
 */
import { POOLS } from './draft/pools.ts'

const KNOWN = new Map(POOLS.flatMap((pool) => pool.players.flatMap(([name, , , known]) => (known ? [[name, known] as const] : []))))
const PARTICLES = new Set(['van', 'von', 'der', 'den', 'de', 'da', 'di', 'dos', 'du', 'le', 'la', 'De', 'Van', 'Mac', 'Da', 'Di', 'Le', 'La'])

export function shortName(name: string): string {
  const known = KNOWN.get(name)
  if (known) return known
  const parts = name.split(' ')
  let i = parts.length - 1
  while (i > 1 && PARTICLES.has(parts[i - 1])) i--
  return parts.slice(i).join(' ')
}
