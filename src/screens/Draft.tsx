/**
 * The draft: pick a shape, then twenty rounds. Each offers one club-season's squad; choose one
 * and put him in an open place, a starter or one of nine substitutes. Then name the side.
 */
import { useEffect, useRef, useState } from 'react'
import { FORMATIONS, FORMATION_NAMES, fitFor, type Formation, type PlayerDef } from '../engine/index.ts'
import {
  DRAFT_ROUNDS,
  DRAFT_SUBS,
  LEAGUES,
  THEMES,
  type Draft as DraftState,
  type DraftOptions,
  type Place,
  budgetFor,
  canAfford,
  draftEyebrow,
  draftRating,
  isComplete,
  newDraft,
  RECENT_MAX,
  LINE_ROLES,
  offer,
  place,
  reroll,
  rerollProblem,
  DIFFICULTIES,
  RULES,
  isBlind,
  ruleProblem,
  twistOf,
  type Twist,
  poolName,
  priceIn,
  reserveFor,
  roundOf,
  spendable,
  themeOf,
  today,
} from '../draft/draft.ts'
import { POOLS, type League } from '../draft/pools.ts'
import { Swatch } from './Hub.tsx'
import { stagger } from './motion.ts'
import { slotLabel, slotStyle } from './pitchLayout.ts'
import { shortName as surname, styleLabel } from '../names.ts'
import { Positions } from './Positions.tsx'
import { PastRuns } from './RunGoals.tsx'
import { linksFor, linksOf } from '../draft/links.ts'

/** Club-seasons this browser was offered lately, so the next draft offers others (kept per browser; optional). */
const RECENT_KEY = 'matchday.draft.recent'
function recentPools(): string[] {
  try {
    const v: unknown = JSON.parse(localStorage.getItem(RECENT_KEY) ?? '[]')
    return Array.isArray(v) ? v.filter((k): k is string => typeof k === 'string') : []
  } catch {
    return []
  }
}
function remember(d: DraftState, pools: number[] = [...d.rounds, ...Object.values(d.twists ?? {}).flatMap((t) => (t.kind === 'pair' ? [t.other] : []))]): void {
  if (d.daily) return
  try {
    localStorage.setItem(RECENT_KEY, JSON.stringify([...recentPools(), ...pools.map((i) => poolName(POOLS[i]))].slice(-RECENT_MAX)))
  } catch {
    // No storage: drafts are just less varied.
  }
}

