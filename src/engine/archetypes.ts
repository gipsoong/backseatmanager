/**
 * Archetypes: how a player plays his position, which changes where he stands and what he does
 * (see shapeTarget and the carrier's decisions in ai.ts), not just how good he is. Every player
 * has one for his own position: given (a real player), or read off his attributes and traits.
 * Played out of position he plays the new one the way his attributes suggest.
 */
import type { PlayerDef, Role } from './types.ts'

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
