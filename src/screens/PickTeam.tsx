/** Choose which club to manage from a new league. */
import type { TeamDef } from '../engine/index.ts'
import { squadRating } from '../season/season.ts'
import { Swatch } from './Hub.tsx'

export function PickTeam({ teams, onPick, onBack }: { teams: TeamDef[]; onPick: (i: number) => void; onBack: () => void }) {
  const order = teams.map((t, i) => ({ t, i, rating: squadRating(t) })).sort((a, b) => b.rating - a.rating)
  return (
    <div className="pick">
      <header className="top">
        <div className="fixture">
          <p className="eyebrow">New season</p>
          <h1>Choose your club</h1>
          <p className="meta">Stronger squads are expected to win; weaker ones are more of a challenge.</p>
        </div>
        <div className="actions">
          <button type="button" className="btn ghost" onClick={onBack}>
            Back
          </button>
          <button type="button" className="btn" onClick={() => onPick(Math.floor(Math.random() * teams.length))}>
            Pick for me
          </button>
        </div>
      </header>
      <ul className="clubs">
        {order.map(({ t, i, rating }) => (
          <li key={t.name}>
            <button type="button" className="club" onClick={() => onPick(i)}>
              <Swatch kit={t.kit} />
              <span className="club-name">{t.name}</span>
              <span className="club-meta">
                {t.formation} · {t.block} block
              </span>
              <span className="rating" title="Squad rating">
                {rating}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
