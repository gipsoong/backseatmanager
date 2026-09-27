/**
 * The draft: pick a shape, then sixteen rounds. Each offers one club-decade's players; choose one
 * and put him in an open place, a starter or one of nine substitutes. Then name the side.
 */
import { useState } from 'react'
import { FORMATIONS, FORMATION_NAMES, fitFor, type Formation, type PlayerDef } from '../engine/index.ts'
import { DRAFT_ROUNDS, DRAFT_SUBS, type Draft as DraftState, type Place, draftRating, isComplete, newDraft, offer, place, poolName, roundOf } from '../draft/draft.ts'
import { Swatch } from './Hub.tsx'
import { slotLabel, slotStyle } from './pitchLayout.ts'
import { shortName as surname } from '../names.ts'

export function Draft({ seed, onDone, onBack }: { seed: number; onDone: (d: DraftState, name: string) => void; onBack: () => void }) {
  const [draft, setDraft] = useState<DraftState | null>(null)
  const [chosen, setChosen] = useState<PlayerDef | null>(null)
  const [name, setName] = useState('Backseat XI')

  if (!draft) return <PickShape onPick={(f) => setDraft(newDraft(seed, f))} onBack={onBack} />

  const slots = FORMATIONS[draft.formation]
  const done = isComplete(draft)
  const round = roundOf(draft)
  const put = (at: Place): void => {
    if (!chosen) return
    setDraft(place(draft, chosen, at))
    setChosen(null)
  }

  return (
    <div className="draft">
      <header className="top">
        <div className="fixture">
          <p className="eyebrow">Draft · Premier League 2010–now</p>
          <h1>{done ? 'Your side is picked' : `Round ${round + 1} of ${DRAFT_ROUNDS}`}</h1>
          <p className="meta">
            {draft.formation} · starters {draft.xi.filter(Boolean).length}/11 · subs {draft.bench.filter(Boolean).length}/{draft.bench.length}
          </p>
        </div>
        <div className="actions">
          <span className="rating big" title="Team rating: the starters' overalls, less for anyone out of position">
            {draftRating(draft) || '–'}
          </span>
          <button type="button" className="btn ghost" onClick={onBack}>
            Quit
          </button>
        </div>
      </header>

      <div className="draft-grid">
        <section className="card draft-offer">
          {done ? (
            <form
              className="draft-name"
              onSubmit={(e) => {
                e.preventDefault()
                onDone(draft, name.trim() || 'Backseat XI')
              }}
            >
              <label htmlFor="club-name">Name your side</label>
              <input id="club-name" value={name} maxLength={24} onChange={(e) => setName(e.target.value)} />
              <p className="meta">A 38-match season against 19 Premier League sides from 2010 to now. No transfers: this squad is the squad.</p>
              <button type="submit" className="btn">
                Start the season
              </button>
            </form>
          ) : (
            <Offer
              draft={draft}
              chosen={chosen}
              onChoose={(p) => {
                setChosen(p)
                // On a phone the pitch is below the list: bring it up to put him in place.
                document.querySelector('.draft-side')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
              }}
            />
          )}
        </section>

        <section className="card draft-side">
          <div className="mini-pitch">
            {slots.map((slot, i) => {
              const p = draft.xi[i]
              const fit = chosen && !p ? fitFor(chosen, slot.role) : null
              return (
                <button
                  key={i}
                  type="button"
                  className={`slot${p ? ' filled' : ''}${fit ? ' open' : ''}${fit !== null && fit < 1 ? ' off' : ''}`}
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
              <button key={i} type="button" className={`slot${p ? ' filled' : ''}${chosen && !p ? ' open' : ''}`} disabled={!chosen || !!p} onClick={() => put({ bench: i })}>
                <span className="pos">{p ? p.overall : 'SUB'}</span>
                <span className="who">{p ? surname(p.name) : ''}</span>
              </button>
            ))}
          </div>
          {chosen && <p className="meta draft-hint">Put {chosen.name} in an open place: on the pitch or on the bench.</p>}
        </section>
      </div>
    </div>
  )
}

/** What each shape asks for, in a line. */
export const FORMATION_BLURB: Record<Formation, string> = {
  '4-4-2': 'Two wide midfielders, two strikers',
  '4-3-3': 'A holding midfielder, two wingers, one striker',
  '4-2-3-1': 'Two holding midfielders, a No. 10 behind the striker',
  '4-1-4-1': 'One screening midfielder, a line of four, one striker',
  '3-5-2': 'Three centre-backs, wing-backs, two strikers',
  '3-4-3': 'Three centre-backs, wing-backs, a front three',
}

function PickShape({ onPick, onBack }: { onPick: (f: Formation) => void; onBack: () => void }) {
  return (
    <div className="start">
      <p className="eyebrow">Draft · Premier League 2010–now</p>
      <h1>Draft a side. Try to go unbeaten.</h1>
      <p className="meta">
        {DRAFT_ROUNDS} rounds. Each one shows a club from one decade: pick one of its players and put him in your side, as one of eleven starters
        or {DRAFT_SUBS} substitutes. A player out of position counts for less. You can change the shape later.
      </p>
      <div className="start-actions">
        {FORMATION_NAMES.map((f) => (
          <button key={f} type="button" className="btn big" onClick={() => onPick(f)}>
            <span>{f}</span>
            <span className="sub">{FORMATION_BLURB[f]}</span>
          </button>
        ))}
        <button type="button" className="btn big ghost" onClick={onBack}>
          <span>Back</span>
        </button>
      </div>
    </div>
  )
}

const ROLE_ORDER = ['GK', 'CB', 'FB', 'DM', 'CM', 'WM', 'W', 'ST']

function Offer({ draft, chosen, onChoose }: { draft: DraftState; chosen: PlayerDef | null; onChoose: (p: PlayerDef) => void }) {
  const { pool, players } = offer(draft)
  const sorted = [...players].sort((a, b) => ROLE_ORDER.indexOf(a.role) - ROLE_ORDER.indexOf(b.role) || (b.overall ?? 0) - (a.overall ?? 0))
  return (
    <>
      <h2 className="offer-club">
        <Swatch kit={pool.kit} /> {poolName(pool)}
      </h2>
      <ul className="offer-list">
        {sorted.map((p) => (
          <li key={p.id}>
            <button type="button" className={`offer${chosen?.id === p.id ? ' chosen' : ''}`} aria-pressed={chosen?.id === p.id} onClick={() => onChoose(p)}>
              <span className="role">{p.role}</span>
              <span className="name">{p.name}</span>
              <span className="rating">{p.overall}</span>
            </button>
          </li>
        ))}
      </ul>
    </>
  )
}
