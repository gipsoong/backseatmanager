/** The league's numbers (leaderboards, clubs' style and record) and the end-of-season review. */
import { useState } from 'react'
import { type Season, matchdays, table } from '../season/season.ts'
import { type ClubRecord, clubRecords, leaderboards } from '../season/stats.ts'
import { ordinal } from './format.ts'
import { Swatch } from './Hub.tsx'

export function Stats({ season }: { season: Season }) {
  const [view, setView] = useState<'players' | 'clubs'>('players')
  return (
    <div className="stats-tab">
      <div className="seg" role="tablist">
        <button type="button" role="tab" aria-selected={view === 'players'} onClick={() => setView('players')}>
          Players
        </button>
        <button type="button" role="tab" aria-selected={view === 'clubs'} onClick={() => setView('clubs')}>
          Clubs
        </button>
      </div>
      {view === 'players' ? <Leaders season={season} /> : <Clubs season={season} records={clubRecords(season)} />}
    </div>
  )
}

function Leaders({ season }: { season: Season }) {
  const boards = leaderboards(season)
  if (season.matchday === 1) return <p className="meta pad">No matches played yet.</p>
  return (
    <div className="boards">
      {boards.map((b) => (
        <section key={b.title} className="board">
          <h3>{b.title}</h3>
          {b.rows.length ? (
            <ol>
              {b.rows.map((r) => (
                <li key={r.player.id} className={r.club === season.userTeam ? 'mine' : undefined}>
                  <span className="name">
                    <Swatch kit={season.teams[r.club].kit} /> {r.player.name}
                  </span>
                  <span className="value">{b.format(r.value)}</span>
                </li>
              ))}
            </ol>
          ) : (
            <p className="meta">Nobody yet.</p>
          )}
        </section>
      ))}
    </div>
  )
}

function Clubs({ season, records }: { season: Season; records: ClubRecord[] }) {
  const order = table(season).map((r) => records[r.team])
  const pct = (v: number): string => `${Math.round(v * 100)}%`
  return (
    <table className="league club-stats">
      <thead>
        <tr>
          <th className="team">Club</th>
          <th title="Possession">Poss</th>
          <th title="Pass completion">Pass</th>
          <th className="wide" title="Shots per match">Sh</th>
          <th title="Goals for (expected)">GF</th>
          <th title="Goals against (expected)">GA</th>
          <th className="wide" title="Clean sheets">CS</th>
        </tr>
      </thead>
      <tbody>
        {order.map((c) => (
          <tr key={c.team} className={c.team === season.userTeam ? 'mine' : undefined}>
            <td className="team">
              <Swatch kit={season.teams[c.team].kit} /> {season.teams[c.team].name}
            </td>
            <td>{c.played ? pct(c.possession) : '–'}</td>
            <td>{c.played ? pct(c.passPct) : '–'}</td>
            <td className="wide">{c.played ? c.shots.toFixed(1) : '–'}</td>
            <td>
              {c.goalsFor} <span className="muted">({c.xgFor.toFixed(0)})</span>
            </td>
            <td>
              {c.goalsAgainst} <span className="muted">({c.xgAgainst.toFixed(0)})</span>
            </td>
            <td className="wide">{c.cleanSheets}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

/** The season in review: your record, then every club's. */
export function SeasonReview({ season }: { season: Season }) {
  const rows = table(season)
  const records = clubRecords(season)
  const mine = records[season.userTeam]
  const place = rows.findIndex((r) => r.team === season.userTeam) + 1
  const invincible = mine.lost === 0
  const perfect = mine.won === matchdays(season)
  const name = (t: number): string => season.teams[t].name
  const leaders = leaderboards(season, 1)
  const top = (title: string) => leaders.find((b) => b.title === title)?.rows[0]
  const scorer = top('Goals')
  const best = top('Average rating')

  return (
    <div className="review">
      <section className="review-mine">
        <p className="eyebrow">Your season</p>
        <h3>
          {ordinal(place)} · W{mine.won} D{mine.drawn} L{mine.lost} · {rows[place - 1].points} pts
        </h3>
        <p className="meta">
          {perfect
            ? `${mine.won}-0. Every match won.`
            : invincible
              ? 'Unbeaten all season.'
              : `Longest unbeaten run ${mine.unbeaten}, longest winning run ${mine.wins}.`}{' '}
          Goals {mine.goalsFor}–{mine.goalsAgainst}, {mine.cleanSheets} clean sheets.
          {mine.biggestWin && ` Biggest win ${mine.biggestWin.for}–${mine.biggestWin.against} against ${name(mine.biggestWin.opponent)}.`}
          {mine.topScorer && ` Top scorer ${mine.topScorer.player.name} (${mine.topScorer.goals}).`}
        </p>
        <p className="meta">
          {name(rows[0].team)} are champions.
          {scorer && ` Golden Boot: ${scorer.player.name}, ${scorer.value} goals (${name(scorer.club)}).`}
          {best && ` Best average rating: ${best.player.name}, ${best.value.toFixed(2)}.`}
        </p>
      </section>
      <table className="league review-table">
        <thead>
          <tr>
            <th aria-label="Position" />
            <th className="team">Club</th>
            <th>W-D-L</th>
            <th>Pts</th>
            <th className="wide" title="Longest unbeaten run">Unb</th>
            <th className="wide" title="Longest winning run">Wins</th>
            <th className="wide">Biggest win</th>
            <th className="wide">Top scorer</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => {
            const c = records[r.team]
            return (
              <tr key={r.team} className={r.team === season.userTeam ? 'mine' : undefined}>
                <td className="pos">{i + 1}</td>
                <td className="team">
                  <Swatch kit={season.teams[r.team].kit} /> {name(r.team)}
                </td>
                <td>
                  {c.won}-{c.drawn}-{c.lost}
                </td>
                <td className="pts">{r.points}</td>
                <td className="wide">{c.unbeaten}</td>
                <td className="wide">{c.wins}</td>
                <td className="wide">{c.biggestWin ? `${c.biggestWin.for}–${c.biggestWin.against} v ${season.teams[c.biggestWin.opponent].shortName}` : '–'}</td>
                <td className="wide">{c.topScorer ? `${c.topScorer.player.name} (${c.topScorer.goals})` : '–'}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
