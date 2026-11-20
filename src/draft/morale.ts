/**
 * Morale (session 38, draft seasons): a star (overall `STAR` or more) who has started fewer than
 * `STARTS_WANTED` of his side's last `BENCH_WEEKS` league matches while fit is unhappy, and plays
 * `UNHAPPY` when he does get on. With `RESTLESS_FROM` unhappy at once the whole squad is restless
 * (`RESTLESS`), and with `RESTLESS_MORE` more so (`RESTLESS_WORSE`). Only the
 * manager's drafted side. Worked out from the results and conditions, so nothing new is saved and a
 * match plays the same watched or not. A stacked side can still sweep the league, but only by
 * keeping its stars playing. Type-only imports from season.ts: season.ts calls `moraleOf`.
 */
import type { PlayerDef } from '../engine/index.ts'
import type { Season } from '../season/season.ts'

/** The overall that makes a star (draft.ts STAR_LINE, repeated so season.ts needn't load the draft's data). */
export const STAR = 85
// Lenient in draft mode (the owner, after playtest: a fuss over starts suits a career more than a
// draft): only a star left out of six matches running sulks, a point, and only three at once
// unsettle the squad. (Session 38's first tuning, 3 starts in 5, -2, 2+ = squad -1, felt nagging.)
export const BENCH_WEEKS = 6
export const STARTS_WANTED = 1
export const UNHAPPY = -1
export const RESTLESS_FROM = 3
export const RESTLESS = -1
export const RESTLESS_MORE = 99
export const RESTLESS_WORSE = -1

const squad = (s: Season): PlayerDef[] => [...s.teams[s.userTeam].players, ...s.teams[s.userTeam].bench]

/** The manager's league matches played so far, latest first. */
function lastMatches(s: Season): Season['fixtures'] {
  return s.fixtures
    .filter((f) => f.result && (f.home === s.userTeam || f.away === s.userTeam))
    .sort((a, b) => b.matchday - a.matchday)
}

/** The stars unhappy before this matchday's match, best first. */
export function unhappyStars(s: Season): PlayerDef[] {
  return starsShort(s, BENCH_WEEKS)
}

/**
 * The stars who'll be unhappy next week unless they start this one (fewer than `STARTS_WANTED` in
 * the last `BENCH_WEEKS - 1`), and aren't already.
 */
export function wantStart(s: Season): PlayerDef[] {
  const now = new Set(unhappyStars(s).map((p) => p.id))
  return starsShort(s, BENCH_WEEKS - 1).filter((p) => !now.has(p.id))
}

/** Fit stars with fewer than `STARTS_WANTED` starts in the side's last `weeks` matches. */
function starsShort(s: Season, weeks: number): PlayerDef[] {
  if (s.mode !== 'draft') return []
  const last = lastMatches(s).slice(0, weeks)
  if (last.length < weeks) return []
  const from = last[last.length - 1].matchday
  const starts = new Map<string, number>()
  for (const f of last) for (const a of f.result!.appearances) if (a.starts) starts.set(a.id, (starts.get(a.id) ?? 0) + 1)
  return squad(s)
    .filter((p) => (p.overall ?? 0) >= STAR && p.role !== 'GK' && (starts.get(p.id) ?? 0) < STARTS_WANTED)
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
  const restless = restlessness(sad.length)
  for (const p of squad(s)) {
    const n = (sad.includes(p) ? UNHAPPY : 0) + restless
    if (n) out.set(p.id, n)
  }
  return out
}

/** What the whole squad plays with this many unhappy stars. */
export const restlessness = (unhappy: number): number => (unhappy >= RESTLESS_MORE ? RESTLESS_WORSE : unhappy >= RESTLESS_FROM ? RESTLESS : 0)

/** The squad's stars: how many egos the dressing room holds. */
export const starsIn = (s: Season): number => squad(s).filter((p) => (p.overall ?? 0) >= STAR).length
