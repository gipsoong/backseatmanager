/** First screen: carry on with the saved season, start a new one, or just watch a match. */
import type { Season } from '../season/season.ts'
import { MATCHDAYS } from '../season/season.ts'
import { Swatch } from './Hub.tsx'

export function Start({ saved, onContinue, onNew, onFriendly }: { saved: Season | null; onContinue: () => void; onNew: () => void; onFriendly: () => void }) {
  const me = saved ? saved.teams[saved.userTeam] : null
  return (
    <div className="start">
      <p className="eyebrow">Matchday</p>
      <h1>Pick a club. Play a season.</h1>
      <div className="start-actions">
        {saved && me && (
          <button type="button" className="btn big" onClick={onContinue}>
            <span>
              Continue with <Swatch kit={me.kit} /> {me.name}
            </span>
            <span className="sub">{saved.matchday > MATCHDAYS ? 'Season over' : `Matchday ${saved.matchday} of ${MATCHDAYS}`}</span>
          </button>
        )}
        <button type="button" className={`btn big${saved ? ' ghost' : ''}`} onClick={onNew}>
          <span>New season</span>
          {saved && <span className="sub">Replaces your saved season</span>}
        </button>
        <button type="button" className="btn big ghost" onClick={onFriendly}>
          <span>Watch a friendly</span>
          <span className="sub">Two random sides, one match</span>
        </button>
      </div>
    </div>
  )
}