export function Draft({ seed, onDone, onBack }: { seed: number; onDone: (d: DraftState, name: string) => void; onBack: () => void }) {
  const [draft, setDraft] = useState<DraftState | null>(null)
  const [chosen, setChosen] = useState<PlayerDef | null>(null)
  const [name, setName] = useState('Backseat XI')
  const [league, setLeague] = useState<League>('Premier League')
  const [opts, setOpts] = useState<DraftOptions>({})
  // The place filled last, so it can settle in; and the phone's sheet held open to show it.
  const [placed, setPlaced] = useState<string | null>(null)
  const [peek, setPeek] = useState(false)
  const closing = useRef<number | undefined>(undefined)
  useEffect(() => () => window.clearTimeout(closing.current), [])

  if (!draft)
    return (
      <PickShape
        league={league}
        opts={opts}
        onLeague={(l) => {
          setLeague(l)
          setOpts({ ...opts, theme: undefined })
        }}
        onOpts={setOpts}
        onPick={(f) => {
          const d = newDraft(seed, f, league, { ...opts, twists: opts.twists !== false, daily: opts.daily ? today() : undefined, recent: recentPools() })
          remember(d)
          setDraft(d)
        }}
        onBack={onBack}
      />
    )
  const theme = themeOf(draft.theme)
  const where = theme ? `${theme.name} club-seasons from Europe's top five leagues` : `${draft.league ?? 'Premier League'} sides from 2010 to now`
  const eyebrow = draftEyebrow({ league: draft.league, theme: draft.theme, budget: draft.money !== undefined, daily: draft.daily })

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
          <p className="eyebrow">{eyebrow}</p>
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
          {draft.money !== undefined && (
            <span className="rating big team-rating money" title={`Money left of a £${budgetFor(draft)}m budget`}>
              <small>Left</small>£{draft.money}m
            </span>
          )}
          <span className="rating big team-rating links" title="Links: starters who played for the same club. A linked starter plays a little better (+1, or +2 with three links or more)">
            <small>Links</small>
            {linksOf(draft.xi).length}
          </span>
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
              <p className="meta">A 38-match season against 19 {where}. No transfers: this squad is the squad. Finish in the top four to play on in the European Cup.</p>
              <button type="submit" className="btn">
                Start the season
              </button>
            </form>
          ) : (
            <Offer
              key={`${round}-${draft.rounds[round]}`}
              draft={draft}
              chosen={chosen}
              onChoose={(p) => setChosen(chosen?.id === p.id ? null : p)}
              onReroll={() => {
                const next = reroll(draft)
                remember(next, [next.rounds[round]])
                setChosen(null)
                setDraft(next)
              }}
            />
          )}
        </section>

        <section className={`card draft-side${sheetUp ? ' up' : ''}`} aria-label="Your side">
          <button type="button" className="sheet-handle" aria-expanded={sheetUp} onClick={() => (chosen ? setChosen(null) : setPeek(!peek))}>
            <span className="grip" aria-hidden="true" />
            <span className="sheet-title">{chosen ? `Place ${surname(chosen.name)}` : 'Your side'}</span>
            <span className="sheet-count">
              {starters}/11 · {subs}/{draft.bench.length} subs<span className="sheet-links"> · {linksOf(draft.xi).length} links</span>
            </span>
            <span className="chev" aria-hidden="true" />
          </button>
          <div className="sheet-body">
            <div className="mini-pitch">
              <span className="pitch-sheen" aria-hidden="true" />
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
              !done && (
                <p className="meta draft-hint">
                  Choose a player from {offer(draft).pools.map((x) => poolName(x.pool)).join(' or ')}, then a place for him.
                  {draft.money !== undefined && (
                    <>
                      {' '}
                      Up to £{spendable(draft)}m this round{reserveFor(draft) > 0 ? `, £${reserveFor(draft)}m kept back for the ${DRAFT_ROUNDS - round - 1} places after it` : ''}.
                    </>
                  )}
                </p>
              )
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

