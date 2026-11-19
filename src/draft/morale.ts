/**
 * Morale (session 38, draft seasons): a star (overall `STAR` or more) who hasn't started any of his
 * side's last `BENCH_WEEKS` league matches while fit is unhappy, and plays `UNHAPPY` when he does
 * get on. With `RESTLESS_FROM` unhappy at once the whole squad is restless (`RESTLESS`). Only the
 * manager's drafted side. Worked out from the results and conditions, so nothing new is saved and a
 * match plays the same watched or not. A stacked side can still sweep the league, but only by
 * keeping its stars playing. Type-only imports from season.ts: season.ts calls `moraleBoosts`.
 */
import type { PlayerDef } from '../engine/index.ts'
import type { Season } from '../season/season.ts'

/** The overall that makes a star (draft.ts STAR_LINE, repeated so season.ts needn't load the draft's data). */
export const STAR = 85
export const BENCH_WEEKS = 3
export const UNHAPPY = -2
export const RESTLESS_FROM = 3
export const RESTLESS = -1

const squad = (s: Season): PlayerDef[] => [...s.teams[s.userTeam].players, ...s.teams[s.userTeam].bench]

/** The manager's league matches played so far, latest first. */
function lastMatches(s: Season): Season['fixtures'] {
  return s.fixtures
    .filter((f) => f.result && (f.home === s.userTeam || f.away === s.userTeam))
    .sort((a, b) => b.matchday - a.matchday)
}

/** The stars unhappy before this matchday's match, best first. */
export function unhappyStars(s: Season): PlayerDef[] {
  if (s.mode !== 'draft') return []
  const last = lastMatches(s).slice(0, BENCH_WEEKS)
  if (last.length < BENCH_WEEKS) return []
  const from = last[last.length - 1].matchday
  const started = new Set(last.flatMap((f) => f.result!.appearances.filter((a) => a.starts).map((a) => a.id)))
  return squad(s)
    .filter((p) => (p.overall ?? 0) >= STAR && p.role !== 'GK' && !started.has(p.id))
    // Out injured for any of those weeks (or now): not a snub.
    .filter((p) => (s.condition[p.id]?.injuredUntil ?? 0) <= from)
    // He was ours for those weeks (a January signing isn't sulking yet).
    .filter((p) => !(s.transfers ?? []).some((t) => t.matchday > from && t.ids.includes(p.id)))
    .sort((a, b) => (b.overall ?? 0) - (a.overall ?? 0))
}

/** Each player's morale change for this matchday (only those with one). */
export function moraleOf(s: Season): Map<string, number> {
  const sad = unhappyStars(s)
  const out = new Map<string, number>()
  if (!sad.length) return out
  const restless = sad.length >= RESTLESS_FROM
  for (const p of squad(s)) {
    const n = (sad.includes(p) ? UNHAPPY : 0) + (restless ? RESTLESS : 0)
    if (n) out.set(p.id, n)
  }
  return out
}

/** The squad's stars: how many egos the dressing room holds. */
export const starsIn = (s: Season): number => squad(s).filter((p) => (p.overall ?? 0) >= STAR).length
