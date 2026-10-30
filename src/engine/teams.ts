import { clamp } from './geometry.ts'
import { Rng } from './rng.ts'
import { type Archetype, archetypeFrom, cardFor } from './archetypes.ts'
import { CARD_GAP, type Card, OVERALL_SHIFT, POSITIONAL, cardAttributes, expandAttributes, fromRating, positionLevel, ratingAt } from './attributes.ts'
import type { Attributes, Block, Formation, Kit, LegacyAttributes, PlayerDef, Role, Slot, TeamDef, Traits } from './types.ts'

const s = (role: Role, depth: number, y: number, attackDepth = 0): Slot => ({ role, depth, y, attackDepth })

/** Slot order matches TeamDef.players. y is in the attacking frame (0..68). */
export const FORMATIONS: Record<Formation, Slot[]> = {
  '4-4-2': [
    s('GK', -1, 34),
    s('FB', 0, 60, 0.35),
    s('CB', 0, 42),
    s('CB', 0, 26),
    s('FB', 0, 8, 0.35),
    s('WM', 0.5, 58, 0.25),
    // The two in the middle get forward a little with the ball (standing still, the shape was worth
    // ~0.25 xG a match less than one with a midfield three).
    s('CM', 0.45, 40, 0.15),
    s('CM', 0.45, 28, 0.15),
    s('WM', 0.5, 10, 0.25),
    s('ST', 1, 40),
    // The second striker plays off the first: a little deeper, arriving late rather than on the shoulder.
    s('ST', 0.85, 28, 0.05),
  ],
  '4-3-3': [
    s('GK', -1, 34),
    s('FB', 0, 60, 0.35),
    s('CB', 0, 42),
    s('CB', 0, 26),
    s('FB', 0, 8, 0.35),
    s('DM', 0.25, 34),
    s('CM', 0.5, 45, 0.1),
    s('CM', 0.5, 23, 0.1),
    s('W', 0.85, 56, 0.2),
    s('ST', 1, 34),
    s('W', 0.85, 12, 0.2),
  ],
  // Two holding midfielders (one steps up with the ball), a No. 10 behind the striker, wingers
  // either side of him.
  '4-2-3-1': [
    s('GK', -1, 34),
    s('FB', 0, 60, 0.35),
    s('CB', 0, 42),
    s('CB', 0, 26),
    s('FB', 0, 8, 0.35),
    s('DM', 0.25, 41),
    // The second steps up with the ball (at 0.3 + 0.2 the shape was ~0.3 xG a match short).
    s('DM', 0.35, 27, 0.3),
    s('W', 0.8, 56, 0.2),
    s('CM', 0.7, 34, 0.15),
    s('W', 0.8, 12, 0.2),
    s('ST', 1, 34),
  ],
  // One screening midfielder, a line of four in front of him.
  '4-1-4-1': [
    s('GK', -1, 34),
    s('FB', 0, 60, 0.35),
    s('CB', 0, 42),
    s('CB', 0, 26),
    s('FB', 0, 8, 0.35),
    s('DM', 0.22, 34),
    s('WM', 0.55, 58, 0.3),
    s('CM', 0.5, 42, 0.2),
    s('CM', 0.5, 26, 0.2),
    s('WM', 0.55, 10, 0.3),
    s('ST', 1, 34),
  ],
  // Three centre-backs; the wing-backs are full-backs who defend in a five and attack in a five.
  '3-5-2': [
    s('GK', -1, 34),
    s('CB', 0, 47),
    s('CB', 0, 34),
    s('CB', 0, 21),
    s('FB', 0, 63, 0.85),
    s('CM', 0.45, 44, 0.2),
    s('DM', 0.25, 34),
    s('CM', 0.45, 24, 0.2),
    s('FB', 0, 5, 0.85),
    s('ST', 1, 40),
    // The second striker plays off the first: a little deeper, arriving late rather than on the shoulder.
    s('ST', 0.85, 28, 0.05),
  ],
  '3-4-3': [
    s('GK', -1, 34),
    s('CB', 0, 47),
    s('CB', 0, 34),
    s('CB', 0, 21),
    s('FB', 0, 63, 0.85),
    // The midfield two stand as high as a 4-3-3's pair, with three centre-backs behind them: at 0.4
    // they left the shape ~0.4 xG a match short.
    s('CM', 0.5, 40, 0.2),
    s('CM', 0.5, 28, 0.2),
    s('FB', 0, 5, 0.85),
    // The wide forwards play inside the wing-backs, who give the width: on the same line as them they
    // crowded one flank and left the side ~0.2 xG a match short.
    s('W', 0.85, 52, 0.1),
    s('ST', 1, 34),
    s('W', 0.85, 16, 0.1),
  ],
}

