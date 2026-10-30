/**
 * The draft: pick a shape, then twenty rounds. Each offers one club-season's squad; choose one
 * and put him in an open place, a starter or one of nine substitutes. Then name the side.
 */
import { useEffect, useRef, useState } from 'react'
import { FORMATIONS, FORMATION_NAMES, fitFor, type Formation, type PlayerDef } from '../engine/index.ts'
import { DRAFT_ROUNDS, DRAFT_SUBS, LEAGUES, type Draft as DraftState, type Place, draftRating, isComplete, newDraft, offer, place, poolName, roundOf } from '../draft/draft.ts'
import type { League } from '../draft/pools.ts'
import { Swatch } from './Hub.tsx'
import { stagger } from './motion.ts'
import { slotLabel, slotStyle } from './pitchLayout.ts'
import { positionsLabel, shortName as surname, styleLabel } from '../names.ts'

export function Draft({ seed, onDone, onBack }: { seed: number; onDone: (d: DraftState, name: string) => void; onBack: () => void }) {
  const [draft, setDraft] = useState<DraftState | null>(null)
  const [chosen, setChosen] = useState<PlayerDef | null>(null)
  const [name, setName] = useState('Backseat XI')
  const [league, setLeague] = useState<League>('Premier League')
  // The place filled last, so it can settle in; and the phone's sheet held open to show it.
  const [placed, setPlaced] = useState<string | null>(null)
  const [peek, setPeek] = useState(false)
  const closing = useRef<number | undefined>(undefined)
  useEffect(() => () => window.clearTimeout(closing.current), [])

  if (!draft) return <PickShape league={league} onLeague={setLeague} onPick={(f) => setDraft(newDraft(seed, f, league))} onBack={onBack} />
  const where = draft.league ?? 'Premier League'

  const slots = FORMATIONS[draft.formation]
  const done = isComplete(draft)
  const round = roundOf(draft)
  const starters = draft.xi.filter(Boolean).length
  const subs = draft.bench.filter(Boolean).length
  const put = (at: Place): void => {
    if (!chosen) return
    setDraft(place(draft, chosen, at))
    setChosen(null)
    setPlaced('xi' in at ? `xi-${at.xi}` : `bench-${at.bench}`)
    // On a phone, leave the sheet up a moment to see him arrive, then show the next club.
    setPeek(true)
    window.clearTimeout(closing.current)
    closing.current = window.setTimeout(() => setPeek(false), 650)
  }
  const sheetUp = !!chosen || peek

  return (
    <div className="draft">
      <header className="draft-head">
        <div className="fixture">
          <p className="eyebrow">Draft · {where} 2010–now</p>
          <h1>
            {done ? (
              'Your side is picked'
            ) : (
              <>
                Round {round + 1} <span className="of">of {DRAFT_ROUNDS}</span>
              </>
            )}
          </h1>
        </div>
        <div className="draft-head-side">
          <span className="rating big team-rating" title="Team rating: the starters' overalls, less for anyone out of position">
            <small>Rating</small>
            {draftRating(draft) || '–'}
          </span>
          <button type="button" className="btn ghost" onClick={onBack}>
            Quit
          </button>
        </div>
        <div className="draft-progress" role="progressbar" aria-label="Players drafted" aria-valuemin={0} aria-valuemax={DRAFT_ROUNDS} aria-valuenow={starters + subs}>
          <span style={{ width: `${(100 * (starters + subs)) / DRAFT_ROUNDS}%` }} />
        </div>
      </header>

      <div className="draft-grid">
        <section className="card draft-offer">
          {done ? (
            <form
              className="draft-name rise"
              onSubmit={(e) => {
                e.preventDefault()
                onDone(draft, name.trim() || 'Backseat XI')
              }}
            >
              <label htmlFor="club-name">Name your side</label>
              <input id="club-name" value={name} maxLength={24} onChange={(e) => setName(e.target.value)} />
              <p className="meta">A 38-match season against 19 {where} sides from 2010 to now. No transfers: this squad is the squad. Finish in the top four to play on in the European Cup.</p>
              <button type="submit" className="btn">
                Start the season
              </button>
            </form>
          ) : (
            <Offer key={round} draft={draft} chosen={chosen} onChoose={(p) => setChosen(chosen?.id === p.id ? null : p)} />
          )}
        </section>

        <section className={`card draft-side${sheetUp ? ' up' : ''}`} aria-label="Your side">
          <button type="button" className="sheet-handle" aria-expanded={sheetUp} onClick={() => (chosen ? setChosen(null) : setPeek(!peek))}>
            <span className="grip" aria-hidden="true" />
            <span className="sheet-title">{chosen ? `Place ${surname(chosen.name)}` : 'Your side'}</span>
            <span className="sheet-count">
              {starters}/11 · {subs}/{draft.bench.length} subs
            </span>
            <span className="chev" aria-hidden="true" />
          </button>
          <div className="sheet-body">
            <div className="mini-pitch">
              {slots.map((slot, i) => {
                const p = draft.xi[i]
                const fit = chosen && !p ? fitFor(chosen, slot) : null
                return (
                  <button
                    key={`${i}-${p?.id ?? ''}`}
                    type="button"
                    className={`slot${p ? ' filled' : ''}${fit ? ' open' : ''}${fit !== null && fit < 1 ? ' off' : ''}${placed === `xi-${i}` && p ? ' placed' : ''}`}
                    style={slotStyle(slot)}
                    disabled={!fit}
                    onClick={() => put({ xi: i })}
                    title={p ? `${p.name} (${p.overall})` : fit ? `${Math.round(fit * 100)}% fit` : undefined}
                  >
                    <span className="pos">{p ? p.overall : slotLabel(slot)}</span>
                    <span className="who">{p ? surname(p.name) : fit ? `${Math.round(fit * 100)}%` : ''}</span>
                  </button>
                )
              })}
            </div>
            <div className="draft-bench">
              <span className="eyebrow">Subs</span>
              {draft.bench.map((p, i) => (
                <button
                  key={`${i}-${p?.id ?? ''}`}
                  type="button"
                  className={`slot${p ? ' filled' : ''}${chosen && !p ? ' open' : ''}${placed === `bench-${i}` && p ? ' placed' : ''}`}
                  disabled={!chosen || !!p}
                  onClick={() => put({ bench: i })}
                >
                  <span className="pos">{p ? p.overall : 'SUB'}</span>
                  <span className="who">{p ? surname(p.name) : ''}</span>
                </button>
              ))}
            </div>
            {chosen ? (
              <div className="draft-hint">
                <p className="meta">
                  Put <strong>{chosen.name}</strong> in a lit place, on the pitch or on the bench. Out of position, it shows how well he fits.
                </p>
                <button type="button" className="btn ghost slim" onClick={() => setChosen(null)}>
                  Choose someone else
                </button>
              </div>
            ) : (
              !done && <p className="meta draft-hint">Choose a player from {poolName(offer(draft).pool)}, then a place for him.</p>
            )}
          </div>
        </section>
        {sheetUp && <div className="sheet-scrim" onClick={() => (chosen ? setChosen(null) : setPeek(false))} aria-hidden="true" />}
      </div>
    </div>
  )
}

