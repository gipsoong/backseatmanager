import { useState } from 'react'
import { type MatchState, randomTeam, runMatch } from './engine/index.ts'

/**
 * Placeholder shell: runs a whole match through the headless engine and shows the result.
 * The match viewer (pitch, playback, commentary) is the next milestone.
 */
export default function App() {
  const [seed, setSeed] = useState(1)
  const [match, setMatch] = useState<MatchState | null>(null)

  const play = () => {
    setMatch(runMatch(randomTeam(seed * 2 + 1), randomTeam(seed * 2 + 2), { seed }))
  }

  return (
    <main>
      <h1>Matchday</h1>
      <div className="controls">
        <label>
          Seed <input type="number" value={seed} onChange={(e) => setSeed(Number(e.target.value))} />
        </label>
        <button onClick={play}>Simulate match</button>
      </div>
      {match && <Result match={match} />}
    </main>
  )
}

function Result({ match }: { match: MatchState }) {
  const [home, away] = match.teams
  const name = (idx: number) => match.players[idx].def.name
  const goals = match.events.filter((e) => e.type === 'goal')
  const [h, a] = match.stats
  const possession = Math.round((100 * h.possessionTicks) / (h.possessionTicks + a.possessionTicks || 1))
  const rows: [string, string | number, string | number][] = [
    ['Possession', `${possession}%`, `${100 - possession}%`],
    ['Shots', h.shots, a.shots],
    ['On target', h.shotsOnTarget, a.shotsOnTarget],
    ['xG', h.xg.toFixed(2), a.xg.toFixed(2)],
    ['Passes', h.passes, a.passes],
    ['Fouls', h.fouls, a.fouls],
    ['Yellow cards', h.yellowCards, a.yellowCards],
  ]
  return (
    <section>
      <p className="score">
        {home.name} {match.score[0]} – {match.score[1]} {away.name}
      </p>
      <ul className="goals">
        {goals.map((g) =>
          g.type === 'goal' ? (
            <li key={g.tick}>
              {g.clock} {name(g.scorerIdx)}
              {g.ownGoal ? ' (og)' : ''} ({match.teams[g.team].shortName})
              {g.assistIdx !== null ? `, assist ${name(g.assistIdx)}` : ''}
            </li>
          ) : null,
        )}
      </ul>
      <table>
        <tbody>
          {rows.map(([label, x, y]) => (
            <tr key={label}>
              <td>{x}</td>
              <th>{label}</th>
              <td>{y}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  )
}
