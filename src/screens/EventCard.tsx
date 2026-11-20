/** A mid-season event on the hub (draft seasons, draft/events.ts): two choices, before the match. */
import { choose, eventText, pendingEvent } from '../draft/events.ts'
import { isAvailable, type Season } from '../season/season.ts'
import { BENCH_WEEKS, RESTLESS, RESTLESS_FROM, UNHAPPY, restlessness, unhappyStars, wantStart } from '../draft/morale.ts'
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

/** Unhappy stars on the hub (draft seasons, draft/morale.ts): who, what it costs, and what to do. */
export function MoraleNote({ season }: { season: Season }) {
  const sad = unhappyStars(season)
  const soon = wantStart(season).filter((p) => isAvailable(season, p))
  if (!sad.length && !soon.length) return null
  const listOf = (ps: { name: string }[]): string => {
    const names = ps.map((p) => surname(p.name))
    return names.length === 1 ? names[0] : `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`
  }
  const list = listOf(sad)
  const warn = soon.length ? ` ${listOf(soon)} ${soon.length === 1 ? 'wants' : 'want'} a start this week, or ${soon.length === 1 ? "he'll" : "they'll"} be unhappy too.` : ''
  if (!sad.length)
    return (
      <div className="morale-note rise">
        <p className="eyebrow">Dressing room</p>
        <p className="meta">
          {warn.trim()} A star left out of {BENCH_WEEKS} matches running plays {UNHAPPY} until he starts again, and {RESTLESS_FROM} unhappy at once unsettle the whole squad.
        </p>
      </div>
    )
  const restless = restlessness(sad.length)
  const one = sad.length === 1
  return (
    <div className="morale-note rise">
      <p className="eyebrow">Dressing room</p>
      <p className="meta">
        {list} {one ? "hasn't" : "haven't"} started in {BENCH_WEEKS} matches and {one ? 'is' : 'are'} unhappy: {UNHAPPY} when {one ? 'he plays' : 'they play'}.
        {restless
          ? ` With ${sad.length} stars sulking the whole squad plays ${restless}.`
          : ` If ${RESTLESS_FROM} stars sulk at once, the whole squad plays ${RESTLESS}.`}{' '}
        Starting {one ? 'him' : 'them'} puts it right; the staff pick on form and fitness, not feelings.{warn}
      </p>
    </div>
  )
}
