/** A mid-season event on the hub (draft seasons, draft/events.ts): two choices, before the match. */
import { choose, eventText, pendingEvent } from '../draft/events.ts'
import type { Season } from '../season/season.ts'
import { BENCH_WEEKS, RESTLESS, RESTLESS_FROM, UNHAPPY, unhappyStars } from '../draft/morale.ts'
import { shortName as surname } from '../names.ts'

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

/** Unhappy stars on the hub (draft seasons, draft/morale.ts): who, and what it costs. */
export function MoraleNote({ season }: { season: Season }) {
  const sad = unhappyStars(season)
  if (!sad.length) return null
  const names = sad.map((p) => surname(p.name))
  const list = names.length === 1 ? names[0] : `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`
  const restless = sad.length >= RESTLESS_FROM
  return (
    <div className="morale-note rise">
      <p className="eyebrow">Dressing room</p>
      <p className="meta">
        {list} {sad.length === 1 ? "hasn't" : "haven't"} started in {BENCH_WEEKS} matches and {sad.length === 1 ? 'is' : 'are'} unhappy: {UNHAPPY} when{' '}
        {sad.length === 1 ? 'he plays' : 'they play'}, until {sad.length === 1 ? 'he starts' : 'each starts'} again.
        {restless ? ` With ${sad.length} stars sulking the whole squad is restless (${RESTLESS}).` : ` If ${RESTLESS_FROM} stars sulk at once, the whole squad plays ${RESTLESS}.`}
      </p>
    </div>
  )
}
