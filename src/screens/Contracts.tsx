/**
 * The career's Contracts tab: deals ending this summer (renew at his asking wage, or let him go),
 * the free agents (sign for wages only while a window is open, judged by what he does to the
 * eleven), free signings this season, and the squad's contracts.
 */
import { useState } from 'react'
import { positionsLabel, styleLabel } from '../names.ts'
import { type Season, playerRating, squadOf } from '../season/season.ts'
import { RED_LINE, expiringAt, judgeFreeAgent, renewProblem, renewalTerms, seasonYear } from '../career/contracts.ts'
import { WAGE_BUDGET, inTheRed, money, wageBill, wageOf } from '../career/money.ts'
import { windowMatchdays, windowName, windowOpen } from '../draft/transfers.ts'
import { Effect } from './Transfers.tsx'
import { stagger } from './motion.ts'

/** Free agents shown before "Show all". */
const SHOWN = 12

/** "2027–28" for a deal ending in the summer of 2028: its last season. */
const lastSeason = (until: number): string => `${until - 1}–${String(until).slice(2)}`

/** Expiring deals the manager hasn't decided on yet, for the tab's badge. */
export const undecided = (s: Season): number =>
  s.career ? expiringAt(s).filter((p) => !s.career!.people[p.id]?.contract?.leaving).length : 0

