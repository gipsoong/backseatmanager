import { useMemo, useState } from 'react'
import { randomTeam } from './engine/index.ts'
import { MatchViewer } from './viewer/MatchViewer.tsx'
import { Timeline } from './viewer/timeline.ts'

const randomSeed = (): number => Math.floor(Math.random() * 100_000)

export default function App() {
  const [seed, setSeed] = useState(1)
  const [draft, setDraft] = useState('1')
  const timeline = useMemo(() => new Timeline(randomTeam(seed * 2 + 1), randomTeam(seed * 2 + 2), seed), [seed])
  const [home, away] = timeline.state.teams

  const load = (s: number): void => {
    setSeed(s)
    setDraft(String(s))
  }

  return (
    <main>
      <header className="top">
        <div className="fixture">
          <p className="eyebrow">Matchday</p>
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
    </main>
  )
}
