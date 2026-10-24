/** First screen: carry on with the saved season, start a new one, or just watch a match. */
import type { Season } from '../season/season.ts'
import { matchdays } from '../season/season.ts'
import { Swatch } from './Hub.tsx'
import { stagger } from './motion.ts'

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
      <p className="eyebrow brand">
        <span className="brand-mark" aria-hidden="true" />
        Matchday
      </p>
      <h1>Pick a club, or draft a side. Play a season.</h1>
      <div className="start-actions">
        {saved && me && (
          <button type="button" className="btn big rise" style={stagger(0)} onClick={onContinue}>
            <span>
              Continue with <Swatch kit={me.kit} /> {me.name}
            </span>
            <span className="sub">{saved.matchday > matchdays(saved) ? 'Season over' : `Matchday ${saved.matchday} of ${matchdays(saved)}`}</span>
          </button>
        )}
        <button type="button" className={`btn big rise${saved ? ' ghost' : ''}`} style={stagger(1)} onClick={onNew}>
          <span>New season</span>
          <span className="sub">Manage a club in a league of ten{saved ? ' · replaces your saved season' : ''}</span>
        </button>
        <button type="button" className="btn big ghost rise" style={stagger(2)} onClick={onDraft}>
          <span>Draft a side</span>
          <span className="sub">Europe's top five leagues, 2010 to now · 38 matches and a European cup{saved ? ' · replaces your saved season' : ''}</span>
        </button>
        <button type="button" className="btn big ghost rise" style={stagger(3)} onClick={onFriendly}>
          <span>Watch a friendly</span>
          <span className="sub">Two random sides, one match</span>
        </button>
      </div>
    </div>
  )
}
