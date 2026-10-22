/**
 * Sub-attributes (attributes v2): how a player's 26 outfield and 5 goalkeeping numbers are made
 * from a broad profile, how old saves are converted, and the simple group ratings a card shows.
 *
 * A profile is the nine broad attributes the game had before (pace, passing, shooting, tackling,
 * dribbling, positioning, composure, stamina, keeping). Each sub-attribute starts from the broad one
 * it belongs to, then his position and archetype move it: a centre-back heads and jumps better
 * than his level, a winger turns better and is lighter, a target man is strong in the air.
 */
import type { Archetype } from './archetypes.ts'
import type { Attributes, LegacyAttributes, Role } from './types.ts'

type Sub = keyof Attributes

const avg = (...xs: number[]): number => xs.reduce((a, b) => a + b, 0) / xs.length

/** Where each sub-attribute starts, from the broad profile (`level` = his outfield average). */
function fromProfile(l: LegacyAttributes, level: number, gk: boolean): Attributes {
  return {
    sprintSpeed: l.pace,
    acceleration: l.pace,
    finishing: l.shooting,
    longShots: l.shooting - 1,
    shotPower: l.shooting,
    positioning: l.positioning,
    penalties: avg(l.shooting, l.composure),
    shortPassing: l.passing + 0.5,
    longPassing: l.passing - 0.5,
    crossing: l.passing,
    vision: l.passing,
    curve: l.passing - 1,
    freeKicks: l.passing - 2,
    dribbling: l.dribbling,
    ballControl: l.dribbling + 0.5,
    agility: avg(l.dribbling, l.pace),
    reactions: avg(l.positioning, l.composure),
    composure: l.composure,
    interceptions: avg(l.tackling, l.positioning),
    marking: avg(l.tackling, l.positioning),
    standingTackle: l.tackling,
    slidingTackle: l.tackling - 1,
    heading: level - 1,
    strength: level - 1,
    jumping: level - 1,
    stamina: l.stamina,
    diving: l.keeping,
    handling: l.keeping,
    reflexes: l.keeping,
    gkPositioning: gk ? avg(l.keeping, l.positioning) : l.keeping,
    kicking: gk ? l.passing : l.keeping,
  }
}

/** What playing a position does to the sub-attributes, on top of the profile. */
const ROLE_TWEAKS: Record<Role, Partial<Record<Sub, number>>> = {
  GK: { heading: -4, jumping: 2, strength: 1 },
  CB: { heading: 4, jumping: 3, strength: 3, agility: -2, acceleration: -1, crossing: -3, curve: -2, freeKicks: -2, finishing: -1, longShots: -1 },
  FB: { crossing: 1, heading: -1 },
  DM: { interceptions: 1, strength: 1, heading: 1 },
  CM: { vision: 1, longShots: 1 },
  WM: { crossing: 1, agility: 1, strength: -2, heading: -2 },
  W: { agility: 2, acceleration: 1, strength: -3, heading: -3, jumping: -2 },
  ST: { heading: 1, jumping: 1, positioning: 1, strength: 1 },
}

/** What his way of playing does to them. */
const ARCHETYPE_TWEAKS: Record<Archetype, Partial<Record<Sub, number>>> = {
  shotStopper: { reflexes: 1, gkPositioning: 1, kicking: -1 },
  sweeperKeeper: { kicking: 1, acceleration: 1, handling: -0.5 },
  stopper: { heading: 1, strength: 2, marking: 1, interceptions: -1 },
  ballPlayer: { longPassing: 2, vision: 1, interceptions: 1, strength: -1 },
  overlapping: { crossing: 2, acceleration: 0.5 },
  inverted: { shortPassing: 1, vision: 1, crossing: -1 },
  defensiveFullBack: { marking: 2, standingTackle: 1, crossing: -1, heading: 1 },
  anchor: { interceptions: 2, marking: 1 },
  deepPlaymaker: { longPassing: 2, vision: 2, curve: 1 },
  ballWinner: { standingTackle: 1, slidingTackle: 2, strength: 1 },
  boxToBox: { stamina: 1, longShots: 1, strength: 1 },
  playmaker: { vision: 2, curve: 1, freeKicks: 1 },
  winger: { crossing: 2, curve: 1, agility: 1 },
  insideForward: { finishing: 1, curve: 1, longShots: 1, crossing: -1 },
  poacher: { finishing: 2, acceleration: 1, reactions: 2, longShots: -2 },
  targetMan: { heading: 4, jumping: 3, strength: 4, acceleration: -2, agility: -2 },
  falseNine: { vision: 2, ballControl: 1, shortPassing: 1 },
}

const GK_SUBS: Sub[] = ['diving', 'handling', 'reflexes', 'gkPositioning', 'kicking']

