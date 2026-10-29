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

/**
 * The six ratings on a player card, FIFA's way: outfield and goalkeeper groups, each a weighted
 * average of its sub-attributes with about FIFA's weights (a striker's heading counts a tenth of his
 * defending, so a fine header can still defend like a forward).
 */
export const GROUPS: Record<'outfield' | 'keeper', { key: string; label: string; subs: Sub[]; weights: number[] }[]> = {
  outfield: [
    { key: 'PAC', label: 'Pace', subs: ['sprintSpeed', 'acceleration'], weights: [0.55, 0.45] },
    { key: 'SHO', label: 'Shooting', subs: ['finishing', 'longShots', 'shotPower', 'positioning', 'penalties'], weights: [0.45, 0.2, 0.2, 0.1, 0.05] },
    { key: 'PAS', label: 'Passing', subs: ['shortPassing', 'longPassing', 'crossing', 'vision', 'curve', 'freeKicks'], weights: [0.35, 0.15, 0.2, 0.2, 0.05, 0.05] },
    { key: 'DRI', label: 'Dribbling', subs: ['dribbling', 'ballControl', 'agility', 'reactions', 'composure'], weights: [0.45, 0.3, 0.1, 0.1, 0.05] },
    { key: 'DEF', label: 'Defending', subs: ['interceptions', 'marking', 'standingTackle', 'slidingTackle', 'heading'], weights: [0.2, 0.3, 0.3, 0.1, 0.1] },
    { key: 'PHY', label: 'Physical', subs: ['strength', 'jumping', 'stamina'], weights: [0.5, 0.15, 0.35] },
  ],
  keeper: [
    { key: 'DIV', label: 'Diving', subs: ['diving'], weights: [1] },
    { key: 'HAN', label: 'Handling', subs: ['handling'], weights: [1] },
    { key: 'KIC', label: 'Kicking', subs: ['kicking'], weights: [1] },
    { key: 'REF', label: 'Reflexes', subs: ['reflexes'], weights: [1] },
    { key: 'SPD', label: 'Speed', subs: ['sprintSpeed', 'acceleration'], weights: [0.55, 0.45] },
    { key: 'POS', label: 'Positioning', subs: ['gkPositioning'], weights: [1] },
  ],
}

const weighted = (vs: number[], ws: number[]): number => vs.reduce((n, v, i) => n + v * ws[i], 0) / ws.reduce((a, b) => a + b, 0)

/** 1-20 onto the 1-99 scale overalls use: the inverse of a draft player's level (80 is 13.5, 4 a point, 6 a point above 86). */
export const toRating = (v: number): number => Math.round(Math.max(1, Math.min(99, v <= 15 ? 80 + (v - 13.5) * 4 : 86 + (v - 15) * 6)))

export function groupRatings(a: Attributes, role: Role): { key: string; label: string; value: number }[] {
  return GROUPS[role === 'GK' ? 'keeper' : 'outfield'].map((g) => ({ key: g.key, label: g.label, value: toRating(weighted(g.subs.map((k) => a[k]), g.weights)) }))
}

/** A card rating (1-99) as a sub-attribute level: the inverse of `toRating`. */
export const fromRating = (r: number): number => (r <= 86 ? 13.5 + (r - 80) / 4 : 15 + (r - 86) / 6)

/** A card: the six group ratings in `GROUPS` order (outfield PAC SHO PAS DRI DEF PHY; keepers DIV HAN KIC REF SPD POS). */
export type Card = [number, number, number, number, number, number]

/**
 * How a position spreads each group over its sub-attributes (sub-attribute points, about the
 * group's level; only the differences count, as the group's average is the card's). A
 * centre-back's shooting is shot power and no finishing, his dribbling reactions and composure,
 * not agility. (Heading isn't fitted: see `HEADING`.)
 */
