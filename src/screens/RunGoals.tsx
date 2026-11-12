/**
 * A draft run's goals on the hub (session 37): the aim and the bonus, how they stand, and at the end
 * the stars. A finished run is kept in this browser's record of runs (per viewer, optional).
 */
import { useEffect } from 'react'
import { aimText, bonusText, goalState, starsOf } from '../draft/goals.ts'
import { draftEyebrow } from '../draft/draft.ts'
import { isOver, matchdays, table, type Season } from '../season/season.ts'
import { clubRecords } from '../season/stats.ts'

export interface RunRecord {
  key: string
  date: string
  name: string
  style: string
  place: number
  points: number
  record: [number, number, number]
  goals: [number, number]
  stars: number
}

const RUNS_KEY = 'matchday.draft.runs'
const RUNS_MAX = 50

export function pastRuns(): RunRecord[] {
  try {
    const v: unknown = JSON.parse(localStorage.getItem(RUNS_KEY) ?? '[]')
    return Array.isArray(v) ? (v as RunRecord[]).filter((r) => r && typeof r.key === 'string' && typeof r.stars === 'number') : []
  } catch {
    return []
  }
}

function keepRun(s: Season): void {
  const rows = table(s)
  const place = rows.findIndex((r) => r.team === s.userTeam) + 1
  const rec = clubRecords(s)[s.userTeam]
  const run: RunRecord = {
    key: `${s.seed}-${s.startDate}-${s.teams[s.userTeam].name}`,
    date: new Date().toISOString().slice(0, 10),
    name: s.teams[s.userTeam].name,
    style: draftEyebrow({ league: s.league, theme: s.draftStyle?.theme, budget: s.draftStyle?.budget !== undefined, daily: s.draftStyle?.daily }).replace(/^Draft · /, ''),
    place,
    points: rows[place - 1].points,
    record: [rec.won, rec.drawn, rec.lost],
    goals: [rec.goalsFor, rec.goalsAgainst],
    stars: starsOf(s),
  }
  try {
    const runs = pastRuns()
    if (runs.some((r) => r.key === run.key)) return
    localStorage.setItem(RUNS_KEY, JSON.stringify([...runs, run].slice(-RUNS_MAX)))
  } catch {
    // No storage: the run just isn't kept.
  }
}

export function Stars({ n, of = 3 }: { n: number; of?: number }) {
  return (
    <span className="stars" role="img" aria-label={`${n} of ${of} stars`}>
      {Array.from({ length: of }, (_, i) => (
        <span key={i} className={i < n ? 'star on' : 'star'} aria-hidden="true">
          ★
        </span>
      ))}
    </span>
  )
}

export function RunGoals({ season }: { season: Season }) {
  const over = isOver(season)
  useEffect(() => {
    if (over && season.mode === 'draft') keepRun(season)
  }, [over, season])
  if (season.mode !== 'draft' || matchdays(season) < 2) return null
  const g = goalState(season)
  const rival = g.goal.bonus.rival !== undefined ? season.teams[g.goal.bonus.rival].name : undefined
  const started = season.matchday > 1
  const aimOk = g.place <= g.goal.aim
  const count = (): string => {
    const { kind, target } = g.goal.bonus
    if (kind === 'fewLosses') return `${g.now} lost`
    if (kind === 'unbeaten') return `best run ${g.now} of ${target}`
    if (kind === 'beatBest') return `${g.now} of ${target} pts`
    return `${Math.min(g.now, 99)} of ${target}`
  }
  const mark = (ok: boolean, failed: boolean): string => (ok ? 'done' : failed ? 'missed' : 'open')
  return (
    <div className="run-goals">
      <div className="run-goals-head">
        <span className="eyebrow">{over ? 'Your run' : 'Run goals'}</span>
        {over && <Stars n={starsOf(season)} />}
      </div>
      <ul>
        <li className={`run-goal ${mark(over ? aimOk : false, over && !aimOk)}`}>
          <span className="run-goal-text">{aimText(g.goal)}</span>
          <span className="run-goal-now">{started ? (over ? (aimOk ? 'Done' : 'Missed') : `${ordinal(g.place)} now`) : `Tipped ${ordinal(g.goal.tip)}`}</span>
        </li>
        <li className={`run-goal ${mark(g.met, g.failed)}`}>
          <span className="run-goal-text">{bonusText(g.goal, rival)}</span>
          <span className="run-goal-now">{g.met ? 'Done' : g.failed ? 'Missed' : started ? count() : 'Bonus'}</span>
        </li>
      </ul>
      {over && <p className="meta run-goal-third">A third star for finishing three places above the aim, or winning the league with {Math.round((90 * matchdays(season)) / 38)} points.</p>}
    </div>
  )
}

function ordinal(n: number): string {
  const s = n % 100 >= 11 && n % 100 <= 13 ? 'th' : (['th', 'st', 'nd', 'rd'][n % 10] ?? 'th')
  return `${n}${s}`
}

/** The record of past runs, for the draft's start screen. */
export function PastRuns() {
  const runs = pastRuns()
  if (!runs.length) return null
  const best = [...runs].sort((a, b) => b.stars - a.stars || a.place - b.place || b.points - a.points)[0]
  const recent = runs.slice(-5).reverse()
  return (
    <section className="past-runs">
      <p className="eyebrow step">Your runs</p>
      <p className="meta">
        {runs.length} {runs.length === 1 ? 'run' : 'runs'}, {runs.reduce((n, r) => n + r.stars, 0)} stars. Best: {best.name}, {ordinal(best.place)} with {best.points} points.
      </p>
      <ul>
        {recent.map((r) => (
          <li key={r.key} className="past-run">
            <span className="past-run-name">
              {r.name}
              <small>{r.style}</small>
            </span>
            <span className="past-run-line">
              {ordinal(r.place)} · {r.points} pts · {r.record.join('-')}
            </span>
            <Stars n={r.stars} />
          </li>
        ))}
      </ul>
    </section>
  )
}