export function Contracts({
  season,
  onRenew,
  onLetGo,
  onSign,
}: {
  season: Season
  onRenew: (id: string) => void
  onLetGo: (id: string, leaving: boolean) => void
  onSign: (id: string) => void
}) {
  const c = season.career!
  const [chosen, setChosen] = useState<string | null>(null)
  const [all, setAll] = useState(false)
  const expiring = expiringAt(season).sort((a, b) => playerRating(b) - playerRating(a))
  const pool = c.freeAgents ?? []
  const open = windowOpen(season)
  const nextWindow = windowMatchdays(season).find((md) => md > season.matchday)
  const verdict = chosen ? judgeFreeAgent(season, chosen) : null
  const squad = [...squadOf(season.teams[season.userTeam])].sort(
    (a, b) => (c.people[a.id]?.contract?.until ?? 0) - (c.people[b.id]?.contract?.until ?? 0) || playerRating(b) - playerRating(a),
  )
  const year = seasonYear(season)
  const signed = (c.signings ?? []).filter((x) => x.club === season.userTeam)
  const nameOf = (id: string): string => squadOf(season.teams[season.userTeam]).find((p) => p.id === id)?.name ?? id

  const finance = c.finance
  const bill = wageBill(season, season.userTeam)
  const red = inTheRed(season)
  return (
    <div className="contracts">
      {finance && (
        <section className="pad">
          <h4 className="eyebrow">Money</h4>
          <p className="meta">
            Budget <strong>{money(finance.cash[season.userTeam])}</strong> · wages {money(bill)} a season against income of{' '}
            {money(finance.income[season.userTeam])} (prize money on top). The accounts are settled each summer.
            {bill > finance.income[season.userTeam] * WAGE_BUDGET && !red && ' Your wages are running ahead of your income: the summer will cost you.'}
          </p>
          {red && (
            <p className="money-warning" role="status">
              {RED_LINE} Sell players, or let wages go in the summer.
            </p>
          )}
        </section>
      )}
      <section className="pad">
        <h4 className="eyebrow">Ending this summer</h4>
        {expiring.length === 0 ? (
          <p className="meta">Nobody's contract runs out this summer.</p>
        ) : (
          <>
            <p className="meta">Renew a player at what he asks, or let him go: he leaves as a free agent when the season ends.</p>
            <ul className="contract-list">
              {expiring.map((p, i) => {
                const who = c.people[p.id]
                const terms = renewalTerms(season, p.id)
                const leaving = !!who.contract?.leaving
                const problem = renewProblem(season, p.id)
                return (
                  <li key={p.id} className="contract-row rise" style={stagger(i)}>
                    <span className="role">{positionsLabel(p)}</span>
                    <span className="name">
                      {p.name}
                      <small className="style">
                        {who.age} · {styleLabel(p)} · now £{wageOf(p, who)}k a week
                      </small>
                      <small className={leaving ? 'leaving' : 'asks'}>
                        {leaving
                          ? 'Leaving in the summer'
                          : `Asks £${terms.wage}k a week for ${terms.years === 1 ? 'a year' : `${terms.years} years`} (to ${lastSeason(terms.until)})${problem ? ': a rise you can\u2019t give in the red' : ''}`}
                      </small>
                    </span>
                    <span className="rating">{playerRating(p)}</span>
                    <span className="contract-actions">
                      <button type="button" className="btn slim" disabled={!!problem} title={problem ?? undefined} onClick={() => onRenew(p.id)}>
                        Renew
                      </button>
                      <button type="button" className="btn ghost slim" onClick={() => onLetGo(p.id, !leaving)}>
                        {leaving ? 'Undo' : 'Let go'}
                      </button>
                    </span>
                  </li>
                )
              })}
            </ul>
          </>
        )}
      </section>

      <section className="pad">
        <h4 className="eyebrow">Free agents</h4>
        <p className="meta">
          {pool.length === 0
            ? 'No free agents this season: whoever leaves a club this summer will be here.'
            : open
              ? `Out of contract, they sign for wages only while the ${windowName(season)} window is open. Choose one to see what he'd do for your side.`
              : nextWindow
                ? `They sign for wages only, while a window is open: the ${windowName(season, nextWindow)} window opens before matchday ${nextWindow}.`
                : "The windows have shut for this season: they'll be gone by next summer."}
        </p>
        {pool.length > 0 && (
          <ul className="offer-list">
            {(all ? pool : pool.slice(0, SHOWN)).map((f) => (
              <li key={f.player.id}>
                <button
                  type="button"
                  className={`offer${chosen === f.player.id ? ' chosen' : ''}`}
                  aria-pressed={chosen === f.player.id}
                  onClick={() => setChosen(chosen === f.player.id ? null : f.player.id)}
                >
                  <span className="role">{positionsLabel(f.player)}</span>
                  <span className="name">
                    {f.player.name}
                    <small className="style">
                      {f.person.age} · {styleLabel(f.player)} · £{f.wage}k a week
                      {f.from !== null && ` · was ${season.teams[f.from].shortName}`}
                    </small>
                  </span>
                  <span className="rating">{playerRating(f.player)}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
        {pool.length > SHOWN && (
          <button type="button" className="btn ghost slim show-all" onClick={() => setAll(!all)}>
            {all ? 'Show fewer' : `Show all ${pool.length}`}
          </button>
        )}
        {verdict && chosen && (
          <section className={`verdict${verdict.ok ? ' yes' : ''}`} aria-live="polite">
            <p className={`interest ${verdict.ok ? 'yes' : 'no'}`}>{verdict.reason}</p>
            {verdict.you && <Effect side={verdict.you} title="For you" />}
            <p className="meta">
              Wages {money((verdict.wage * 52) / 1000)} a season · your budget {money(c.finance?.cash[season.userTeam] ?? 0)}
            </p>
            <button
              type="button"
              className="btn"
              disabled={!verdict.ok}
              onClick={() => {
                onSign(chosen)
                setChosen(null)
              }}
            >
              Sign him
            </button>
          </section>
        )}
      </section>

      {signed.length > 0 && (
        <section className="pad">
          <h4 className="eyebrow">Signed on a free</h4>
          <ul className="deals">
            {signed.map((x) => (
              <li key={x.id}>
                {nameOf(x.id)} <span className="muted">· £{x.wage}k a week, before matchday {x.matchday}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="pad">
        <h4 className="eyebrow">The squad's contracts</h4>
        <div className="table-scroll">
          <table className="league contracts-table">
            <thead>
              <tr>
                <th className="team">Player</th>
                <th>Age</th>
                <th title="Overall">Rtg</th>
                <th title="Wage, £k a week">Wage</th>
                <th title="The last season of his contract">Until</th>
              </tr>
            </thead>
            <tbody>
              {squad.map((p) => {
                const who = c.people[p.id]
                const until = who?.contract?.until
                return (
                  <tr key={p.id} className={until !== undefined && until - year <= 1 ? 'mine' : undefined}>
                    <td className="team">{p.name}</td>
                    <td>{who?.age ?? '–'}</td>
                    <td>{playerRating(p)}</td>
                    <td>£{wageOf(p, who)}k</td>
                    <td>{until === undefined ? '–' : lastSeason(until)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
