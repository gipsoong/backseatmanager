import { useEffect, useMemo, useRef, useState } from 'react'
import { randomTeam } from './engine/index.ts'
import { Hub } from './screens/Hub.tsx'
import { Match } from './screens/Match.tsx'
import { PickTeam } from './screens/PickTeam.tsx'
import { Start } from './screens/Start.tsx'
import { type Result, type Season, completeMatchday, createSeason, fixturesOn, resultOf, userFixture } from './season/season.ts'
import { simulate } from './season/simulate.ts'
import { loadSeason, saveSeason } from './season/store.ts'
import { MatchViewer } from './viewer/MatchViewer.tsx'
import { Timeline } from './viewer/timeline.ts'

const randomSeed = (): number => Math.floor(Math.random() * 100_000)
/** Let the browser paint (a "busy" state) before a blocking bit of work. */
const nextFrame = (): Promise<void> => new Promise((r) => requestAnimationFrame(() => setTimeout(r, 0)))

type Screen =
  | { kind: 'loading' }
  | { kind: 'start' }
  | { kind: 'pick'; season: Season }
  | { kind: 'hub' }
  | { kind: 'match'; timeline: Timeline }
  | { kind: 'friendly' }

export default function App() {
  const [season, setSeason] = useState<Season | null>(null)
  const [screen, setScreen] = useState<Screen>({ kind: 'loading' })
  const [busy, setBusy] = useState(false)
  // The rest of the matchday, playing in the background while the manager watches his match.
  const others = useRef<Promise<Map<number, Result>> | null>(null)

  useEffect(() => {
    loadSeason()
      .then((s) => setSeason(s))
      .catch(() => setSeason(null))
      .finally(() => setScreen({ kind: 'start' }))
  }, [])

  const commit = async (s: Season): Promise<void> => {
    setSeason(s)
    await saveSeason(s).catch(() => undefined) // a private window may refuse storage; play on regardless
  }

  const watch = (s: Season): void => {
    const f = userFixture(s, s.matchday)!
    others.current = simulate(s, fixturesOn(s, s.matchday).filter((g) => g.id !== f.id))
    setScreen({ kind: 'match', timeline: new Timeline(s.teams[f.home], s.teams[f.away], f.seed) })
  }

  const finishWatched = async (s: Season, timeline: Timeline): Promise<void> => {
    setBusy(true)
    await nextFrame()
    while (!timeline.done) timeline.advance(5000)
    const results = await (others.current ?? Promise.resolve(new Map<number, Result>()))
    results.set(userFixture(s, s.matchday)!.id, resultOf(timeline.state))
    await commit(completeMatchday(s, results))
    others.current = null
    setBusy(false)
    setScreen({ kind: 'hub' })
  }

  const simulateMatchday = async (s: Season): Promise<void> => {
    setBusy(true)
    await commit(completeMatchday(s, await simulate(s, fixturesOn(s, s.matchday))))
    setBusy(false)
  }

  const newSeason = (): void => setScreen({ kind: 'pick', season: createSeason(randomSeed(), 0) })

  return (
    <main>
      {screen.kind === 'loading' && <p className="meta">Loading…</p>}
      {screen.kind === 'start' && (
        <Start saved={season} onContinue={() => setScreen({ kind: 'hub' })} onNew={newSeason} onFriendly={() => setScreen({ kind: 'friendly' })} />
      )}
      {screen.kind === 'pick' && (
        <PickTeam
          teams={screen.season.teams}
          onBack={() => setScreen({ kind: 'start' })}
          onPick={(i) => {
            void commit({ ...screen.season, userTeam: i })
            setScreen({ kind: 'hub' })
          }}
        />
      )}
      {screen.kind === 'hub' && season && (
        <Hub season={season} busy={busy} onWatch={() => watch(season)} onSimulate={() => void simulateMatchday(season)} onNewSeason={newSeason} />
      )}
      {screen.kind === 'match' && season && (
        <Match season={season} timeline={screen.timeline} busy={busy} onDone={() => void finishWatched(season, screen.timeline)} />
      )}
      {screen.kind === 'friendly' && <Friendly onBack={() => setScreen({ kind: 'start' })} />}
    </main>
  )
}

/** A one-off match between two random sides, by number, for when there's no season to play. */
function Friendly({ onBack }: { onBack: () => void }) {
  const [seed, setSeed] = useState(1)
  const [draft, setDraft] = useState('1')
  const timeline = useMemo(() => new Timeline(randomTeam(seed * 2 + 1), randomTeam(seed * 2 + 2), seed), [seed])
  const [home, away] = timeline.state.teams

  const load = (s: number): void => {
    setSeed(s)
    setDraft(String(s))
  }

  return (
    <>
      <header className="top">
        <div className="fixture">
          <p className="eyebrow">Friendly</p>
          <h1>
            {home.name} <span className="v">v</span> {away.name}
          </h1>
          <p className="meta">
            {home.formation}, {home.block} block · {away.formation}, {away.block} block
          </p>
        </div>
        <form
          className="picker"
          onSubmit={(e) => {
            e.preventDefault()
            const n = Number(draft)
            if (Number.isInteger(n) && n >= 0) load(n)
          }}
        >
          <button type="button" className="ghost" onClick={onBack}>
            Back
          </button>
          <label htmlFor="seed">Match no.</label>
          <input id="seed" inputMode="numeric" value={draft} onChange={(e) => setDraft(e.target.value)} />
          <button type="submit" className="ghost">
            Load
          </button>
          <button type="button" onClick={() => load(randomSeed())}>
            New match
          </button>
        </form>
      </header>
      <MatchViewer key={seed} timeline={timeline} />
    </>
  )
}