/**
 * His sub-attributes from a broad profile, for his position and archetype. `jitter` adds a little
 * variety to each (pass () => 0 for none: converting a save).
 */
export function expandAttributes(profile: LegacyAttributes, role: Role, archetype: Archetype, jitter: () => number): Attributes {
  const gk = role === 'GK'
  const { keeping: _k, ...outfield } = profile
  const level = avg(...Object.values(outfield))
  const a = fromProfile(profile, level, gk)
  const out = {} as Attributes
  for (const k of Object.keys(a) as Sub[]) {
    // An outfield player's goalkeeping stays at his 1-4.
    if (!gk && GK_SUBS.includes(k)) {
      out[k] = profile.keeping
      continue
    }
    const v = a[k] + (ROLE_TWEAKS[role][k] ?? 0) + (ARCHETYPE_TWEAKS[archetype][k] ?? 0) + jitter()
    out[k] = Math.round(Math.max(1, Math.min(20, v)))
  }
  return out
}

/** A saved player from before sub-attributes: the same player, expanded with no variety. */
export function upgradeAttributes(attrs: Attributes | LegacyAttributes, role: Role, archetype: Archetype): Attributes {
  return 'pace' in attrs ? expandAttributes(attrs, role, archetype, () => 0) : attrs
}

/**
 * The broad view of his sub-attributes (the old nine), for reading an archetype off a made-up
 * player and for anything that only needs a rough picture.
 */
export function broad(a: Attributes): LegacyAttributes {
  return {
    pace: avg(a.sprintSpeed, a.acceleration),
    passing: avg(a.shortPassing, a.longPassing, a.vision),
    shooting: avg(a.finishing, a.longShots, a.shotPower),
    tackling: avg(a.standingTackle, a.slidingTackle),
    dribbling: avg(a.dribbling, a.ballControl),
    positioning: a.positioning,
    composure: a.composure,
    stamina: a.stamina,
    keeping: avg(a.diving, a.handling, a.reflexes),
  }
}

/** The six ratings on a player card, FIFA's way: outfield and goalkeeper groups. */
export const GROUPS: Record<'outfield' | 'keeper', { key: string; label: string; subs: Sub[] }[]> = {
  outfield: [
    { key: 'PAC', label: 'Pace', subs: ['sprintSpeed', 'acceleration'] },
    { key: 'SHO', label: 'Shooting', subs: ['finishing', 'longShots', 'shotPower', 'positioning', 'penalties'] },
    { key: 'PAS', label: 'Passing', subs: ['shortPassing', 'longPassing', 'crossing', 'vision', 'curve', 'freeKicks'] },
    { key: 'DRI', label: 'Dribbling', subs: ['dribbling', 'ballControl', 'agility', 'reactions', 'composure'] },
    { key: 'DEF', label: 'Defending', subs: ['interceptions', 'marking', 'standingTackle', 'slidingTackle', 'heading'] },
    { key: 'PHY', label: 'Physical', subs: ['strength', 'jumping', 'stamina'] },
  ],
  keeper: [
    { key: 'DIV', label: 'Diving', subs: ['diving'] },
    { key: 'HAN', label: 'Handling', subs: ['handling'] },
    { key: 'KIC', label: 'Kicking', subs: ['kicking'] },
    { key: 'REF', label: 'Reflexes', subs: ['reflexes'] },
    { key: 'SPD', label: 'Speed', subs: ['sprintSpeed', 'acceleration'] },
    { key: 'POS', label: 'Positioning', subs: ['gkPositioning'] },
  ],
}

/** 1-20 onto the 1-99 scale overalls use: the inverse of a draft player's level (80 is 13.5, 4 a point, 6 a point above 86). */
export const toRating = (v: number): number => Math.round(Math.max(1, Math.min(99, v <= 15 ? 80 + (v - 13.5) * 4 : 86 + (v - 15) * 6)))

export function groupRatings(a: Attributes, role: Role): { key: string; label: string; value: number }[] {
  return GROUPS[role === 'GK' ? 'keeper' : 'outfield'].map((g) => ({ key: g.key, label: g.label, value: toRating(avg(...g.subs.map((k) => a[k]))) }))
}

/** Sub-attributes that come from knowing a position: technique and reading the game, not the body. */
export const POSITIONAL: Sub[] = [
  'finishing',
  'longShots',
  'shotPower',
  'positioning',
  'penalties',
  'shortPassing',
  'longPassing',
  'crossing',
  'vision',
  'curve',
  'freeKicks',
  'dribbling',
  'ballControl',
  'reactions',
  'composure',
  'interceptions',
  'marking',
  'standingTackle',
  'slidingTackle',
  'heading',
]