function PickShape({
  league,
  opts,
  onLeague,
  onOpts,
  onPick,
  onBack,
}: {
  league: League
  opts: DraftOptions
  onLeague: (l: League) => void
  onOpts: (o: DraftOptions) => void
  onPick: (f: Formation) => void
  onBack: () => void
}) {
  const theme = themeOf(opts.theme)
  const budget = budgetFor({ theme: opts.theme, league })
  return (
    <div className="start draft-start">
      <p className="eyebrow">{draftEyebrow({ league, theme: opts.theme, budget: opts.budget, daily: opts.daily ? today() : undefined })}</p>
      <h1>Draft a side. Try to go unbeaten.</h1>
      <div className="draft-options">
        <p className="eyebrow step">Players from</p>
        <div className="segmented league-pick" role="group" aria-label="League">
          {LEAGUES.map((l) => (
            <button key={l} type="button" aria-pressed={!theme && l === league} onClick={() => onLeague(l)}>
              {l}
            </button>
          ))}
        </div>
        <p className="eyebrow step">Or a theme, from all five leagues</p>
        <div className="segmented league-pick" role="group" aria-label="Theme">
          {THEMES.map((t) => (
            <button key={t.id} type="button" aria-pressed={t.id === opts.theme} title={t.blurb} onClick={() => onOpts({ ...opts, theme: t.id === opts.theme ? undefined : t.id })}>
              {t.name}
            </button>
          ))}
        </div>
        {theme && <p className="meta">{theme.blurb}. Your league is drawn from the same club-seasons.</p>}
        <p className="eyebrow step">Draft</p>
        <div className="segmented league-pick" role="group" aria-label="Kind of draft">
          <button type="button" aria-pressed={!opts.budget} onClick={() => onOpts({ ...opts, budget: false })}>
            Classic
          </button>
          <button type="button" aria-pressed={!!opts.budget} onClick={() => onOpts({ ...opts, budget: true })}>
            Budget
          </button>
        </div>
        <div className="segmented league-pick" role="group" aria-label="Daily draft">
          <button type="button" aria-pressed={!!opts.daily} onClick={() => onOpts({ ...opts, daily: opts.daily ? undefined : today() })}>
            <span className="check" aria-hidden="true">{opts.daily ? '✓' : ''}</span>
            Daily draft
          </button>
          <button type="button" aria-pressed={opts.twists !== false} onClick={() => onOpts({ ...opts, twists: opts.twists === false })}>
            <span className="check" aria-hidden="true">{opts.twists !== false ? '✓' : ''}</span>
            Twists
          </button>
        </div>
        <p className="meta">
          {opts.budget
            ? `£${budget}m for all twenty. Every player has a price by his overall, from £1m; a cheap pick leaves money for a star later. Enough is always kept back to fill your squad.`
            : 'Take whoever you like from each club.'}
          {opts.twists !== false ? ' Twists: a few rounds offer two clubs, a mystery squad, one line only or a strong side, and you get two rerolls.' : ''}
          {opts.daily ? ` Daily: today's offers (${today()}) are the same for everyone who picks these options.` : ''}
        </p>
        <p className="eyebrow step">Difficulty</p>
        <div className="segmented league-pick" role="group" aria-label="Difficulty">
          {DIFFICULTIES.map((x) => (
            <button key={x.id} type="button" aria-pressed={(opts.difficulty ?? 'normal') === x.id} title={x.blurb} onClick={() => onOpts({ ...opts, difficulty: x.id })}>
              {x.name}
            </button>
          ))}
        </div>
        <p className="meta">{DIFFICULTIES.find((x) => x.id === (opts.difficulty ?? 'normal'))!.blurb}.</p>
        <p className="eyebrow step">Extra rules</p>
        <div className="segmented league-pick" role="group" aria-label="Extra rules">
          {RULES.map((x) => {
            const on = !!opts.rules?.includes(x.id)
            return (
              <button
                key={x.id}
                type="button"
                aria-pressed={on}
                title={x.blurb}
                onClick={() => onOpts({ ...opts, rules: on ? opts.rules!.filter((y) => y !== x.id) : [...(opts.rules ?? []), x.id] })}
              >
                <span className="check" aria-hidden="true">{on ? '✓' : ''}</span>
                {x.name}
              </button>
            )
          })}
        </div>
        {!!opts.rules?.length && <p className="meta">{RULES.filter((x) => opts.rules!.includes(x.id)).map((x) => x.blurb).join('. ')}.</p>}
      </div>
      <p className="meta">
        {DRAFT_ROUNDS} rounds. Each one shows a club's squad from one season: pick one of its players and put him in your side, as one of eleven starters
        or {DRAFT_SUBS} substitutes. A player out of position counts for less. Starters who played for the same club link up and
        play a little better together. You can change the shape later.
      </p>
      <p className="eyebrow step">Choose a shape to start</p>
      <div className="shape-grid">
        {FORMATION_NAMES.map((f, i) => (
          <button key={f} type="button" className="shape-card rise" style={stagger(i)} onClick={() => onPick(f)}>
            <span className="shape-pitch" aria-hidden="true">
              <span className="pitch-sheen" aria-hidden="true" />
              {FORMATIONS[f].map((slot, k) => (
                <span key={k} className="dot" style={slotStyle(slot, false)} />
              ))}
            </span>
            <span className="shape-name">{f}</span>
            <span className="sub">{FORMATION_BLURB[f]}</span>
          </button>
        ))}
      </div>
      <PastRuns />
      <button type="button" className="btn ghost back-btn" onClick={onBack}>
        Back
      </button>
    </div>
  )
}

