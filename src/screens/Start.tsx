/** First screen: carry on with the saved season, start a new one, or just watch a match. */
import type { Season } from '../season/season.ts'
import { matchdays } from '../season/season.ts'
import { Swatch } from './Hub.tsx'

export function Start({
  saved,
  onContinue,
  onNew,
  onDraft,
  onFriendly,
}: {
  saved: Season | null
  onContinue: () => void
  onNew: () => void
  onDraft: () => void
  onFriendly: () => void
}) {
  const me = saved ? saved.teams[saved.userTeam] : null
  return (
    <div className="start">
      <p className="eyebrow">Matchday</p>
      <h1>Pick a club, or draft a side. Play a season.</h1>
      <div className="start-actions">
        {saved && me && (
          <button type="button" className="btn big" onClick={onContinue}>
            <span>
              Continue with <Swatch kit={me.kit} /> {me.name}
            </span>
            <span className="sub">{saved.matchday > matchdays(saved) ? 'Season over' : `Matchday ${saved.matchday} of ${matchdays(saved)}`}</span>
          </button>
        )}
        <button type="button" className={`btn big${saved ? ' ghost' : ''}`} onClick={onNew}>
          <span>New season</span>
          <span className="sub">Manage a club in a league of ten{saved ? ' · replaces your saved season' : ''}</span>
        </button>
        <button type="button" className="btn big ghost" onClick={onDraft}>
          <span>Draft a side</span>
          <span className="sub">Premier League players, 2010 to now · 38 matches{saved ? ' · replaces your saved season' : ''}</span>
        </button>
        <button type="button" className="btn big ghost" onClick={onFriendly}>
          <span>Watch a friendly</span>
          <span className="sub">Two random sides, one match</span>
        </button>
      </div>
    </div>
  )
}
