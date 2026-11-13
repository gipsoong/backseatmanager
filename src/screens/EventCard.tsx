/** A mid-season event on the hub (draft seasons, draft/events.ts): two choices, before the match. */
import { choose, eventText, pendingEvent } from '../draft/events.ts'
import type { Season } from '../season/season.ts'

export function EventCard({ season, onChoose }: { season: Season; onChoose: (s: Season) => void }) {
  const e = pendingEvent(season)
  if (!e) return null
  const t = eventText(season, e)
  return (
    <div className="event-card rise">
      <p className="eyebrow">{t.title}</p>
      <p className="event-text">{t.text}</p>
      <div className="event-options">
        {t.options.map((o, i) => (
          <button key={o} type="button" className="event-option" onClick={() => onChoose(choose(season, e, i))}>
            <strong>{o}</strong>
            <small>{t.effects[i]}</small>
          </button>
        ))}
      </div>
      <p className="meta event-note">Play on without choosing and it's the first.</p>
    </div>
  )
}