/** What each shape asks for, in a line. */
export const FORMATION_BLURB: Record<Formation, string> = {
  '4-4-2': 'Two wide midfielders, two strikers',
  '4-3-3': 'A holding midfielder, two wingers, one striker',
  '4-2-3-1': 'A holding midfielder and a box-to-box one, a No. 10 behind the striker',
  '4-1-4-1': 'One screening midfielder, a line of four, one striker',
  '3-5-2': 'Three centre-backs, wing-backs, two strikers',
  '3-4-3': 'Three centre-backs, wing-backs, a front three',
}

function PickShape({ league, onLeague, onPick, onBack }: { league: League; onLeague: (l: League) => void; onPick: (f: Formation) => void; onBack: () => void }) {
  return (
    <div className="start draft-start">
      <p className="eyebrow">Draft · {league} 2010–now</p>
      <h1>Draft a side. Try to go unbeaten.</h1>
      {LEAGUES.length > 1 && (
        <div className="segmented league-pick" role="group" aria-label="League">
          {LEAGUES.map((l) => (
            <button key={l} type="button" aria-pressed={l === league} onClick={() => onLeague(l)}>
              {l}
            </button>
          ))}
        </div>
      )}
      <p className="meta">
        {DRAFT_ROUNDS} rounds. Each one shows a club's squad from one season: pick one of its players and put him in your side, as one of eleven starters
        or {DRAFT_SUBS} substitutes. A player out of position counts for less. You can change the shape later.
      </p>
      <p className="eyebrow step">Choose a shape to start</p>
      <div className="shape-grid">
        {FORMATION_NAMES.map((f, i) => (
          <button key={f} type="button" className="shape-card rise" style={stagger(i)} onClick={() => onPick(f)}>
            <span className="shape-pitch" aria-hidden="true">
              {FORMATIONS[f].map((slot, k) => (
                <span key={k} className="dot" style={slotStyle(slot)} />
              ))}
            </span>
            <span className="shape-name">{f}</span>
            <span className="sub">{FORMATION_BLURB[f]}</span>
          </button>
        ))}
      </div>
      <button type="button" className="btn ghost back-btn" onClick={onBack}>
        Back
      </button>
    </div>
  )
}

const ROLE_ORDER = ['GK', 'CB', 'FB', 'DM', 'CM', 'WM', 'W', 'ST']

function Offer({ draft, chosen, onChoose }: { draft: DraftState; chosen: PlayerDef | null; onChoose: (p: PlayerDef) => void }) {
  const { pool, players } = offer(draft)
  const sorted = [...players].sort((a, b) => ROLE_ORDER.indexOf(a.role) - ROLE_ORDER.indexOf(b.role) || (b.overall ?? 0) - (a.overall ?? 0))
  return (
    <>
      <h2 className="offer-club deal-in">
        <Swatch kit={pool.kit} /> {poolName(pool)}
      </h2>
      <ul className="offer-list">
        {sorted.map((p, i) => (
          <li key={p.id} className="deal-in" style={stagger(i)}>
            <button type="button" className={`offer${chosen?.id === p.id ? ' chosen' : ''}`} aria-pressed={chosen?.id === p.id} onClick={() => onChoose(p)}>
              <span className="role">{positionsLabel(p)}</span>
              <span className="name">
                {p.name}
                <small className="style">{styleLabel(p)}</small>
              </span>
              <span className="rating">{p.overall}</span>
            </button>
          </li>
        ))}
      </ul>
    </>
  )
}
