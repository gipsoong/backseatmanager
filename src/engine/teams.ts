import { Rng } from './rng.ts'
import type { Attributes, Block, Formation, PlayerDef, Role, Slot, TeamDef } from './types.ts'

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

const FIRST = ['Alex', 'Ben', 'Carlos', 'Dani', 'Emre', 'Felix', 'Gabi', 'Hugo', 'Ivan', 'Jonas', 'Kofi', 'Luca', 'Marco', 'Nico', 'Omar', 'Pau', 'Rui', 'Sami', 'Theo', 'Yann']
const LAST = ['Adler', 'Baptiste', 'Costa', 'Doyle', 'Eriksen', 'Ferreira', 'Grant', 'Haas', 'Iversen', 'Jansen', 'Keane', 'Lindqvist', 'Moreau', 'Novak', 'Okafor', 'Pereira', 'Quinn', 'Rossi', 'Silva', 'Varga', 'Walsh', 'Young']
const CLUBS = ['Ashford', 'Brookvale', 'Castleton', 'Dunmore', 'Eastwick', 'Fairhaven', 'Glenmoor', 'Harrow Vale', 'Ironbridge', 'Kingsport']

/** Role-specific attribute emphasis: which attributes are strengths. */
const ROLE_FOCUS: Record<Role, (keyof Attributes)[]> = {
  GK: ['keeping', 'positioning', 'composure'],
  CB: ['tackling', 'positioning'],
  FB: ['pace', 'tackling', 'passing'],
  DM: ['tackling', 'passing', 'positioning'],
  CM: ['passing', 'composure', 'dribbling'],
  WM: ['pace', 'passing', 'dribbling'],
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
  }
  for (const k of ROLE_FOCUS[role]) attrs[k] = Math.min(20, attrs[k] + rng.int(2, 5))
  return attrs
}

export function randomTeam(seed: number, block?: Block, formation?: Formation): TeamDef {
  const rng = new Rng(seed)
  const f = formation ?? rng.pick(['4-4-2', '4-3-3'] as const)
  const quality = rng.int(10, 15)
  const players: PlayerDef[] = FORMATIONS[f].map((slot, i) => ({
    id: `${seed}-${i}`,
    name: `${rng.pick(FIRST)} ${rng.pick(LAST)}`,
    shirt: i + 1,
    role: slot.role,
    attrs: makeAttributes(rng, slot.role, quality),
    traits: { flair: rng.next(), temper: rng.next() },
  }))
  const name = rng.pick(CLUBS)
  return {
    name,
    shortName: name.slice(0, 3).toUpperCase(),
    formation: f,
    block: block ?? rng.pick(['low', 'mid', 'high'] as const),
    players,
  }
}