export const FORMATION_NAMES = Object.keys(FORMATIONS) as Formation[]

/** No green shirts: they'd vanish against the pitch. */
export const KITS: Kit[] = [
  { shirt: '#1f3a68', number: '#ffffff', family: 'blue' },
  { shirt: '#7a1f2b', number: '#f1dfb0', family: 'red' },
  { shirt: '#c8202f', number: '#ffffff', family: 'red' },
  { shirt: '#f2f2ee', number: '#1b1f1c', family: 'white' },
  { shirt: '#f0c330', number: '#1b1f1c', family: 'yellow' },
  { shirt: '#79b4e0', number: '#10263d', family: 'blue' },
  { shirt: '#232527', number: '#f2f2ee', family: 'black' },
  { shirt: '#e8742a', number: '#1b1f1c', family: 'orange' },
  { shirt: '#5b2a86', number: '#ffffff', family: 'purple' },
  { shirt: '#9aa3ab', number: '#16191b', family: 'grey' },
  { shirt: '#e3a6bd', number: '#2a1620', family: 'pink' },
]

const FIRST = ['Alex', 'Ben', 'Carlos', 'Dani', 'Emre', 'Felix', 'Gabi', 'Hugo', 'Ivan', 'Jonas', 'Kofi', 'Luca', 'Marco', 'Nico', 'Omar', 'Pau', 'Rui', 'Sami', 'Theo', 'Yann']
const LAST = ['Adler', 'Baptiste', 'Costa', 'Doyle', 'Eriksen', 'Ferreira', 'Grant', 'Haas', 'Iversen', 'Jansen', 'Keane', 'Lindqvist', 'Moreau', 'Novak', 'Okafor', 'Pereira', 'Quinn', 'Rossi', 'Silva', 'Varga', 'Walsh', 'Young']
/**
 * More surnames, for league clubs (randomTeam keeps to LAST so friendlies and calibration play the
 * same): enough that nobody in a squad shares a surname.
 */
const MORE_LAST = [
  'Ahmed', 'Barros', 'Bauer', 'Brennan', 'Castro', 'Dahl', 'Diallo', 'Duarte', 'Engel', 'Fischer',
  'Fontaine', 'Garcia', 'Hansen', 'Holm', 'Ibarra', 'Jovic', 'Kaya', 'Kovac', 'Lambert', 'Larsen',
  'Lopez', 'Mendes', 'Meyer', 'Murphy', 'Nash', 'Nilsson', 'Olsen', 'Ortiz', 'Petit', 'Ramos',
  'Reyes', 'Sandoval', 'Schmidt', 'Sorensen', 'Torres', 'Unal', 'Vidal', 'Weber', 'Yilmaz', 'Zielinski',
]
const ALL_LAST = [...LAST, ...MORE_LAST]

/** Club names: no two share their first three letters, which are their short name. */
const CLUBS = [
  'Ashford',
  'Brookvale',
  'Castleton',
  'Dunmore',
  'Eastwick',
  'Fairhaven',
  'Glenmoor',
  'Harrow Vale',
  'Ironbridge',
  'Kingsport',
  'Lowbridge',
  'Marlow',
  'Northgate',
  'Oakham',
  'Pembrook',
  'Queensferry',
  'Redcliff',
  'Stonehaven',
  'Thornbury',
  'Westerley',
]

/** Nine substitutes, as in the Premier League: cover for every line. */
const BENCH_ROLES: Role[] = ['GK', 'CB', 'CB', 'FB', 'DM', 'CM', 'WM', 'W', 'ST']

/** Role-specific attribute emphasis: which attributes are strengths. */
const ROLE_FOCUS: Record<Role, (keyof LegacyAttributes)[]> = {
  GK: ['keeping', 'positioning', 'composure'],
  CB: ['tackling', 'positioning'],
  FB: ['pace', 'tackling', 'passing', 'stamina'],
  DM: ['tackling', 'passing', 'positioning'],
  CM: ['passing', 'composure', 'dribbling', 'stamina'],
  WM: ['pace', 'passing', 'dribbling', 'stamina'],
  W: ['pace', 'dribbling', 'shooting'],
  ST: ['shooting', 'composure', 'pace'],
}

