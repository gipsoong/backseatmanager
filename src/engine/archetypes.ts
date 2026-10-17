/**
 * Archetypes: how a player plays his position, which changes where he stands and what he does
 * (see shapeTarget and the carrier's decisions in ai.ts), not just how good he is. Every player
 * has one for his own position: given (a real player), or read off his attributes and traits.
 * Played out of position he plays the new one the way his attributes suggest.
 */
import type { Rng } from './rng.ts'
import { broad, expandAttributes } from './attributes.ts'
import type { Attributes, LegacyAttributes, PlayerDef, Role, Traits } from './types.ts'

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

/**
 * The personality that goes with each way of playing (hidden traits, 0-1): a winger's flair, a
 * ball-winner's aggression and work rate. Used for real players we know nothing more about.
 */
export const TRAIT_LEAN: Record<Archetype, Traits> = {
  shotStopper: { flair: 0.15, temper: 0.35, aggression: 0.3, workRate: 0.5, directness: 0.3 },
  sweeperKeeper: { flair: 0.3, temper: 0.35, aggression: 0.35, workRate: 0.5, directness: 0.4 },
  stopper: { flair: 0.1, temper: 0.55, aggression: 0.8, workRate: 0.55, directness: 0.3 },
  ballPlayer: { flair: 0.25, temper: 0.4, aggression: 0.6, workRate: 0.5, directness: 0.45 },
  overlapping: { flair: 0.4, temper: 0.4, aggression: 0.55, workRate: 0.85, directness: 0.55 },
  inverted: { flair: 0.35, temper: 0.35, aggression: 0.5, workRate: 0.7, directness: 0.45 },
  defensiveFullBack: { flair: 0.15, temper: 0.5, aggression: 0.7, workRate: 0.6, directness: 0.35 },
  anchor: { flair: 0.2, temper: 0.45, aggression: 0.65, workRate: 0.7, directness: 0.35 },
  deepPlaymaker: { flair: 0.5, temper: 0.35, aggression: 0.4, workRate: 0.55, directness: 0.6 },
  ballWinner: { flair: 0.2, temper: 0.6, aggression: 0.85, workRate: 0.85, directness: 0.4 },
  boxToBox: { flair: 0.45, temper: 0.45, aggression: 0.6, workRate: 0.85, directness: 0.55 },
  playmaker: { flair: 0.7, temper: 0.35, aggression: 0.3, workRate: 0.55, directness: 0.55 },
  winger: { flair: 0.75, temper: 0.35, aggression: 0.3, workRate: 0.55, directness: 0.6 },
  insideForward: { flair: 0.8, temper: 0.4, aggression: 0.35, workRate: 0.5, directness: 0.7 },
  poacher: { flair: 0.5, temper: 0.45, aggression: 0.4, workRate: 0.45, directness: 0.75 },
  targetMan: { flair: 0.3, temper: 0.5, aggression: 0.6, workRate: 0.55, directness: 0.6 },
  falseNine: { flair: 0.7, temper: 0.35, aggression: 0.35, workRate: 0.6, directness: 0.45 },
}

/** How he plays `role`: his own archetype if it's one of that position's, otherwise read off his attributes. */
export function archetypeOf(def: PlayerDef, role: Role = def.role): Archetype {
  if (def.archetype && ARCHETYPES[role].includes(def.archetype)) return def.archetype
  return archetypeFrom(broad(def.attrs), def.traits, role)
}

/** The archetype a broad profile suggests for `role`. */
export function archetypeFrom(a: LegacyAttributes, t: Traits, role: Role): Archetype {
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
 * What a point of each attribute is worth to his side, by line (shape order), measured by taking
 * two points off one attribute for a whole line over 160 matches (goals and xG for and against).
 * At the time, pace counted most nearly everywhere, passing in midfield, and finishing and
 * stamina up front; a defender's tackling and positioning barely moved results.
 */
const WORTH: Record<'def' | 'mid' | 'att', Shape> = {
  def: [0.11, 0.01, 0.005, 0.015, 0.005, 0.01, 0.005, 0.005],
  mid: [0.01, 0.075, 0.06, 0.02, 0.03, 0.015, 0.005, 0.005],
  att: [0.09, 0.05, 0.095, 0.02, 0.055, 0.005, 0.02, 0.095],
}
const LINE: Record<Role, keyof typeof WORTH | null> = { GK: null, CB: 'def', FB: 'def', DM: 'mid', CM: 'mid', WM: 'att', W: 'att', ST: 'att' }

/**
 * The shapes, each shifted up or down as a whole so that every archetype of a position is worth
 * the same to his side: a target man's slow, finishing-heavy shape no longer leaves him weaker
 * than a poacher of the same overall. (An archetype in two positions takes the average shift.)
 */
const LEVELLED: Record<Archetype, Shape> = (() => {
  const worth = (shape: Shape, w: Shape): number => shape.reduce((n, x, i) => n + x * w[i], 0)
  const shifts = new Map<Archetype, number[]>()
  for (const [role, kinds] of Object.entries(ARCHETYPES) as [Role, Archetype[]][]) {
    const line = LINE[role]
    if (!line) continue
    const w = WORTH[line]
    const target = kinds.reduce((n, k) => n + worth(SHAPES[k], w), 0) / kinds.length
    const perPoint = w.reduce((a, b) => a + b, 0)
    for (const k of kinds) shifts.set(k, [...(shifts.get(k) ?? []), (target - worth(SHAPES[k], w)) / perPoint])
  }
  return Object.fromEntries(
    (Object.keys(SHAPES) as Archetype[]).map((k) => {
      const ds = shifts.get(k) ?? [0]
      const d = ds.reduce((a, b) => a + b, 0) / ds.length
      return [k, SHAPES[k].map((x) => x + d) as Shape]
    }),
  ) as Record<Archetype, Shape>
})()

/**
 * Attributes for a real player: his archetype's shape at his level (1-20), with a little
 * variation. Two players of the same overall and archetype end up about as good as each other;
 * which is better on the day is down to the match, not to how his name happened to hash.
 */
export function shapedAttributes(rng: Rng, role: Role, archetype: Archetype, level: number): Attributes {
  const at = (offset: number): number => Math.max(1, Math.min(20, level + offset + rng.gauss() * 0.7))
  const [pace, passing, shooting, tackling, dribbling, positioning, composure, stamina] = LEVELLED[archetype].map(at)
  const profile = { pace, passing, shooting, tackling, dribbling, positioning, composure, stamina, keeping: role === 'GK' ? at(1) : rng.int(1, 4) }
  return expandAttributes(profile, role, archetype, () => rng.gauss() * 0.5)
}
