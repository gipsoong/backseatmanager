/** First screen: carry on with the saved season, start a new one, or just watch a match. */
import type { Season } from '../season/season.ts'
import { matchdays } from '../season/season.ts'
import { Swatch } from './Hub.tsx'
import { stagger } from './motion.ts'
import { Logo } from './Logo.tsx'

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
      <header className="hero">
        <Logo big />
        <h1>Football management, minus the homework.</h1>
        <p className="hero-sub">Pick a club or draft a side, watch the matches that matter, and shout from the back seat when it counts.</p>
      </header>
      <div className="start-actions">
        {saved && me && (
          <button type="button" className="btn big rise" style={stagger(0)} onClick={onContinue}>
            <span>
              Continue with <Swatch kit={me.kit} /> {me.name}
            </span>
            <span className="sub">
              {saved.career ? `Season ${saved.career.number} · ` : ''}
              {saved.matchday > matchdays(saved) ? 'Season over' : `Matchday ${saved.matchday} of ${matchdays(saved)}`}
            </span>
          </button>
        )}
        <button type="button" className={`btn big rise${saved ? ' ghost' : ''}`} style={stagger(1)} onClick={onNew}>
          <span>New career</span>
          <span className="sub">The Premier League 2024/25 with its real clubs, or a made-up league of twenty, season after season{saved ? ' · replaces your saved game' : ''}</span>
        </button>
        <button type="button" className="btn big ghost rise" style={stagger(2)} onClick={onDraft}>
          <span>Draft a side</span>
          <span className="sub">Europe's top five leagues, 2000 to now · classic, budget, themed or daily · 38 matches and a European cup{saved ? ' · replaces your saved season' : ''}</span>
        </button>
        <button type="button" className="btn big ghost rise" style={stagger(3)} onClick={onFriendly}>
          <span>Watch a friendly</span>
          <span className="sub">Two random sides, one match</span>
        </button>
      </div>
    </div>
  )
}
