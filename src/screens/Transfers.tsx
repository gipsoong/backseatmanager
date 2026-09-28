/**
 * The January window (draft mode): pick a club, who you want from them and who you'll give, and
 * see straight away whether they'd take it.
 */
import { useState } from 'react'
import type { PlayerDef } from '../engine/index.ts'
import { positionsLabel, styleLabel } from '../names.ts'
import { type Season, avgRating, matchdayDate, playerRating, squadOf } from '../season/season.ts'
import { DEALS_PER_WINDOW, type Deal, MAX_PER_SIDE, PREMIUM, dealsDone, judge, windowMatchdays, windowOpen } from '../draft/transfers.ts'
import { Swatch } from './Hub.tsx'

const dateFmt = new Intl.DateTimeFormat(undefined, { day: 'numeric', month: 'long', timeZone: 'UTC' })

export function Transfers({ season, onDeal }: { season: Season; onDeal: (deal: Deal) => void }) {
  const january = windowMatchdays(season)
  const open = windowOpen(season)
  const others = season.teams.map((_, i) => i).filter((i) => i !== season.userTeam)
  const [club, setClub] = useState(others[0])
  const [give, setGive] = useState<string[]>([])
  const [get, setGet] = useState<string[]>([])
  const deal: Deal = { club, give, get }
  const verdict = judge(season, deal)
  const toggle = (list: string[], set: (l: string[]) => void, id: string): void =>
    set(list.includes(id) ? list.filter((x) => x !== id) : list.length < MAX_PER_SIDE ? [...list, id] : list)
  const done = season.transfers ?? []
  const name = (id: string): string => season.teams.flatMap(squadOf).find((p) => p.id === id)?.name ?? id

  const first = january[0]
  const last = january.at(-1)
  return (
    <div className="transfers">
      <p className="meta pad">
        {open
          ? `The January window is open until the match on ${dateFmt.format(matchdayDate(season, last!))} (matchday ${last}). Swap players with another club: one or two of yours for one or two of theirs. ${DEALS_PER_WINDOW - dealsDone(season)} of ${DEALS_PER_WINDOW} deals left.`
          : first && season.matchday < first
            ? `The January window opens before matchday ${first} (${dateFmt.format(matchdayDate(season, first))}). Then you can swap players with the other clubs.`
            : 'The January window has shut.'}
      </p>
      {open && (
        <>
          <label className="shape pad-x">
            <span className="eyebrow">Deal with</span>
            <select
              value={club}
              onChange={(e) => {
                setClub(Number(e.target.value))
                setGet([])
              }}
            >
              {others.map((i) => (
                <option key={i} value={i}>
                  {season.teams[i].name}
                </option>
              ))}
            </select>
          </label>
          <div className="deal-grid">
            <PlayerPick title={`From ${season.teams[club].name}`} season={season} club={club} picked={get} onToggle={(id) => toggle(get, setGet, id)} />
            <PlayerPick title="You offer" season={season} club={season.userTeam} picked={give} onToggle={(id) => toggle(give, setGive, id)} />
          </div>
          <section className={`verdict${verdict.ok ? ' yes' : ''}`} aria-live="polite">
            <p className="deal-line">
              {get.length ? get.map(name).join(' and ') : '…'} <span className="muted">for</span> {give.length ? give.map(name).join(' and ') : '…'}
            </p>
            {verdict.ratio > 0 && (
              <div className="gauge" title={`What they get is worth ${Math.round(verdict.ratio * 100)}% of what they give up, to them. They want ${Math.round(PREMIUM * 100)}%.`}>
                <span style={{ width: `${Math.min(100, (verdict.ratio / 1.5) * 100)}%` }} />
                <i style={{ left: `${(PREMIUM / 1.5) * 100}%` }} />
              </div>
            )}
            <p className="meta">
              {verdict.reason}
              {verdict.ratio > 0 && ` Their side ${verdict.before.toFixed(1)} → ${verdict.after.toFixed(1)}.`}
            </p>
            <button
              type="button"
              className="btn"
              disabled={!verdict.ok}
              onClick={() => {
                onDeal(deal)
                setGive([])
                setGet([])
              }}
            >
              Make the deal
            </button>
          </section>
        </>
      )}
      {done.length > 0 && (
        <section className="pad">
          <h4 className="eyebrow">Deals done</h4>
          <ul className="deals">
            {done.map((t, i) => {
              const club = t.from.find((c) => c !== season.userTeam) ?? t.to.find((c) => c !== season.userTeam)!
              const inIds = t.ids.filter((_, k) => t.to[k] === season.userTeam)
              const outIds = t.ids.filter((_, k) => t.from[k] === season.userTeam)
              return (
                <li key={i}>
                  <Swatch kit={season.teams[club].kit} /> {inIds.map(name).join(', ')} <span className="muted">in, for</span> {outIds.map(name).join(', ')}{' '}
                  <span className="muted">
                    · {season.teams[club].name}, before matchday {t.matchday}
                  </span>
                </li>
              )
            })}
          </ul>
        </section>
      )}
    </div>
  )
}

function PlayerPick({ title, season, club, picked, onToggle }: { title: string; season: Season; club: number; picked: string[]; onToggle: (id: string) => void }) {
  const moved = new Set((season.transfers ?? []).flatMap((t) => t.ids))
  const squad = [...squadOf(season.teams[club])].sort((a, b) => playerRating(b) - playerRating(a))
  const form = (p: PlayerDef): string => {
    const st = season.stats[p.id]
    return st?.apps ? `${avgRating(st)?.toFixed(1) ?? '–'} avg, ${st.apps} apps` : 'No apps'
  }
  return (
    <section className="pick">
      <h4 className="eyebrow">{title}</h4>
      <ul className="offer-list">
        {squad.map((p) => {
          const out = season.condition[p.id].injuredUntil - season.matchday
          return (
            <li key={p.id}>
              <button type="button" className={`offer${picked.includes(p.id) ? ' chosen' : ''}`} aria-pressed={picked.includes(p.id)} disabled={moved.has(p.id)} onClick={() => onToggle(p.id)}>
                <span className="role">{positionsLabel(p)}</span>
                <span className="name">
                  {p.name}
                  {out > 0 && <span className="inj-note">Out {out === 1 ? '1 week' : `${out} weeks`}</span>}
                  <small className="style">
                    {styleLabel(p)} · {form(p)}
                  </small>
                </span>
                <span className="rating">{playerRating(p)}</span>
              </button>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
