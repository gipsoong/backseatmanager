import { clamp } from './geometry.ts'
import { Rng } from './rng.ts'
import type { Attributes, Block, Formation, Kit, PlayerDef, Role, Slot, TeamDef, Traits } from './types.ts'

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
    s('CM', 0.45, 40),
    s('CM', 0.45, 28),
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
    s('DM', 0.3, 27, 0.2),
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
    s('CM', 0.4, 40, 0.1),
    s('CM', 0.4, 28, 0.1),
    s('FB', 0, 5, 0.85),
    s('W', 0.85, 56, 0.1),
    s('ST', 1, 34),
    s('W', 0.85, 12, 0.1),
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
const ROLE_FOCUS: Record<Role, (keyof Attributes)[]> = {
  GK: ['keeping', 'positioning', 'composure'],
  CB: ['tackling', 'positioning'],
  FB: ['pace', 'tackling', 'passing', 'stamina'],
  DM: ['tackling', 'passing', 'positioning'],
  CM: ['passing', 'composure', 'dribbling', 'stamina'],
  WM: ['pace', 'passing', 'dribbling', 'stamina'],
  W: ['pace', 'dribbling', 'shooting'],
  ST: ['shooting', 'composure', 'pace'],
}

export function makeAttributes(rng: Rng, role: Role, quality: number): Attributes {
  const base = (): number => Math.round(Math.max(1, Math.min(20, quality - 3 + rng.gauss() * 2)))
  const attrs: Attributes = {
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

export function randomTeam(seed: number, block?: Block, formation?: Formation): TeamDef {
  const rng = new Rng(seed)
  const f = formation ?? rng.pick(FORMATION_NAMES)
  // Squad strength: from a relegation battler to a title contender, in the same league.
  const quality = rng.int(11, 15)
  const names = new Set<string>()
  const uniqueName = (): string => {
    let name: string
    do name = `${rng.pick(FIRST)} ${rng.pick(LAST)}`
    while (names.has(name))
    names.add(name)
    return name
  }
  const players: PlayerDef[] = FORMATIONS[f].map((slot, i) => ({
    id: `${seed}-${i}`,
    name: uniqueName(),
    shirt: i + 1,
    role: slot.role,
    attrs: makeAttributes(rng, slot.role, quality),
    traits: makeTraits(rng, slot.role),
    positions: makePositions(rng, slot.role),
    ...makeFeet(rng),
  }))
  // A bench covering every line, a notch below the first team.
  const bench: PlayerDef[] = BENCH_ROLES.map((role, i) => ({
    id: `${seed}-${11 + i}`,
    name: uniqueName(),
    shirt: 12 + i,
    role,
    attrs: makeAttributes(rng, role, quality - 1),
    traits: makeTraits(rng, role),
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
  return names.map((name, i) => ({
    ...randomTeam(seed * 1000 + i + 1),
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
export function fitFor(def: PlayerDef, role: Role): number {
  if (role === def.role) return 1
  if (role === 'GK' || def.role === 'GK') return 0
  const i = def.positions?.indexOf(role) ?? -1
  if (i >= 0) return i === 0 ? 0.95 : 0.9
  return LINES[def.role].includes(role) ? 0.75 : 0.55
}

/** The attributes that come from knowing a position: reading the game, and technique in it. */
const POSITIONAL: (keyof Attributes)[] = ['passing', 'shooting', 'tackling', 'dribbling', 'positioning', 'composure']

/**
 * His attributes when playing `role`: out of position he's as quick and fit as ever, but reads
 * the game and uses the ball less well (a striker on the wing crosses and dribbles like a lesser
 * player): the positional ones scale from 100% in his own position to 80% in a strange one.
 */
export function playingAttributes(def: PlayerDef, role: Role): Attributes {
  const fit = fitFor(def, role)
  if (fit >= 1 || fit === 0) return def.attrs
  const k = 0.55 + 0.45 * fit
  const attrs = { ...def.attrs }
  for (const a of POSITIONAL) attrs[a] = def.attrs[a] * k
  return attrs
}

/** Made-up players' feet: about one in four left-footed; most with an average weaker foot. */
function makeFeet(rng: Rng): Pick<PlayerDef, 'foot' | 'weakFoot'> {
  const foot = rng.chance(0.25) ? 'left' : 'right'
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
 * A rough overall, 1-20: a real player's own overall (out of 100) scaled down, otherwise the
 * average of the attributes that matter in his position.
 */
export function ability(def: PlayerDef): number {
  if (def.overall) return def.overall / 5
  const { keeping, ...rest } = def.attrs
  const vals = def.role === 'GK' ? [keeping, rest.positioning, rest.composure] : Object.values(rest)
  return vals.reduce((a, b) => a + b, 0) / vals.length
}