const IN_GROUP: Record<Role, Partial<Record<Sub, number>>> = {
  GK: { acceleration: 0.5 },
  CB: {
    acceleration: -0.5, finishing: -2, longShots: 0.5, shotPower: 4, positioning: -2.5,
    shortPassing: 2.5, longPassing: 1.5, crossing: -2, vision: -0.5, curve: -1, freeKicks: -0.5,
    dribbling: -2.5, ballControl: -0.5, agility: -3, reactions: 3, composure: 3,
    slidingTackle: -0.5, strength: 1, jumping: 1.5,
  },
  FB: {
    acceleration: 0.5, finishing: -1.5, shotPower: 2, positioning: -0.5,
    shortPassing: 0.5, crossing: 2.5, vision: -1, freeKicks: -2,
    agility: 0.5, composure: -0.5,
    interceptions: 0.5, marking: 0.5, standingTackle: 1, slidingTackle: 0.5, strength: -1.5, jumping: -1,
  },
  DM: {
    finishing: -1.5, longShots: 1.5, shotPower: 1.5, positioning: -1,
    shortPassing: 2, longPassing: 2, crossing: -2, vision: 0.5, curve: -1, freeKicks: -1.5,
    dribbling: -1.5, ballControl: 0.5, agility: -1.5, reactions: 1.5, composure: 1,
    interceptions: 0.5, slidingTackle: -0.5, strength: 0.5, jumping: -1,
  },
  CM: {
    finishing: -1.5, longShots: 1.5, shotPower: 1.5, positioning: -1,
    shortPassing: 1, longPassing: 0.5, crossing: -1, vision: 1, curve: -0.5, freeKicks: -1,
    ballControl: 0.5, agility: -0.5, reactions: 0.5,
    interceptions: 1, standingTackle: 0.5, strength: -1, jumping: -1,
  },
  WM: {
    acceleration: 0.5, positioning: 0.5, shotPower: -0.5,
    shortPassing: 0.5, longPassing: -1.5, crossing: 1.5, curve: 1, freeKicks: -1.5,
    dribbling: 1, agility: 1, reactions: -1, composure: -1,
    interceptions: 1, marking: -1.5, standingTackle: -1, slidingTackle: -1.5, strength: -2, jumping: 0.5,
  },
  W: {
    acceleration: 0.5, positioning: 0.5, shotPower: -0.5,
    shortPassing: 0.5, longPassing: -1.5, crossing: 1.5, curve: 1, freeKicks: -1.5,
    dribbling: 1, agility: 1, reactions: -1, composure: -1,
    interceptions: 1, marking: -1.5, standingTackle: -1, slidingTackle: -1.5, strength: -2, jumping: 0.5,
  },
  ST: {
    finishing: 1, longShots: -1, positioning: 1.5, penalties: -1.5,
    shortPassing: 2, longPassing: -1, crossing: -0.5, vision: 1, curve: -0.5, freeKicks: -1,
    dribbling: -0.5, ballControl: 0.5, agility: -1.5, reactions: 1, composure: 0.5,
    interceptions: -1, marking: -2.5, standingTackle: -2, slidingTackle: -2.5, strength: 0.5, jumping: 1,
  },
}

/** And how his way of playing spreads them, on top. */
const ARCHETYPE_IN_GROUP: Record<Archetype, Partial<Record<Sub, number>>> = {
  shotStopper: {},
  sweeperKeeper: { acceleration: 0.5 },
  stopper: { marking: 0.5, interceptions: -1, standingTackle: 0.5, slidingTackle: -1.5, strength: 1.5, jumping: 0.5 },
  ballPlayer: { longPassing: 1.5, shortPassing: 1, vision: 0.5, crossing: -1.5, curve: -0.5, freeKicks: -1, interceptions: 1, marking: -0.5 },
  overlapping: { crossing: 1.5, vision: -0.5, longPassing: -0.5, freeKicks: -0.5, strength: -1 },
  inverted: { shortPassing: 1.5, vision: 1, crossing: -1.5, longPassing: -0.5, freeKicks: -0.5 },
  defensiveFullBack: { marking: 1, standingTackle: 0.5, interceptions: -1.5, slidingTackle: -1, crossing: -1.5, shortPassing: 1, longPassing: 0.5 },
  anchor: { interceptions: 0.5, marking: 1, slidingTackle: -1, standingTackle: -1.5, strength: 1.5, jumping: -1 },
  deepPlaymaker: { longPassing: 1.5, vision: 1, crossing: -1.5, curve: -0.5, freeKicks: -0.5 },
  ballWinner: { interceptions: 1, standingTackle: 1, slidingTackle: 1, marking: -0.5, jumping: -1.5 },
  boxToBox: { longShots: 1, shotPower: 0.5, positioning: 0.5, penalties: -2, strength: -0.5, jumping: -1 },
  playmaker: { vision: 1.5, freeKicks: 0.5, crossing: -1, longPassing: -1, ballControl: 0.5, agility: 0.5, reactions: -1 },
  winger: { crossing: 1.5, curve: 0.5, longPassing: -1, vision: -1, agility: 1, dribbling: 0.5, reactions: -1.5 },
  insideForward: { curve: 1, crossing: -1.5, vision: 0.5, finishing: 0.5, longShots: 0.5, positioning: -1 },
  poacher: { finishing: 1, positioning: 1, longShots: -2, reactions: 1.5, composure: 0.5, agility: -0.5, dribbling: -1.5 },
  targetMan: { jumping: 2, strength: 2, acceleration: -1.5, sprintSpeed: 1.5 },
  falseNine: { vision: 1.5, shortPassing: 1, crossing: -1, freeKicks: -1.5, ballControl: 1, reactions: -1 },
}

