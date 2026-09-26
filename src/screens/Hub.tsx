/** The season between matches: the next fixture, the table, and results and fixtures by matchday. */
import { useState } from 'react'
import type { Kit, TeamDef } from '../engine/index.ts'
import { ordinal } from './format.ts'
import { MATCHDAYS, type Season, fixturesOn, isOver, matchdayDate, table, userFixture } from '../season/season.ts'
import { surname } from '../viewer/commentary.ts'

const dateFmt = new Intl.DateTimeFormat(undefined, { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC' })

export function Swatch({ kit }: { kit: Kit }) {
  return <span className="swatch" style={{ background: kit.shirt }} />
}

export function Hub({
  season,
  busy,
  onWatch,
  onSimulate,
  onNewSeason,
}: {
  season: Season
  busy: boolean
  onWatch: () => void
  onSimulate: () => void
  onNewSeason: () => void
}) {
  const [tab, setTab] = useState<'table' | 'fixtures'>('table')
  const [shown, setShown] = useState(Math.min(season.matchday, MATCHDAYS))
  const me = season.teams[season.userTeam]
  const rows = table(season)
  const over = isOver(season)
  const next = over ? undefined : userFixture(season, season.matchday)
  const last = season.matchday > 1 ? userFixture(season, season.matchday - 1) : undefined
  const place = rows.findIndex((r) => r.team === season.userTeam) + 1

  return (
    <div className="hub">
      <header className="top">
        <div className="fixture">
          <p className="eyebrow">Matchday · Season {season.startDate.slice(0, 4)}</p>
          <h1>
            <Swatch kit={me.kit} /> {me.name}
          </h1>
          <p className="meta">
            {ordinal(place)} of {season.teams.length} · {over ? 'Season over' : `Matchday ${season.matchday} of ${MATCHDAYS}`}
          </p>
        </div>
      </header>

      <div className="hub-grid">
        <section className="card next">
          {next ? (
            <>
              <p className="eyebrow">
                Next · {dateFmt.format(matchdayDate(season, next.matchday))} · {next.home === season.userTeam ? 'Home' : 'Away'}
              </p>
              <h2 className="versus">
                <TeamName team={season.teams[next.home]} /> <span className="v">v</span> <TeamName team={season.teams[next.away]} />
              </h2>
              <div className="actions">
                <button type="button" className="btn" onClick={onWatch} disabled={busy}>
                  Watch the match
                </button>
                <button type="button" className="btn ghost" onClick={onSimulate} disabled={busy}>
                  {busy ? 'Playing…' : 'Just the result'}
                </button>
              </div>
            </>
          ) : (
            <>
              <p className="eyebrow">Season over</p>
              <h2 className="versus">
                {season.teams[rows[0].team].name} are champions
              </h2>
              <p className="meta">
                {me.name} finished {ordinal(place)} with {rows[place - 1].points} points.
              </p>
              <div className="actions">
                <button type="button" className="btn" onClick={onNewSeason}>
                  New season
                </button>
              </div>
            </>
          )}
          {last?.result && (
            <p className="last">
              Last time: {season.teams[last.home].shortName} {last.result.score[0]}–{last.result.score[1]} {season.teams[last.away].shortName}
            </p>
          )}
        </section>

        <section className="card">
          <div className="tabs" role="tablist">
            <button type="button" role="tab" aria-selected={tab === 'table'} onClick={() => setTab('table')}>
              Table
            </button>
            <button type="button" role="tab" aria-selected={tab === 'fixtures'} onClick={() => setTab('fixtures')}>
              Fixtures
            </button>
          </div>
          {tab === 'table' ? (
            <table className="league">
              <thead>
                <tr>
                  <th aria-label="Position" />
                  <th className="team">Team</th>
                  <th>P</th>
                  <th className="wide">W</th>
                  <th className="wide">D</th>
                  <th className="wide">L</th>
                  <th>GD</th>
                  <th>Pts</th>
                  <th className="wide form-head">Form</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => {
                  const t = season.teams[r.team]
                  const gd = r.goalsFor - r.goalsAgainst
                  return (
                    <tr key={r.team} className={r.team === season.userTeam ? 'mine' : undefined}>
                      <td className="pos">{i + 1}</td>
                      <td className="team">
                        <Swatch kit={t.kit} /> {t.name}
                      </td>
                      <td>{r.played}</td>
                      <td className="wide">{r.won}</td>
                      <td className="wide">{r.drawn}</td>
                      <td className="wide">{r.lost}</td>
                      <td>{gd > 0 ? `+${gd}` : gd}</td>
                      <td className="pts">{r.points}</td>
                      <td className="wide form">
                        {r.form.map((f, k) => (
                          <span key={k} className={`f ${f}`} title={f === 'W' ? 'Won' : f === 'D' ? 'Drawn' : 'Lost'} />
                        ))}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          ) : (
            <div className="fixtures">
              <div className="md-nav">
                <button type="button" className="btn ghost" onClick={() => setShown((m) => Math.max(1, m - 1))} disabled={shown <= 1} aria-label="Previous matchday">
                  ‹
                </button>
                <span>
                  Matchday {shown} · {dateFmt.format(matchdayDate(season, shown))}
                </span>
                <button type="button" className="btn ghost" onClick={() => setShown((m) => Math.min(MATCHDAYS, m + 1))} disabled={shown >= MATCHDAYS} aria-label="Next matchday">
                  ›
                </button>
              </div>
              <ul>
                {fixturesOn(season, shown).map((f) => (
                  <li key={f.id} className={f.home === season.userTeam || f.away === season.userTeam ? 'mine' : undefined}>
                    <span className="home">{season.teams[f.home].name}</span>
                    <span className="score">{f.result ? `${f.result.score[0]}–${f.result.score[1]}` : 'v'}</span>
                    <span className="away">{season.teams[f.away].name}</span>
                    {f.result && f.result.goals.length > 0 && (
                      <span className="scorers">
                        {f.result.goals.map((g) => `${surname(g.scorer)}${g.ownGoal ? ' (og)' : ''} ${g.clock}`).join(', ')}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

function TeamName({ team }: { team: TeamDef }) {
  return (
    <span className="team-name">
      <Swatch kit={team.kit} /> {team.name}
    </span>
  )
}
