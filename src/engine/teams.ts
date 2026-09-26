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
    s('ST', 1, 28),
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
    s('W', 0.85, 58, 0.1),
    s('ST', 1, 34),
    s('W', 0.85, 10, 0.1),
  ],
}

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

const BENCH_ROLES: Role[] = ['GK', 'CB', 'FB', 'DM', 'CM', 'W', 'ST']

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

function makeAttributes(rng: Rng, role: Role, quality: number): Attributes {
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
function makeTraits(rng: Rng, role: Role): Traits {
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
  const f = formation ?? rng.pick(['4-4-2', '4-3-3'] as const)
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
  }))
  // A bench covering every line, a notch below the first team.
  const bench: PlayerDef[] = BENCH_ROLES.map((role, i) => ({
    id: `${seed}-${11 + i}`,
    name: uniqueName(),
    shirt: 12 + i,
    role,
    attrs: makeAttributes(rng, role, quality - 1),
    traits: makeTraits(rng, role),
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

/** How well `def` fits a slot: 1 in his own position, less further from it, 0 if not at all. */
export function fitFor(def: PlayerDef, role: Role): number {
  const i = LINES[def.role].indexOf(role)
  return i < 0 ? (role === 'GK' || def.role === 'GK' ? 0 : 0.5) : 1 - i * 0.12
}

/** A rough overall, 1-20: the average of the attributes that matter in his position. */
export function ability(def: PlayerDef): number {
  const { keeping, ...rest } = def.attrs
  const vals = def.role === 'GK' ? [keeping, rest.positioning, rest.composure] : Object.values(rest)
  return vals.reduce((a, b) => a + b, 0) / vals.length
}