/**
 * Sub-attributes that show `card`: each group's sub-attributes spread about its level by his
 * position and archetype (and `jitter`), then moved together until their average is the card's
 * (clamped to 1-20) and rounded keeping the group's total. Anything not on the card (a keeper's
 * outfield skills, an outfield player's goalkeeping) stays as in `base`.
 */
export function cardAttributes(base: Attributes, card: Card, role: Role, archetype: Archetype, overall: number, jitter: () => number): Attributes {
  const out = { ...base }
  // Heading and stamina aren't read off the card (a tenth of defending; physique is mostly
  // strength, and FIFA's has aggression in it too): his level by position and archetype, less for a
  // slight man (physique under his overall).
  const lean = (card[5] - overall) / 10
  const own = (t: Record<Role, number>, a: Partial<Record<Archetype, number>>): number =>
    Math.max(1, Math.min(20, Math.round(fromRating(overall) + t[role] + (a[archetype] ?? 0) + lean + jitter())))
  const fixedAt: Partial<Record<Sub, number>> = { heading: own(HEADING, HEADING_ARCHETYPE), stamina: own(STAMINA, STAMINA_ARCHETYPE) }
  GROUPS[role === 'GK' ? 'keeper' : 'outfield'].forEach((g, gi) => {
    const want = Math.max(1, Math.min(20, fromRating(card[gi])))
    const raw = g.subs.map((k) => (IN_GROUP[role][k] ?? 0) + (ARCHETYPE_IN_GROUP[archetype][k] ?? 0) + jitter())
    const fixed = g.subs.map((k) => (role === 'GK' ? null : (fixedAt[k] ?? null)))
    const at = (c: number): number[] => raw.map((t, i) => fixed[i] ?? Math.max(1, Math.min(20, want + t + c)))
    // The shift that brings the clamped average to the card's: bisection (the average only rises with it).
    let lo = -25
    let hi = 25
    for (let i = 0; i < 40; i++) {
      const mid = (lo + hi) / 2
      if (weighted(at(mid), g.weights) < want) lo = mid
      else hi = mid
    }
    // Round to whole points, or quarters in a group of one or two, where a point is up to 6 on the
    // card. The largest remainders round up, keeping the group's total.
    const step = g.subs.length <= 2 ? 4 : 1
    const vs = at((lo + hi) / 2).map((v) => v * step)
    const total = Math.round(vs.reduce((x, y) => x + y, 0))
    const floors = vs.map(Math.floor)
    let left = total - floors.reduce((x, y) => x + y, 0)
    const order = vs.map((v, i) => [v - Math.floor(v), i] as const).sort((x, y) => y[0] - x[0])
    for (const [, i] of order) if (left-- > 0) floors[i]++
    g.subs.forEach((k, i) => (out[k] = Math.max(1, Math.min(20, floors[i] / step))))
  })
  return out
}

/** Heading, about his level: centre-backs and target men above it, wide men and playmakers below. */
const HEADING: Record<Role, number> = { GK: -6, CB: 1, FB: -2, DM: -1, CM: -2.5, WM: -4, W: -4, ST: 0 }
const HEADING_ARCHETYPE: Partial<Record<Archetype, number>> = { targetMan: 2, stopper: 0.5, falseNine: -1, ballWinner: -1, winger: -1, insideForward: -0.5, playmaker: -1.5 }
/** Stamina, a little under his level: more for full-backs and midfielders, less for centre-backs and strikers. */
const STAMINA: Record<Role, number> = { GK: -6, CB: -3, FB: -0.5, DM: -1.5, CM: -0.5, WM: -1, W: -1.5, ST: -3 }
const STAMINA_ARCHETYPE: Partial<Record<Archetype, number>> = { boxToBox: 1, ballWinner: 1, overlapping: 0.5, targetMan: -1, playmaker: -0.5, deepPlaymaker: -0.5 }

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
