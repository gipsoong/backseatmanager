/**
 * A player's season in full: the totals, the numbers underneath them (expected goals and assists,
 * chances, finishing, defending, keeping) and every match he played.
 */
import type { PlayerDef } from '../engine/index.ts'
import { positionsLabel, styleLabel } from '../names.ts'
import { RATED_MINUTES, type Season, type SeasonStats, avgRating, playerRating, squadOf } from '../season/season.ts'
import { clubOf, goalsPrevented, matchLog, onTargetRate, per90 } from '../season/stats.ts'
import { Swatch } from './Hub.tsx'

const n = (st: SeasonStats, k: keyof SeasonStats): number => st[k] ?? 0
const pct = (a: number, b: number): string => (b ? `${Math.round((a / b) * 100)}%` : '–')
const dec = (v: number, d = 1): string => v.toFixed(d)
const signed = (v: number): string => (v > 0 ? `+${v.toFixed(1)}` : v.toFixed(1))
const rate = (v: number | null, d = 2): string => (v === null ? '–' : v.toFixed(d))

function findPlayer(s: Season, id: string): PlayerDef | undefined {
  return s.teams.flatMap(squadOf).find((p) => p.id === id)
}

export function PlayerCard({ season, id, onClose }: { season: Season; id: string; onClose: () => void }) {
  const p = findPlayer(season, id)
  if (!p) return null
  const st = season.stats[id]
  const club = clubOf(season, id)
  const keeper = p.role === 'GK'
  const mins = n(st, 'minutes')
  const log = matchLog(season, id)
  const npGoals = st.goals - n(st, 'penGoals')
  const sections: { title: string; rows: [string, string, string?][] }[] = [
    {
      title: 'Season',
      rows: [
        ['Appearances', st.starts === undefined ? String(st.apps) : `${st.starts} (${st.apps - st.starts})`, 'Starts (as a substitute)'],
        ['Minutes', String(mins)],
        ['Average rating', avgRating(st) === null ? '–' : dec(avgRating(st)!, 2), `Over ${st.rated ?? st.apps} matches: appearances under ${RATED_MINUTES} minutes aren't rated`],
        ['Goals', String(st.goals)],
        ['Assists', String(st.assists)],
      ],
    },
    ...(keeper
      ? [
          {
            title: 'Keeping',
            rows: [
              ['Clean sheets', String(n(st, 'cleanSheets'))],
              ['Goals conceded', String(n(st, 'conceded'))],
              ['Saves', String(n(st, 'saves'))],
              ['Save rate', pct(n(st, 'saves'), n(st, 'saves') + n(st, 'conceded')), 'Saves out of shots on target faced'],
              ['Goals prevented', signed(goalsPrevented(st, onTargetRate(season))), 'Goals an average keeper here would have let in from the shots on target he faced, less the goals he let in'],
            ] as [string, string, string?][],
          },
        ]
      : []),
    {
      title: 'Shooting',
      rows: [
        ['Shots', `${n(st, 'shots')} (${n(st, 'onTarget')} on target)`],
        ['xG', `${dec(n(st, 'xg'))} (non-penalty ${dec(n(st, 'npxg'))})`],
        ['Goals − xG', signed(st.goals - n(st, 'xg')), 'Above zero: finishing better than the chances suggest'],
        ['Non-penalty goals − xG', signed(npGoals - n(st, 'npxg'))],
        ['xG per shot', n(st, 'shots') ? dec(n(st, 'xg') / n(st, 'shots'), 2) : '–', 'How good his chances were, on average'],
        ['Conversion', pct(st.goals, n(st, 'shots'))],
        ['Big chances scored', `${n(st, 'bigChancesScored')} of ${n(st, 'bigChances')}`, 'Non-penalty chances worth 0.3 xG or more'],
        ['Penalties', `${n(st, 'penGoals')} of ${n(st, 'penTaken')}`],
        ['Goals: left, right, head', `${n(st, 'leftGoals')}, ${n(st, 'rightGoals')}, ${n(st, 'headedGoals')}`],
        ['Goals, xG per 90', `${rate(per90(st.goals, mins))}, ${rate(per90(n(st, 'xg'), mins))}`],
        ['Minutes per goal', st.goals ? String(Math.round(mins / st.goals)) : '–'],
      ],
    },
    {
      title: 'Creating',
      rows: [
        ['xA', dec(n(st, 'xa')), 'xG of the shots taken straight from his passes'],
        ['Assists − xA', signed(st.assists - n(st, 'xa'))],
        ['Chances created', String(n(st, 'keyPasses')), 'Passes straight to a shot'],
        ['Passes', `${n(st, 'passesCompleted')} of ${n(st, 'passes')} (${pct(n(st, 'passesCompleted'), n(st, 'passes'))})`],
        ['Dribbles', String(n(st, 'dribbles'))],
        ['xA, chances per 90', `${rate(per90(n(st, 'xa'), mins))}, ${rate(per90(n(st, 'keyPasses'), mins))}`],
      ],
    },
    {
      title: 'Defending',
      rows: [
        ['Tackles won', String(n(st, 'tackles'))],
        ['Interceptions', String(n(st, 'interceptions'))],
        ['Blocks', String(n(st, 'blocks'))],
        ['Clearances', String(n(st, 'clearances'))],
        ['Headers won', String(n(st, 'aerials'))],
        ['Loose balls won', String(n(st, 'recoveries'))],
        ['Dribbled past', String(n(st, 'dribbledPast'))],
        ['Tackles + interceptions per 90', rate(per90(n(st, 'tackles') + n(st, 'interceptions'), mins), 1)],
        ['Fouls, cards', `${n(st, 'fouls')}, ${n(st, 'yellows')} yellow${n(st, 'reds') ? `, ${n(st, 'reds')} red` : ''}`],
        ['Own goals', String(n(st, 'ownGoals'))],
      ],
    },
  ]

  return (
    <div className="player-card season-card">
      <button type="button" className="back" onClick={onClose}>
        ← Back
      </button>
      <div className="card-head">
        {club >= 0 && <Swatch kit={season.teams[club].kit} />}
        <div>
          <h3>{p.name}</h3>
          <p className="muted">
            {positionsLabel(p)} · {styleLabel(p)} · {club >= 0 ? season.teams[club].name : ''}
          </p>
        </div>
        <span className="rating big" title="Overall">
          {playerRating(p)}
        </span>
      </div>
      {!st.apps ? (
        <p className="meta">He hasn't played this season.</p>
      ) : (
        <>
          <div className="season-sections">
            {sections.map((sec) => (
              <section key={sec.title}>
                <h4>{sec.title}</h4>
                <dl>
                  {sec.rows.map(([label, value, hint]) => (
                    <div key={label} title={hint}>
                      <dt>{label}</dt>
                      <dd>{value}</dd>
                    </div>
                  ))}
                </dl>
              </section>
            ))}
          </div>
          <section>
            <h4>Match by match</h4>
            <table className="league match-log">
              <thead>
                <tr>
                  <th>MD</th>
                  <th className="team">Opponent</th>
                  <th>Score</th>
                  <th title="Minutes">Min</th>
                  <th title="Goals, assists">G/A</th>
                  <th className="wide">xG</th>
                  <th className="wide">xA</th>
                  <th>Rtg</th>
                </tr>
              </thead>
              <tbody>
                {log.map((r) => (
                  <tr key={r.matchday}>
                    <td>{r.matchday}</td>
                    <td className="team">
                      {r.home ? '' : '@ '}
                      {season.teams[r.opponent].name}
                    </td>
                    <td className={`res ${r.score[0] > r.score[1] ? 'W' : r.score[0] < r.score[1] ? 'L' : 'D'}`}>
                      {r.score[0]}–{r.score[1]}
                    </td>
                    <td>{r.started ? r.minutes : `${r.minutes}*`}</td>
                    <td>{r.goals || r.assists ? `${r.goals}/${r.assists}` : '–'}</td>
                    <td className="wide">{r.xg ? r.xg.toFixed(2) : '–'}</td>
                    <td className="wide">{r.xa ? r.xa.toFixed(2) : '–'}</td>
                    <td>{r.rating.toFixed(1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="meta">* Came on as a substitute.</p>
          </section>
        </>
      )}
    </div>
  )
}
