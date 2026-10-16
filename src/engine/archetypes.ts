/**
 * Archetypes: how a player plays his position, which changes where he stands and what he does
 * (see shapeTarget and the carrier's decisions in ai.ts), not just how good he is. Every player
 * has one for his own position: given (a real player), or read off his attributes and traits.
 * Played out of position he plays the new one the way his attributes suggest.
 */
import type { Rng } from './rng.ts'
import type { Attributes, PlayerDef, Role } from './types.ts'

export type Archetype =
  | 'shotStopper'
  | 'sweeperKeeper'
  | 'stopper'
  | 'ballPlayer'
  | 'overlapping'
  | 'inverted'
  | 'defensiveFullBack'
  | 'anchor'
  | 'deepPlaymaker'
  | 'boxToBox'
  | 'playmaker'
  | 'ballWinner'
  | 'winger'
  | 'insideForward'
  | 'poacher'
  | 'targetMan'
  | 'falseNine'

/** Which archetypes each position has. */
export const ARCHETYPES: Record<Role, Archetype[]> = {
  GK: ['shotStopper', 'sweeperKeeper'],
  CB: ['stopper', 'ballPlayer'],
  FB: ['overlapping', 'inverted', 'defensiveFullBack'],
  DM: ['anchor', 'deepPlaymaker', 'ballWinner'],
  CM: ['boxToBox', 'playmaker', 'ballWinner'],
  WM: ['winger', 'insideForward'],
  W: ['winger', 'insideForward'],
  ST: ['poacher', 'targetMan', 'falseNine'],
}

/** Names on screen, and the short label on the pitch. */
export const ARCHETYPE_NAMES: Record<Archetype, { name: string; short: string }> = {
  shotStopper: { name: 'Shot-stopper', short: 'SK' },
  sweeperKeeper: { name: 'Sweeper keeper', short: 'SW' },
  stopper: { name: 'Stopper', short: 'STP' },
  ballPlayer: { name: 'Ball-playing defender', short: 'BPD' },
  overlapping: { name: 'Overlapping full-back', short: 'OFB' },
  inverted: { name: 'Inverted full-back', short: 'IFB' },
  defensiveFullBack: { name: 'Defensive full-back', short: 'DFB' },
  anchor: { name: 'Anchor', short: 'A' },
  deepPlaymaker: { name: 'Deep-lying playmaker', short: 'DLP' },
  boxToBox: { name: 'Box-to-box', short: 'B2B' },
  playmaker: { name: 'Playmaker', short: 'PM' },
  ballWinner: { name: 'Ball-winner', short: 'BW' },
  winger: { name: 'Winger', short: 'WG' },
  insideForward: { name: 'Inside forward', short: 'IF' },
  poacher: { name: 'Poacher', short: 'P' },
  targetMan: { name: 'Target man', short: 'TM' },
  falseNine: { name: 'False nine', short: 'F9' },
}

/** How he plays `role`: his own archetype if it's one of that position's, otherwise read off his attributes. */
export function archetypeOf(def: PlayerDef, role: Role = def.role): Archetype {
  if (def.archetype && ARCHETYPES[role].includes(def.archetype)) return def.archetype
  const a = def.attrs
  const t = def.traits
  switch (role) {
    case 'GK':
      return a.pace >= 11 ? 'sweeperKeeper' : 'shotStopper'
    case 'CB':
      return a.passing >= a.tackling - 1 ? 'ballPlayer' : 'stopper'
    case 'FB':
      if (a.tackling - a.pace >= 3 && t.workRate < 0.6) return 'defensiveFullBack'
      return a.passing - a.pace >= 3 ? 'inverted' : 'overlapping'
    case 'DM':
      if (a.tackling >= a.passing + 3 && t.aggression > 0.5) return 'ballWinner'
      return a.passing > a.tackling ? 'deepPlaymaker' : 'anchor'
    case 'CM':
      if (a.passing >= a.tackling + 2 && a.passing >= a.stamina) return 'playmaker'
      return a.tackling >= a.passing + 2 ? 'ballWinner' : 'boxToBox'
    case 'WM':
    case 'W':
      return a.shooting >= a.passing + 2 ? 'insideForward' : 'winger'
    case 'ST':
      // A false nine is rare: a better passer than finisher, and good on the ball.
      if (a.passing >= a.shooting + 1 && a.dribbling >= 12) return 'falseNine'
      // A target man wins it in the air and holds it up rather than running in behind.
      return a.pace + a.dribbling < a.shooting + a.composure - 4 ? 'targetMan' : 'poacher'
  }
}

type Shape = [pace: number, passing: number, shooting: number, tackling: number, dribbling: number, positioning: number, composure: number, stamina: number]

/**
 * What each archetype is good at, as offsets from a player's level. Every shape averages about
 * the same as the random players of its position (`makeAttributes`), so a shape changes where
 * his ability lies, not how much he has. Keepers' `keeping` is level + 1; outfield players'
 * is 1-4.
 */
const SHAPES: Record<Archetype, Shape> = {
  shotStopper: [-6, -4, -8, -6, -6, 1, 0, -3],
  sweeperKeeper: [-2, -1, -8, -6, -4, 0, 0.5, -3],
  stopper: [-3, -4, -5, 1, -5, 0.5, -2, -2],
  ballPlayer: [-3, -1, -5, 0, -3, 0.5, 0, -3],
  overlapping: [1, 0, -4, -1, -1, -2, -3, 1],
  inverted: [-1, 1, -4, -1, -1, -1, 0, 0],
  defensiveFullBack: [-1, -2, -5, 1, -3, 0.5, -2, 0],
  anchor: [-3, -0.5, -4, 1, -3, 1, -1, -1],
  deepPlaymaker: [-4, 1.5, -3, -1, -2, 0.5, 0.5, -2],
  ballWinner: [-2, -2, -4, 1.5, -3, 0, -2, 1],
  boxToBox: [-2, 0, -1, -2, -1, -1, -1, 1],
  playmaker: [-3, 1.5, -2, -4, 0.5, -1, 0.5, -2],
  winger: [1, -1, -2, -5, 1, -2, -3, -1],
  insideForward: [0, -2, 0.5, -5, 0.5, -1.5, -2, -2],
  poacher: [0.5, -4, 1, -6, -2, 1, 0.5, -3],
  targetMan: [-4, -2, 1, -5, -3, 1, 1, -3],
  falseNine: [-2, 0.5, -0.5, -5, 0.5, 0, 0, -3],
}

/**
 * Attributes for a real player: his archetype's shape at his level (1-20), with a little
 * variation. Two players of the same overall and archetype end up about as good as each other;
 * which is better on the day is down to the match, not to how his name happened to hash.
 */
export function shapedAttributes(rng: Rng, role: Role, archetype: Archetype, level: number): Attributes {
  const at = (offset: number): number => Math.round(Math.max(1, Math.min(20, level + offset + rng.gauss() * 0.7)))
  const [pace, passing, shooting, tackling, dribbling, positioning, composure, stamina] = SHAPES[archetype].map(at)
  return { pace, passing, shooting, tackling, dribbling, positioning, composure, stamina, keeping: role === 'GK' ? at(1) : rng.int(1, 4) }
}
