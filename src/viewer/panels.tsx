/**
 * The side panel's tabs: commentary, team stats, and the players (line-ups, ratings, a card per
 * player). All read what the engine produced up to the playhead; none feed back into it.
 */
import { useState } from 'react'
import type { Attributes, Kit, MatchState, TeamStats } from '../engine/index.ts'
import type { Line } from './commentary.ts'
import type { ReplayMoment } from './highlights.ts'
import { type PlayerLine, describeTraits } from './players.ts'

export function Commentary({
  lines,
  kits,
  onPick,
  replayable,
  onReplay,
}: {
  lines: Line[]
  kits: { shirt: string }[]
  onPick: (l: Line) => void
  replayable: Map<number, ReplayMoment>
  onReplay: (l: Line) => void
}) {
  if (lines.length === 0) return <p className="empty">Press play for kick-off.</p>
  return (
    <ol className="commentary">
      {[...lines].reverse().map((l) => (
        <li key={`${l.tick}-${l.text}`} className={`line ${l.kind}`}>
          <button type="button" className="line-main" onClick={() => onPick(l)} title="Watch from here">
            <span className="min">{l.clock}</span>
            <span className="dot" style={{ background: l.team === null ? 'transparent' : kits[l.team].shirt }} />
            <span className="text">{l.text}</span>
          </button>
          {replayable.has(l.tick) && (l.kind === 'goal' || l.kind === 'chance' || l.kind === 'card') && (
            <button type="button" className="line-replay" onClick={() => onReplay(l)}>
              Replay
            </button>
          )}
        </li>
      ))}
    </ol>
  )
}

export function Stats({
  stats,
  lines,
  match,
  teams,
}: {
  stats: [TeamStats, TeamStats]
  lines: PlayerLine[] | null
  match: MatchState
  teams: [string, string]
}) {
  const [h, a] = stats
  // Summed from the players' lines: what the team totals don't track.
  const sum = (team: 0 | 1, k: 'tackles' | 'interceptions' | 'saves'): number =>
    (lines ?? []).reduce((n, l, i) => n + (match.players[i].team === team ? l[k] : 0), 0)
  const poss = Math.round((100 * h.possessionTicks) / (h.possessionTicks + a.possessionTicks || 1))
  const pct = (s: TeamStats): string => (s.passes ? `${Math.round((100 * s.passesCompleted) / s.passes)}%` : '–')
  const rows: [string, string | number, string | number, number, number][] = [
    ['Possession', `${poss}%`, `${100 - poss}%`, poss, 100 - poss],
    ['Shots', h.shots, a.shots, h.shots, a.shots],
    ['On target', h.shotsOnTarget, a.shotsOnTarget, h.shotsOnTarget, a.shotsOnTarget],
    ['Expected goals', h.xg.toFixed(2), a.xg.toFixed(2), h.xg, a.xg],
    ['Passes', h.passes, a.passes, h.passes, a.passes],
    ['Pass accuracy', pct(h), pct(a), h.passesCompleted / (h.passes || 1), a.passesCompleted / (a.passes || 1)],
    ['Tackles won', sum(0, 'tackles'), sum(1, 'tackles'), sum(0, 'tackles'), sum(1, 'tackles')],
    ['Interceptions', sum(0, 'interceptions'), sum(1, 'interceptions'), sum(0, 'interceptions'), sum(1, 'interceptions')],
    ['Saves', sum(0, 'saves'), sum(1, 'saves'), sum(0, 'saves'), sum(1, 'saves')],
    ['Corners', h.corners, a.corners, h.corners, a.corners],
    ['Fouls', h.fouls, a.fouls, h.fouls, a.fouls],
    ['Offsides', h.offsides, a.offsides, h.offsides, a.offsides],
    ['Yellow cards', h.yellowCards, a.yellowCards, h.yellowCards, a.yellowCards],
    ['Red cards', h.redCards, a.redCards, h.redCards, a.redCards],
  ]
  return (
    <div className="stats">
      <div className="stats-head">
        <span>{teams[0]}</span>
        <span>{teams[1]}</span>
      </div>
      {rows.map(([label, x, y, nx, ny]) => {
        const share = nx + ny > 0 ? nx / (nx + ny) : 0.5
        return (
          <div className="stat" key={label}>
            <span className="val">{x}</span>
            <span className="name">{label}</span>
            <span className="val">{y}</span>
            <span className="bar" aria-hidden="true">
              <span style={{ width: `${share * 100}%` }} />
            </span>
          </div>
        )
      })}
    </div>
  )
}

const ATTRIBUTES: [keyof Attributes, string][] = [
  ['pace', 'Pace'],
  ['passing', 'Passing'],
  ['shooting', 'Shooting'],
  ['dribbling', 'Dribbling'],
  ['tackling', 'Tackling'],
  ['positioning', 'Positioning'],
  ['composure', 'Composure'],
  ['keeping', 'Goalkeeping'],
]