/** A made-up player's broad profile (the nine attributes sub-attributes are made from). */
function makeProfile(rng: Rng, role: Role, quality: number): LegacyAttributes {
  const base = (): number => Math.round(Math.max(1, Math.min(20, quality - 3 + rng.gauss() * 2)))
  const attrs: LegacyAttributes = {
    pace: base(),
    passing: base(),
    shooting: base(),
    tackling: base(),
    dribbling: base(),
    positioning: base(),
    composure: base(),
    keeping: role === 'GK' ? base() : rng.int(1, 4),
    stamina: base(),
  }
  for (const k of ROLE_FOCUS[role]) attrs[k] = Math.min(20, attrs[k] + rng.int(2, 5))
  return attrs
}

/** A made-up player's sub-attributes: a random profile for his position, played his way. */
export function makeAttributes(rng: Rng, role: Role, quality: number, traits: Traits): Attributes {
  const profile = makeProfile(rng, role, quality)
  return expandAttributes(profile, role, archetypeFrom(profile, traits, role), () => rng.gauss() * 0.8)
}

/** Hidden traits, spread across the whole range but leaning the way players in a role tend to. */
export function makeTraits(rng: Rng, role: Role): Traits {
  const lean = (k: number): number => clamp(rng.next() * 0.8 + k * 0.2 + rng.gauss() * 0.05, 0, 1)
  const attacker = role === 'W' || role === 'WM' || role === 'ST'
  const defender = role === 'CB' || role === 'DM' || role === 'FB'
  return {
    flair: lean(attacker ? 0.8 : role === 'CM' ? 0.5 : 0.2),
    temper: lean(defender ? 0.6 : 0.4),
    aggression: lean(defender ? 0.8 : role === 'GK' ? 0.3 : 0.4),
    workRate: lean(role === 'CM' || role === 'FB' || role === 'DM' ? 0.8 : 0.5),
    directness: lean(role === 'ST' || role === 'W' ? 0.7 : role === 'CB' || role === 'GK' ? 0.3 : 0.5),
  }
}

/**
 * How far a made-up player's position level (`positionLevel`) sits from his squad's quality: where
 * the old profiles' position skills sat, so sides play as strongly as they did.
 */
const CARD_LEVEL: Record<Role, number> = { GK: 0, CB: 0.15, FB: -0.4, DM: 0.1, CM: 0.05, WM: 0.1, W: -0.65, ST: -0.4 }

/**
 * A made-up player's card: his archetype's at the overall that puts his position's skills at his
 * quality, varied a little group by group, and by build: some quick and slight, some slow and
 * strong, so two strikers of a level aren't the same man.
 */
function madeCard(rng: Rng, base: Attributes, role: Role, archetype: Archetype, quality: number): Attributes {
  const target = quality + CARD_LEVEL[role]
  const vary = Array.from({ length: 6 }, () => rng.gauss() * 3)
  // A wide midfielder tracks back more than a winger.
  if (role === 'WM') vary[4] += 10
  if (role !== 'GK') {
    const build = rng.gauss()
    vary[0] += 5 * build
    vary[5] -= 4 * build
  }
  // The same jitter each time round, so only the overall moves.
  const jitters: number[] = []
  let x = ratingAt(target)
  let attrs = base
  for (let round = 0; round < 4; round++) {
    let i = 0
    const jitter = (): number => (jitters[i] ??= rng.gauss() * 0.7, jitters[i++])
    const card = cardFor(archetype, x).map((v, g) => Math.round(Math.max(30, Math.min(99, v + vary[g])))) as Card
    attrs = cardAttributes(base, card, role, archetype, x, jitter)
    x += (target - positionLevel(attrs, role)) * (x < 86 ? 4 : 6)
  }
  return attrs
}

function madeUp(rng: Rng, role: Role, quality: number): Pick<PlayerDef, 'attrs' | 'traits' | 'archetype' | 'card'> {
  const traits = makeTraits(rng, role)
  const profile = makeProfile(rng, role, quality)
  const archetype = archetypeFrom(profile, traits, role)
  const base = expandAttributes(profile, role, archetype, () => rng.gauss() * 0.8)
  return { attrs: madeCard(rng, base, role, archetype, quality), traits, archetype, card: true }
}

/**
 * One made-up player, as randomTeam makes them (a youth player or a signing between seasons): his
 * attributes, traits, positions and feet. Draws from `rng` only; teams already made are untouched.
 */
export function makePlayer(rng: Rng, id: string, name: string, shirt: number, role: Role, quality: number): PlayerDef {
  return { id, name, shirt, role, ...madeUp(rng, role, quality), positions: makePositions(rng, role), ...makeFeet(rng) }
}

