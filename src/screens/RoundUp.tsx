/**
 * The matchday's full-time round-up (session 37): his result, then the other scores coming in one
 * by one, and where it leaves him. Shown once after a league matchday, over the hub.
 */
import { useEffect, useRef } from 'react'
import { type Season, fixturesOn, table, tableMoves } from '../season/season.ts'
import { ordinal } from './format.ts'
import { Swatch } from './Hub.tsx'

export function RoundUp({ season, matchday, onClose, onRewatch }: { season: Season; matchday: number; onClose: () => void; onRewatch?: (fixtureId: number) => void }) {
  const close = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    close.current?.focus()
    const esc = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', esc)
    return () => window.removeEventListener('keydown', esc)
  }, [onClose])
  const fixtures = fixturesOn(season, matchday).filter((f) => f.result)
  const mine = fixtures.find((f) => f.home === season.userTeam || f.away === season.userTeam)
  const others = fixtures.filter((f) => f !== mine)
  const rows = table(season)
  const place = rows.findIndex((r) => r.team === season.userTeam) + 1
  const form = rows[place - 1]?.form ?? []
  const move = tableMoves(season)[season.userTeam]
  const name = (i: number): string => season.teams[i].name
  const score = mine?.result ? (mine.home === season.userTeam ? mine.result.score : [mine.result.score[1], mine.result.score[0]]) : null
  const outcome = score ? (score[0] > score[1] ? 'W' : score[0] === score[1] ? 'D' : 'L') : null
  return (
    <div className="roundup-backdrop" onClick={onClose}>
      <section className="roundup" role="dialog" aria-modal="true" aria-label={`Matchday ${matchday} results`} onClick={(e) => e.stopPropagation()}>
        <p className="eyebrow">Matchday {matchday} · Full time</p>
        {mine?.result && (
          <div className={`roundup-mine ${outcome}`}>
            <span className="team">
              <Swatch kit={season.teams[mine.home].kit} /> {season.teams[mine.home].name}
            </span>
            <span className="roundup-score">
              {mine.result.score[0]}–{mine.result.score[1]}
            </span>
            <span className="team">
              <Swatch kit={season.teams[mine.away].kit} /> {season.teams[mine.away].name}
            </span>
          </div>
        )}
        <p className="roundup-place">
          {ordinal(place)} in the table
          {move !== 0 && <span className={`last-move ${move > 0 ? 'up' : 'down'}`}> {move > 0 ? '▲' : '▼'} {Math.abs(move)}</span>}
          {form.length > 1 && (
            <span className="roundup-form" aria-label={`Form: ${form.join(' ')}`}>
              {form.map((f, i) => (
                <span key={i} className={`res-chip ${f}`} style={{ animationDelay: `${200 + i * 70}ms` }}>
                  {f}
                </span>
              ))}
            </span>
          )}
        </p>
        <ul className="roundup-list">
          {others.map((f, i) => (
            <li key={f.id} style={{ animationDelay: `${300 + i * 90}ms` }}>
              <span className="home">{name(f.home)}</span>
              <span className="score">
                {f.result!.score[0]}–{f.result!.score[1]}
              </span>
              <span className="away">{name(f.away)}</span>
            </li>
          ))}
        </ul>
        <div className="roundup-actions">
          <button type="button" className="btn" ref={close} onClick={onClose}>
            Continue
          </button>
          {mine?.result && onRewatch && season.rewatch?.[`f${mine.id}`] && mine.result.goals.length > 0 && (
            <button type="button" className="btn ghost" onClick={() => onRewatch(mine.id)}>
              ▶ Watch the goals
            </button>
          )}
        </div>
      </section>
    </div>
  )
}
