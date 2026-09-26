/** The manager's squad: who's fit, who's injured, how they're doing; and picking the eleven. */
import { FORMATIONS, fitFor } from '../engine/index.ts'
import { type Season, isAvailable, lineupFor, playerRating, squadOf } from '../season/season.ts'

export function Squad({ season, onLineup }: { season: Season; onLineup: (ids: string[] | null) => void }) {
  const club = season.teams[season.userTeam]
  const squad = squadOf(club)
  const xi = lineupFor(season, season.userTeam)
  const slots = FORMATIONS[club.formation]
  const byId = (id: string) => squad.find((p) => p.id === id)!

  const choose = (slot: number, id: string): void => {
    const next = [...xi]
    const was = next.indexOf(id)
    // Picking someone already in the side swaps the two.
    if (was >= 0) next[was] = next[slot]
    next[slot] = id
    onLineup(next)
  }

  return (
    <div className="squad">
      <div className="squad-head">
        <p className="meta">{season.lineup ? 'You picked this side.' : 'The staff picked this side, resting tired players.'}</p>
        {season.lineup && (
          <button type="button" className="btn ghost" onClick={() => onLineup(null)}>
            Let the staff pick
          </button>
        )}
      </div>
      <ol className="xi">
        {slots.map((slot, i) => {
          const p = byId(xi[i])
          const options = squad.filter((q) => isAvailable(season, q)).sort((a, b) => fitFor(b, slot.role) * playerRating(b) - fitFor(a, slot.role) * playerRating(a))
          return (
            <li key={i}>
              <span className="pos">{slot.role}</span>
              <select aria-label={`${slot.role} ${i + 1}`} value={p.id} onChange={(e) => choose(i, e.target.value)}>
                {options.map((q) => (
                  <option key={q.id} value={q.id}>
                    {q.name} · {q.role} {playerRating(q)} · {Math.round(season.condition[q.id].fitness * 100)}%
                  </option>
                ))}
              </select>
            </li>
          )
        })}
      </ol>
      <table className="league squad-table">
        <thead>
          <tr>
            <th className="team">Player</th>
            <th>Pos</th>
            <th>Rtg</th>
            <th>Fit</th>
            <th className="wide">Apps</th>
            <th>Gls</th>
            <th className="wide">Ast</th>
            <th className="wide">Avg</th>
          </tr>
        </thead>
        <tbody>
          {squad.map((p) => {
            const c = season.condition[p.id]
            const st = season.stats[p.id]
            const out = c.injuredUntil - season.matchday
            return (
              <tr key={p.id} className={xi.includes(p.id) ? 'mine' : undefined}>
                <td className="team">
                  {p.name}
                  {out > 0 && <span className="inj-note">Out {out === 1 ? '1 week' : `${out} weeks`}</span>}
                </td>
                <td>{p.role}</td>
                <td>{playerRating(p)}</td>
                <td>
                  <span className="fit" title={`${Math.round(c.fitness * 100)}% fit`}>
                    <span style={{ width: `${c.fitness * 100}%` }} className={c.fitness < 0.7 ? 'low' : undefined} />
                  </span>
                </td>
                <td className="wide">{st.apps}</td>
                <td>{st.goals}</td>
                <td className="wide">{st.assists}</td>
                <td className="wide">{st.apps ? (st.ratings / st.apps).toFixed(1) : '–'}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