const ROLE_ORDER = ['GK', 'CB', 'FB', 'DM', 'CM', 'WM', 'W', 'ST']

/** Whom he'd link with in your eleven so far (draft/links.ts). */
function LinkNote({ p, xi }: { p: PlayerDef; xi: (PlayerDef | null)[] }) {
  const links = linksFor(p, xi)
  if (!links.length) return null
  return (
    <span className="link-note" title={links.map((l) => `${l.with.name} (${l.club})`).join(', ')}>
      {' · '}
      {links.length === 1 ? `links with ${surname(links[0].with.name)}` : `${links.length} links`}
    </span>
  )
}

/** What a twisted round asks, in a line. */
function twistLine(t: Twist): { title: string; text: string } {
  switch (t.kind) {
    case 'pair':
      return { title: 'Two clubs', text: 'Pick from either squad this round.' }
    case 'blind':
      return { title: 'Mystery ratings', text: "Overalls are hidden until he's in your side. Go by name and style." }
    case 'line':
      return { title: `${t.line[0].toUpperCase()}${t.line.slice(1)} only`, text: `Only their ${LINE_ROLES[t.line].join(', ').replace(/, ([^,]*)$/, ' and $1')} players are on offer.` }
    case 'star':
      return { title: 'Star side', text: 'One of the strongest club-seasons left, dropped in.' }
  }
}

function Offer({ draft, chosen, onChoose, onReroll }: { draft: DraftState; chosen: PlayerDef | null; onChoose: (p: PlayerDef) => void; onReroll: () => void }) {
  const { players, pools } = offer(draft)
  const twist = twistOf(draft)
  const blind = isBlind(draft)
  const priced = draft.money !== undefined
  const noReroll = rerollProblem(draft)
  const order = (list: PlayerDef[]): PlayerDef[] =>
    [...list].sort((a, b) => ROLE_ORDER.indexOf(a.role) - ROLE_ORDER.indexOf(b.role) || (blind ? a.name.localeCompare(b.name) : (b.overall ?? 0) - (a.overall ?? 0)))
  let n = 0
  return (
    <>
      {twist && (
        <div className="twist deal-in">
          <strong>{twistLine(twist).title}</strong> {twistLine(twist).text}
        </div>
      )}
      {pools.map(({ pool, players: own }) => (
        <div key={poolName(pool)} className="offer-pool">
          <div className="offer-head">
            <h2 className="offer-club deal-in">
              <Swatch kit={pool.kit} /> {poolName(pool)}
            </h2>
            {n === 0 && draft.rerolls !== undefined && (
              <button type="button" className="btn ghost slim reroll" disabled={!!noReroll} title={noReroll ?? 'Swap this club-season for another'} onClick={onReroll}>
                Reroll <span className="reroll-left">{draft.rerolls} left</span>
              </button>
            )}
          </div>
          <ul className="offer-list">
            {order(own).map((p) => (
              <li key={p.id} className="deal-in" style={stagger(n++)}>
                <button
                  type="button"
                  className={`offer${chosen?.id === p.id ? ' chosen' : ''}${priced ? ' priced' : ''}`}
                  aria-pressed={chosen?.id === p.id}
                  disabled={!canAfford(draft, p, players) || !!ruleProblem(draft, p)}
                  title={ruleProblem(draft, p) ?? (canAfford(draft, p, players) ? undefined : `£${priceIn(draft, p, players)}m: more than you can spend this round`)}
                  onClick={() => onChoose(p)}
                >
                  <span className="role"><Positions p={p} /></span>
                  <span className="name">
                    {p.name}
                    <small className="style">
                      {styleLabel(p)}
                      <LinkNote p={p} xi={draft.xi} />
                    </small>
                  </span>
                  {priced && <span className="price">£{priceIn(draft, p, players)}m</span>}
                  <span className={`rating${blind ? ' hidden-rating' : ''}`}>{blind ? '?' : p.overall}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </>
  )
}
