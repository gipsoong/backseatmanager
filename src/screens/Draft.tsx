/**
 * The draft: pick a shape, then sixteen rounds. Each offers one club-decade's players; choose one
 * and put him in an open place, a starter or one of five substitutes. Then name the side.
 */
import { useState } from 'react'
import { FORMATIONS, fitFor, type Formation, type PlayerDef, type Slot } from '../engine/index.ts'
import { DRAFT_ROUNDS, type Draft as DraftState, type Place, draftRating, isComplete, newDraft, offer, place, poolName, roundOf } from '../draft/draft.ts'
import { Swatch } from './Hub.tsx'

/** A place's usual name: which side a full-back or wide man plays on, facing up the pitch. */
function slotLabel(slot: Slot): string {
  const side = slot.y > 40 ? 'R' : slot.y < 28 ? 'L' : ''
  if (slot.role === 'FB') return `${side}B`
  if (slot.role === 'WM') return `${side}M`
  if (slot.role === 'W') return `${side}W`
  return slot.role
}

/** Where a place sits on the little pitch: attack at the top, your right on the right. */
function slotStyle(slot: Slot): React.CSSProperties {
  const top = slot.role === 'GK' ? 90 : 72 - slot.depth * 57
  return { top: `${top}%`, left: `${(slot.y / 68) * 100}%` }
}

const surname = (name: string): string => name.split(' ').slice(-1)[0]

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

function PickShape({ onPick, onBack }: { onPick: (f: Formation) => void; onBack: () => void }) {
  return (
    <div className="start">
      <p className="eyebrow">Draft · Premier League 2010–now</p>
      <h1>Draft a side. Try to go unbeaten.</h1>
      <p className="meta">
        Sixteen rounds. Each one shows a club from one decade: pick one of its players and put him in your side, as one of eleven starters or five
        substitutes. A player out of position counts for less.
      </p>
      <div className="start-actions">
        {(['4-3-3', '4-4-2'] as const).map((f) => (
          <button key={f} type="button" className="btn big" onClick={() => onPick(f)}>
            <span>{f}</span>
            <span className="sub">{f === '4-3-3' ? 'A holding midfielder, two wingers, one striker' : 'Two wide midfielders, two strikers'}</span>
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
