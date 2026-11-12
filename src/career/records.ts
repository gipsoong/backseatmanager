/**
 * The manager's all-time records: his players' goals, assists and appearances under him, over every
 * finished season (the club he was at each time) and the one in progress.
 */
import { type Season, squadOf } from '../season/season.ts'

export interface AllTime {
  id: string
  name: string
  apps: number
  goals: number
  assists: number
  seasons: number
}

export function allTime(s: Season): AllTime[] {
  const c = s.career
  if (!c) return []
  const known = new Map(s.teams.flatMap(squadOf).map((p) => [p.id, p.name]))
  for (const f of c.freeAgents ?? []) known.set(f.player.id, f.player.name)
  const by = new Map<string, AllTime>()
  const add = (id: string, name: string | undefined, apps: number, goals: number, assists: number): void => {
    const n = name ?? known.get(id)
    if (!n || !apps) return
    const r = by.get(id) ?? { id, name: n, apps: 0, goals: 0, assists: 0, seasons: 0 }
    r.apps += apps
    r.goals += goals
    r.assists += assists
    r.seasons++
    by.set(id, r)
  }
  for (const h of c.history) {
    const club = h.club ?? s.userTeam
    for (const [id, l] of Object.entries(h.lines)) if (l.club === club) add(id, l.name, l.apps, l.goals, l.assists)
  }
  for (const p of squadOf(s.teams[s.userTeam])) {
    const st = s.stats[p.id]
    if (st) add(p.id, p.name, st.apps, st.goals, st.assists)
  }
  return [...by.values()]
}

/** The top n by a count, ties by fewer appearances (for goals), then name. */
export function leaders(rows: AllTime[], key: 'goals' | 'apps' | 'assists', n = 5): AllTime[] {
  return rows
    .filter((r) => r[key] > 0)
    .sort((a, b) => b[key] - a[key] || (key === 'apps' ? b.goals - a.goals : a.apps - b.apps) || a.name.localeCompare(b.name))
    .slice(0, n)
}