/**
 * A made-up player whose overall (FIFA-like, `cardOverall`) is about `overall`: his card at the
 * quality that gives it.
 */
export const makePlayerAt = (rng: Rng, id: string, name: string, shirt: number, role: Role, overall: number): PlayerDef =>
  makePlayer(rng, id, name, shirt, role, fromRating(overall - CARD_GAP[role]) - CARD_LEVEL[role])

/** A made-up name, from the same lists as the clubs' players. */
export const madeUpName = (rng: Rng): string => `${rng.pick(FIRST)} ${rng.pick(ALL_LAST)}`

/** A made-up name whose surname nobody in `taken` (names) has. */
export function freshName(rng: Rng, taken: Iterable<string>): string {
  const surnames = new Set([...taken].map((n) => n.split(' ').at(-1)))
  let name = madeUpName(rng)
  for (let i = 0; i < 200 && surnames.has(name.split(' ').at(-1)); i++) name = madeUpName(rng)
  return name
}

/** A squad where no two players share a surname: the later ones renamed. */
function distinctSurnames(t: TeamDef, rng: Rng): TeamDef {
  const seen: string[] = []
  const rename = (p: PlayerDef): PlayerDef => {
    const name = seen.some((n) => n.split(' ').at(-1) === p.name.split(' ').at(-1)) ? freshName(rng, seen) : p.name
    seen.push(name)
    return name === p.name ? p : { ...p, name }
  }
  return { ...t, players: t.players.map(rename), bench: t.bench.map(rename) }
}

export function randomTeam(seed: number, block?: Block, formation?: Formation): TeamDef {
  const rng = new Rng(seed)
  const f = formation ?? rng.pick(FORMATION_NAMES)
  // Squad strength: from a relegation battler to a title contender, in the same league. About
  // as wide as the Premier League's real squads (draft mode): ability now decides more than it did.
  const quality = 12 + rng.int(0, 4) / 2
  const names = new Set<string>()
  const uniqueName = (): string => {
    let name: string
    do name = `${rng.pick(FIRST)} ${rng.pick(LAST)}`
    while (names.has(name))
    names.add(name)
    return name
  }
  const players: PlayerDef[] = FORMATIONS[f].map((slot, i) => {
    const name = uniqueName()
    const made = madeUp(rng, slot.role, quality)
    return { id: `${seed}-${i}`, name, shirt: i + 1, role: slot.role, ...made, positions: makePositions(rng, slot.role), ...makeFeet(rng, slot, made.archetype) }
  })
  // A bench covering every line, a notch below the first team.
  const bench: PlayerDef[] = BENCH_ROLES.map((role, i) => ({
    id: `${seed}-${11 + i}`,
    name: uniqueName(),
    shirt: 12 + i,
    role,
    ...madeUp(rng, role, quality - 1),
    positions: makePositions(rng, role),
    ...makeFeet(rng),
  }))
  const name = rng.pick(CLUBS)
  return {
    name,
    shortName: name.slice(0, 3).toUpperCase(),
    kit: rng.pick(KITS),
    formation: f,
    block: block ?? rng.pick(['low', 'mid', 'high'] as const),
    players,
    bench,
  }
}

/**
 * The teams of a league: `n` random squads with different club names, short names and (as far as
 * there are enough) kits. Deterministic in `seed`.
 */
export function leagueTeams(seed: number, n: number): TeamDef[] {
  const rng = new Rng(seed)
  const names = rng.shuffle([...CLUBS]).slice(0, n)
  const kits = rng.shuffle([...KITS])
  const renaming = new Rng(seed * 7 + 3)
  return names.map((name, i) => ({
    ...distinctSurnames(randomTeam(seed * 1000 + i + 1), renaming),
    name,
    shortName: name.slice(0, 3).toUpperCase(),
    kit: kits[i % kits.length],
  }))
}

/** Which positions a player can fill, best first: his own, then the same line. */
const LINES: Record<Role, Role[]> = {
  GK: ['GK'],
  CB: ['CB', 'FB', 'DM'],
  FB: ['FB', 'WM', 'CB'],
  DM: ['DM', 'CM', 'CB'],
  CM: ['CM', 'DM', 'WM'],
  WM: ['WM', 'W', 'FB', 'CM'],
  W: ['W', 'WM', 'ST'],
  ST: ['ST', 'W'],
}

/**
 * How familiar `def` is with a position, 0-1: 1 in his own, 0.95 and 0.9 in his secondary and
 * tertiary positions, 0.75 elsewhere in a line he knows, 0.55 anywhere else, 0 in or out of goal.
 */
