/**
 * The manager's squad: the eleven on a pitch in the chosen shape (tap one player, then another or
 * a substitute, to swap them), then who's fit, who's injured and how they're doing.
 */
import { useState } from 'react'
import { FORMATIONS, FORMATION_NAMES, fitFor, type Formation } from '../engine/index.ts'
import { positionsLabel, shortName } from '../names.ts'
import { type Season, type SeasonStats, isAvailable, lineupFor, playerRating, squadOf } from '../season/season.ts'
import { FORMATION_BLURB } from './Draft.tsx'
import { slotLabel, slotStyle } from './pitchLayout.ts'

/** Appearances as starts, with those off the bench in brackets: "12 (3)". */
function appearances(st: SeasonStats): string {
  if (st.starts === undefined) return String(st.apps)
  const subs = st.apps - st.starts
  return subs ? `${st.starts} (${subs})` : String(st.starts)
}

export function Squad({
  season,
  onLineup,
  onFormation,
}: {
  season: Season
  onLineup: (ids: string[] | null) => void
  onFormation: (f: Formation) => void
}) {
  const club = season.teams[season.userTeam]
  const squad = squadOf(club)
  const xi = lineupFor(season, season.userTeam)
  const slots = FORMATIONS[club.formation]
  const byId = (id: string) => squad.find((p) => p.id === id)!
  // The player picked up to move: a starter (by slot) or someone not in the side (by id).
  const [held, setHeld] = useState<{ slot: number } | { id: string } | null>(null)
  const others = squad.filter((p) => !xi.includes(p.id)).sort((a, b) => playerRating(b) - playerRating(a))
  const fitness = (id: string): number => season.condition[id].fitness

  const tapSlot = (i: number): void => {
    if (!held) return setHeld({ slot: i })
    const next = [...xi]
    if ('slot' in held) [next[held.slot], next[i]] = [next[i], next[held.slot]]
    else next[i] = held.id
    setHeld(null)
    if (held && 'slot' in held && held.slot === i) return
    onLineup(next)
  }
  const tapOther = (id: string): void => {
    if (held && 'slot' in held) {
      const next = [...xi]
      next[held.slot] = id
      setHeld(null)
      onLineup(next)
    } else setHeld(held && 'id' in held && held.id === id ? null : { id })
  }
  const heldSlot = held && 'slot' in held ? held.slot : -1
  const heldId = held && 'id' in held ? held.id : null
  const moving = held ? ('slot' in held ? byId(xi[held.slot]) : byId(held.id)) : null

  return (
    <div className="squad">
      <div className="squad-head">
        <label className="shape">
          <span className="eyebrow">Shape</span>
          <select value={club.formation} onChange={(e) => onFormation(e.target.value as Formation)}>
            {FORMATION_NAMES.map((f) => (
              <option key={f} value={f}>
                {f} · {FORMATION_BLURB[f]}
              </option>
            ))}
          </select>
        </label>
        <p className="meta">{season.lineup ? 'You picked this side.' : 'The staff picked this side, resting tired players.'}</p>
        {season.lineup && (
          <button type="button" className="btn ghost" onClick={() => onLineup(null)}>
            Let the staff pick
          </button>
        )}
      </div>
      <div className="squad-pick">
        <div className="mini-pitch">
          {slots.map((slot, i) => {
            const p = byId(xi[i])
            const fit = fitFor(p, slot.role)
            return (
              <button
                key={i}
                type="button"
                className={`slot filled${heldSlot === i ? ' held' : ''}${!isAvailable(season, p) ? ' hurt' : ''}`}
                style={slotStyle(slot)}
                onClick={() => tapSlot(i)}
                title={`${p.name} · ${p.role} ${playerRating(p)} · ${Math.round(fitness(p.id) * 100)}% fit${fit < 1 ? ` · out of position` : ''}`}
              >
                <span className="pos">
                  {playerRating(p)} <small>{slotLabel(slot)}</small>
                </span>
                <span className="who">{shortName(p.name)}</span>
                <span className="fit">
                  <span style={{ width: `${fitness(p.id) * 100}%` }} className={fitness(p.id) < 0.7 ? 'low' : undefined} />
                </span>
              </button>
            )
          })}
        </div>
        <div className="subs">
          <p className="meta">{moving ? `Moving ${moving.name}: tap who he swaps with.` : 'Tap a player, then another or a substitute, to swap them.'}</p>
          <ul>
            {others.map((p) => {
              const out = season.condition[p.id].injuredUntil - season.matchday
              return (
                <li key={p.id}>
                  <button type="button" className={`offer${heldId === p.id ? ' chosen' : ''}`} disabled={out > 0} onClick={() => tapOther(p.id)}>
                    <span className="role">{positionsLabel(p)}</span>
                    <span className="name">
                      {p.name}
                      {out > 0 && <span className="inj-note">Out {out === 1 ? '1 week' : `${out} weeks`}</span>}
                    </span>
                    <span className="rating">{playerRating(p)}</span>
                    <span className="fit">
                      <span style={{ width: `${fitness(p.id) * 100}%` }} className={fitness(p.id) < 0.7 ? 'low' : undefined} />
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
      </div>
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
                <td>{positionsLabel(p)}</td>
                <td>{playerRating(p)}</td>
                <td>
                  <span className="fit" title={`${Math.round(c.fitness * 100)}% fit`}>
                    <span style={{ width: `${c.fitness * 100}%` }} className={c.fitness < 0.7 ? 'low' : undefined} />
                  </span>
                </td>
                <td className="wide" title="Starts (appearances as a substitute)">
                  {appearances(st)}
                </td>
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