/** The notable numbers from a player's match, as a short line. */
function summary(l: PlayerLine, keeper: boolean): string {
  const bits: string[] = []
  if (l.goals) bits.push(l.goals === 1 ? '1 goal' : `${l.goals} goals`)
  if (l.assists) bits.push(l.assists === 1 ? '1 assist' : `${l.assists} assists`)
  if (keeper && l.saves) bits.push(l.saves === 1 ? '1 save' : `${l.saves} saves`)
  if (l.shots && !l.goals) bits.push(`${l.shots} ${l.shots === 1 ? 'shot' : 'shots'}`)
  if (l.tackles) bits.push(`${l.tackles} ${l.tackles === 1 ? 'tackle' : 'tackles'}`)
  if (l.passes) bits.push(`${l.passesCompleted}/${l.passes} passes`)
  return bits.join(' · ')
}

export function Players({
  match,
  lines,
  kits,
  keeperKits,
}: {
  match: MatchState
  lines: PlayerLine[] | null
  kits: [Kit, Kit]
  keeperKits: [Kit, Kit]
}) {
  const [picked, setPicked] = useState<number | null>(null)
  if (!lines) return null
  const kitOf = (i: number): Kit => (match.players[i].slot.role === 'GK' ? keeperKits : kits)[match.players[i].team]
  if (picked !== null) {
    const p = match.players[picked]
    const l = lines[picked]
    const keeper = p.slot.role === 'GK'
    const traits = describeTraits(p.def.traits)
    return (
      <div className="player-card">
        <button type="button" className="back" onClick={() => setPicked(null)}>
          ← Line-ups
        </button>
        <div className="card-head">
          <span className="shirt" style={{ background: kitOf(picked).shirt, color: kitOf(picked).number }}>
            {p.def.shirt}
          </span>
          <div>
            <h3>{p.def.name}</h3>
            <p className="muted">
              {p.slot.role} · {match.teams[p.team].name}
            </p>
          </div>
          <span className="rating big">{l.rating.toFixed(1)}</span>
        </div>
        {traits.length > 0 && (
          <ul className="traits">
            {traits.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        )}
        <dl className="attrs">
          {ATTRIBUTES.filter(([k]) => keeper || k !== 'keeping').map(([k, label]) => (
            <div key={k}>
              <dt>{label}</dt>
              <dd>
                <span className="attr-bar" aria-hidden="true">
                  <span style={{ width: `${(p.def.attrs[k] / 20) * 100}%` }} />
                </span>
                <span className="attr-val">{p.def.attrs[k]}</span>
              </dd>
            </div>
          ))}
        </dl>
        <p className="card-line">{summary(l, keeper) || 'Nothing to report yet.'}</p>
      </div>
    )
  }
  return (
    <div className="lineups">
      {([0, 1] as const).map((team) => {
        const bench = new Set(match.teams[team].bench)
        const row = (i: number) => {
          const p = match.players[i]
          const l = lines[i]
          const status = l.off ? `off ${l.off}` : l.on ? `on ${l.on}` : ''
          const line = [status, summary(l, p.slot.role === 'GK')].filter(Boolean).join(' · ')
          return (
            <li key={i}>
              <button type="button" className={`player-row${l.off ? ' off' : ''}${l.played ? '' : ' unused'}`} onClick={() => setPicked(i)}>
                <span className="shirt" style={{ background: kitOf(i).shirt, color: kitOf(i).number }}>
                  {p.def.shirt}
                </span>
                <span className="who">
                  <span className="name">
                    {p.def.name}
                    {Array.from({ length: Math.min(l.goals, 3) }, (_, g) => (
                      <span key={g} className="goal-dot" title="Goal" />
                    ))}
                    {l.red ? <span className="booking red" /> : l.yellow ? <span className="booking yellow" /> : null}
                    {l.injured && <span className="injury" title="Injured" />}
                  </span>
                  <span className="line">{l.played ? line || p.slot.role : 'Unused substitute'}</span>
                </span>
                <span className="pos">{p.def.role}</span>
                <span className="rating">{l.played ? l.rating.toFixed(1) : '–'}</span>
              </button>
            </li>
          )
        }
        const idxs = match.players.map((p, i) => (p.team === team ? i : -1)).filter((i) => i >= 0)
        return (
          <section key={team}>
            <h3>{match.teams[team].name}</h3>
            <ol>{idxs.filter((i) => !bench.has(match.players[i].def)).map(row)}</ol>
            <h4>Substitutes</h4>
            <ol>{idxs.filter((i) => bench.has(match.players[i].def)).map(row)}</ol>
          </section>
        )
      })}
    </div>
  )
}
