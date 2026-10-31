/**
 * A season "played" without the engine, for tests and quick checks of the career's long run:
 * the elevens play most of the minutes, the first few on the bench some, the rest hardly any.
 */
import { type Season, matchdays } from '../season/season.ts'

export function fakePlayed(s: Season): Season {
  const full = matchdays(s) * 90
  const stats = { ...s.stats }
  for (const t of s.teams) {
    const line = (id: string, share: number): void => {
      const apps = Math.round(matchdays(s) * Math.min(1, share * 1.3))
      stats[id] = { apps, starts: apps, minutes: Math.round(full * share), goals: 0, assists: 0, ratings: apps * 6.8, rated: apps }
    }
    t.players.forEach((p) => line(p.id, 0.85))
    t.bench.forEach((p, i) => line(p.id, i < 5 ? 0.3 : 0.04))
  }
  return { ...s, stats, matchday: matchdays(s) + 1 }
}
