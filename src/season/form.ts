/**
 * Form (session 37, draft seasons): each player's form swings through the season, a few points
 * either side of his usual level, drifting from week to week (a random walk pulled back to zero:
 * runs of good and bad weeks, not noise). It is worked out from the season's seed, his id and the
 * matchday, so nothing is saved, and a match plays the same whether watched or simulated. In a
 * match it adds to his technique and reading of the game (`POSITIONAL`, or a keeper's skills), about
 * a point of overall a point of form.
 */
import { Rng, type PlayerDef, type TeamDef } from '../engine/index.ts'
import { POSITIONAL } from '../engine/attributes.ts'

/** How much of last week's form carries over, the week-to-week swing, and the cap either way. */
const FORM_CARRY = 0.75
const FORM_STEP = 1.1
export const FORM_MAX = 4
const KEEPING = ['diving', 'handling', 'reflexes', 'gkPositioning'] as const

function hash(seed: number, id: string): number {
  let h = (2166136261 ^ seed) >>> 0
  for (let i = 0; i < id.length; i++) h = Math.imul(h ^ id.charCodeAt(i), 16777619) >>> 0
  return h
}

/** His form on a matchday (whole points, -FORM_MAX to FORM_MAX). */
export function formOf(seed: number, id: string, matchday: number): number {
  const rng = new Rng(hash(seed, id))
  let f = rng.gauss() * FORM_STEP * 1.4
  for (let w = 1; w < matchday; w++) f = FORM_CARRY * f + rng.gauss() * FORM_STEP
  return Math.max(-FORM_MAX, Math.min(FORM_MAX, Math.round(f)))
}

/** Him as he plays in this form. */
export function inForm(p: PlayerDef, form: number): PlayerDef {
  if (!form) return p
  const attrs = { ...p.attrs }
  for (const a of p.role === 'GK' ? KEEPING : POSITIONAL) attrs[a] = Math.max(1, Math.min(99, attrs[a] + form))
  return { ...p, attrs }
}

/** A side as it plays on a matchday, everyone in his form. */
export function teamInForm(t: TeamDef, seed: number, matchday: number): TeamDef {
  const f = (p: PlayerDef): PlayerDef => inForm(p, formOf(seed, p.id, matchday))
  return { ...t, players: t.players.map(f), bench: t.bench.map(f) }
}

/** Form in a few characters: "▲2", "▼1", or "" when he's at his usual level. */
export const formMark = (f: number): string => (f > 0 ? `▲${f}` : f < 0 ? `▼${-f}` : '')
