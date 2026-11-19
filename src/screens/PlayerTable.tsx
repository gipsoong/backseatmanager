/**
 * Every player in the league with his numbers and the ones underneath them, sortable and
 * filterable: for spotting who's really doing it, and anything that looks off.
 */
import { useState } from 'react'
import type { PlayerDef } from '../engine/index.ts'
import { ratingGroup } from '../viewer/players.ts'
import { type Season, type SeasonStats, avgRating, squadOf } from '../season/season.ts'
import { count } from '../season/stats.ts'
import { Swatch } from './Hub.tsx'

type Key = 'name' | 'min' | 'goals' | 'xg' | 'gxg' | 'assists' | 'xa' | 'shots' | 'chances' | 'defence' | 'avg'

const COLUMNS: { key: Key; label: string; title: string; wide?: boolean; value: (st: SeasonStats) => number; show: (st: SeasonStats) => string }[] = [
  { key: 'min', label: 'Min', title: 'Minutes', wide: true, value: (st) => count(st, 'minutes'), show: (st) => String(count(st, 'minutes')) },
  { key: 'goals', label: 'G', title: 'Goals', value: (st) => st.goals, show: (st) => String(st.goals) },
  { key: 'xg', label: 'xG', title: 'Expected goals', value: (st) => count(st, 'xg'), show: (st) => count(st, 'xg').toFixed(1) },
  {
    key: 'gxg',
    label: 'G−xG',
    title: 'Goals less expected goals: finishing above or below the chances',
    wide: true,
    value: (st) => st.goals - count(st, 'xg'),
    show: (st) => {
      const v = st.goals - count(st, 'xg')
      return v > 0 ? `+${v.toFixed(1)}` : v.toFixed(1)
    },
  },
  { key: 'assists', label: 'A', title: 'Assists', value: (st) => st.assists, show: (st) => String(st.assists) },
  { key: 'xa', label: 'xA', title: 'Expected assists', wide: true, value: (st) => count(st, 'xa'), show: (st) => count(st, 'xa').toFixed(1) },
  { key: 'shots', label: 'Sh', title: 'Shots', wide: true, value: (st) => count(st, 'shots'), show: (st) => String(count(st, 'shots')) },
  { key: 'chances', label: 'KP', title: 'Chances created', wide: true, value: (st) => count(st, 'keyPasses'), show: (st) => String(count(st, 'keyPasses')) },
  {
    key: 'defence',
    label: 'T+I',
    title: 'Tackles won and interceptions',
    wide: true,
    value: (st) => count(st, 'tackles') + count(st, 'interceptions'),
    show: (st) => String(count(st, 'tackles') + count(st, 'interceptions')),
  },
  { key: 'avg', label: 'Avg', title: 'Average match rating', value: (st) => avgRating(st) ?? 0, show: (st) => avgRating(st)?.toFixed(2) ?? '–' },
]

const GROUPS = [
  ['all', 'All positions'],
  ['GK', 'Goalkeepers'],
  ['DEF', 'Defenders'],
  ['DM', 'Holding midfielders'],
  ['MID', 'Midfielders'],
  ['ATT', 'Forwards'],
] as const

export function PlayerTable({ season, onPlayer }: { season: Season; onPlayer: (id: string) => void }) {
  const [club, setClub] = useState<number | 'all'>('all')
  const [group, setGroup] = useState<(typeof GROUPS)[number][0]>('all')
  const [sort, setSort] = useState<{ key: Key; asc: boolean }>({ key: 'goals', asc: false })
  const [regulars, setRegulars] = useState(false)
  const played = Math.max(1, season.matchday - 1)
  const rows: { p: PlayerDef; club: number; st: SeasonStats }[] = []
  season.teams.forEach((t, c) => {
    if (club !== 'all' && club !== c) return
    for (const p of squadOf(t)) {
      const st = season.stats[p.id]
      if (!st?.apps) continue
      if (group !== 'all' && ratingGroup(p.role) !== group) continue
      if (regulars && count(st, 'minutes') < played * 45) continue
      rows.push({ p, club: c, st })
    }
  })
  const col = COLUMNS.find((c) => c.key === sort.key)
  rows.sort((a, b) => {
    const d = col ? col.value(a.st) - col.value(b.st) : a.p.name.localeCompare(b.p.name)
    return sort.asc ? d : -d
  })
  const sortBy = (key: Key): void => setSort((cur) => (cur.key === key ? { key, asc: !cur.asc } : { key, asc: key === 'name' }))

  return (
    <div className="player-table">
      <div className="filters">
        <select value={club} onChange={(e) => setClub(e.target.value === 'all' ? 'all' : Number(e.target.value))} aria-label="Club">
          <option value="all">All clubs</option>
          {season.teams.map((t, i) => (
            <option key={i} value={i}>
              {t.name}
            </option>
          ))}
        </select>
        <select value={group} onChange={(e) => setGroup(e.target.value as typeof group)} aria-label="Position">
          {GROUPS.map(([k, label]) => (
            <option key={k} value={k}>
              {label}
            </option>
          ))}
        </select>
        <label className="check">
          <input type="checkbox" checked={regulars} onChange={(e) => setRegulars(e.target.checked)} /> Regulars only
        </label>
      </div>
      {rows.length === 0 ? (
        <p className="meta pad">Nobody yet.</p>
      ) : (
        <table className="league stat-table">
          <thead>
            <tr>
              <th className="team">
                <button type="button" className={`sort${sort.key === 'name' ? ' on' : ''}`} onClick={() => sortBy('name')}>
                  Player
                </button>
              </th>
              {COLUMNS.map((c) => (
                <th key={c.key} className={c.wide ? 'wide' : undefined} title={c.title} aria-sort={sort.key === c.key ? (sort.asc ? 'ascending' : 'descending') : undefined}>
                  <button type="button" className={`sort${sort.key === c.key ? ' on' : ''}`} onClick={() => sortBy(c.key)}>
                    {c.label}
                    {sort.key === c.key && <span aria-hidden="true">{sort.asc ? ' ▲' : ' ▼'}</span>}
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.slice(0, 100).map(({ p, club: c, st }) => (
              <tr key={p.id} className={c === season.userTeam ? 'mine' : undefined}>
                <td className="team">
                  <Swatch kit={season.teams[c].kit} />{' '}
                  <button type="button" className="name-link" onClick={() => onPlayer(p.id)}>
                    {p.name}
                  </button>
                </td>
                {COLUMNS.map((col) => (
                  <td key={col.key} className={col.wide ? 'wide' : undefined}>
                    {col.show(st)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