/** Which flank a place is on, facing up the pitch (y above 40 is the right), or null if central. */
export const sideOf = (slot: Slot): 'L' | 'R' | null => (slot.y > 40 ? 'R' : slot.y < 28 ? 'L' : null)

/**
 * The flank a wide player is at home on: his strong foot's side (a left-footer at left-back), or
 * the other one for an inside forward, who cuts in onto his strong foot.
 */
export function naturalSide(def: PlayerDef): 'L' | 'R' {
  if (def.side) return def.side
  const footSide = def.foot === 'left' ? 'L' : 'R'
  return def.archetype === 'insideForward' ? (footSide === 'L' ? 'R' : 'L') : footSide
}

const WIDE: Role[] = ['FB', 'WM', 'W']

/**
 * How familiar a player is with a place: his own position, one he lists, his line, or neither.
 * Given the place itself (not just its role), a wide player on his wrong flank loses a tenth:
 * Robertson at right-back crosses on his weaker foot and turns the wrong way.
 */
export function fitFor(def: PlayerDef, place: Role | Slot): number {
  const role = typeof place === 'string' ? place : place.role
  const side = typeof place === 'string' ? null : sideOf(place)
  const wrongSide = side !== null && WIDE.includes(role) && naturalSide(def) !== side ? 0.9 : 1
  if (role === def.role) return wrongSide
  if (role === 'GK' || def.role === 'GK') return 0
  const i = def.positions?.indexOf(role) ?? -1
  if (i >= 0) return (i === 0 ? 0.95 : 0.9) * wrongSide
  return (LINES[def.role].includes(role) ? 0.75 : 0.55) * wrongSide
}

export function playingAttributes(def: PlayerDef, place: Role | Slot): Attributes {
  const fit = fitFor(def, place)
  if (fit >= 1 || fit === 0) return def.attrs
  const k = 0.55 + 0.45 * fit
  const attrs = { ...def.attrs }
  for (const a of POSITIONAL) attrs[a] = def.attrs[a] * k
  return attrs
}

/**
 * Made-up players' feet: about one in four left-footed; most with an average weaker foot. Wide
 * players are mostly on their own foot's flank, as clubs pick them.
 */
function makeFeet(rng: Rng, slot?: Slot, archetype?: Archetype): Pick<PlayerDef, 'foot' | 'weakFoot'> {
  const flank = slot && WIDE.includes(slot.role) ? sideOf(slot) : null
  // An inside forward is picked for the flank across from his foot.
  const side = flank && archetype === 'insideForward' ? (flank === 'L' ? 'R' : 'L') : flank
  const foot = rng.chance(side === 'L' ? 0.85 : side === 'R' ? 0.1 : 0.25) ? 'left' : 'right'
  const r = rng.next()
  return { foot, weakFoot: r < 0.15 ? 2 : r < 0.75 ? 3 : r < 0.95 ? 4 : 5 }
}

/** Made-up players: some can play a second position in their line, a few a third. */
function makePositions(rng: Rng, role: Role): Role[] | undefined {
  const near = LINES[role].slice(1)
  if (role === 'GK' || !rng.chance(0.55)) return undefined
  const positions = [near[rng.int(0, near.length - 1)]]
  const third = near.filter((r) => r !== positions[0])
  if (third.length && rng.chance(0.3)) positions.push(third[rng.int(0, third.length - 1)])
  return positions
}

/**
 * How good the staff think he is, 1-20, for picking elevens and substitutes: a real player's own
 * overall (out of 100) scaled down; a card-made player's position skills (`positionLevel`, onto
 * the old club scale); otherwise (older saves) the even average of his outfield or goalkeeping
 * attributes. Not the overall shown for a made-up player (`cardOverall`, on the draft's scale):
 * kept as it was so every pick, and so every match, plays as before.
 */
export function ability(def: PlayerDef): number {
  if (def.overall) return def.overall / 5
  if (def.card) return positionLevel(def.attrs, def.role) + OVERALL_SHIFT[def.role]
  const a = def.attrs
  const vals = def.role === 'GK' ? [a.diving, a.handling, a.reflexes, a.gkPositioning, a.kicking] : (Object.keys(a) as (keyof Attributes)[]).filter((k) => !GK_ONLY.includes(k)).map((k) => a[k])
  return vals.reduce((x, y) => x + y, 0) / vals.length
}

const GK_ONLY: (keyof Attributes)[] = ['diving', 'handling', 'reflexes', 'gkPositioning', 'kicking']
