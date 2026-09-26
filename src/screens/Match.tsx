/** Watching the manager's match, with the way back to the season. */
import type { Season } from '../season/season.ts'
import { matchdayDate } from '../season/season.ts'
import { MatchViewer } from '../viewer/MatchViewer.tsx'
import type { Timeline } from '../viewer/timeline.ts'

const dateFmt = new Intl.DateTimeFormat(undefined, { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' })

export function Match({ season, timeline, busy, onDone }: { season: Season; timeline: Timeline; busy: boolean; onDone: () => void }) {
  const [home, away] = timeline.state.teams
  return (
    <>
      <header className="top">
        <div className="fixture">
          <p className="eyebrow">
            Matchday {season.matchday} · {dateFmt.format(matchdayDate(season, season.matchday))}
          </p>
          <h1>
            {home.name} <span className="v">v</span> {away.name}
          </h1>
          <p className="meta">
            {home.formation}, {home.block} block · {away.formation}, {away.block} block
          </p>
        </div>
        <div className="actions">
          <button type="button" className="btn" onClick={onDone} disabled={busy} title="Records the full-time result, whether or not you've watched to the end">
            {busy ? 'Finishing…' : 'Continue to results'}
          </button>
        </div>
      </header>
      <MatchViewer timeline={timeline} />
    </>
  )
}
