import { useEffect, useMemo, useRef, useState } from 'react'
import type { MatchEvent, TeamStats } from '../engine/index.ts'
import { type Line, buildCommentary, surname } from './commentary.ts'
import { type ViewMode, flightAt, highlightWindows, windowAt } from './highlights.ts'
import { PITCH_ASPECT, drawFrame, drawPitch, fixtureKits, viewFor } from './pitch.ts'
import type { Timeline } from './timeline.ts'

/** Match ticks per wall-clock second at 1×. Ten ticks are one second of match time, so 1× is 3× real time. */
const TICKS_PER_SECOND_AT_1X = 30
const SPEEDS = [1, 2, 4] as const
/** Wall time per animation frame the engine may use to simulate ahead of playback. */
const SIM_BUDGET_MS = 6
/** Ticks the net keeps moving after a goal. */
const RIPPLE_TICKS = 18
/**
 * Between highlights we cut, like a TV highlights package: fade to the grass, roll the clock on
 * to the next moment (the skipped play still happens; commentary and stats catch up), fade in.
 */
const CUT_FADE_MS = 350
const CUT_ROLL_MS = 900
const ease = (x: number): number => (x < 0.5 ? 2 * x * x : 1 - (-2 * x + 2) ** 2 / 2)
const MODES: [ViewMode, string][] = [
  ['full', 'Full match'],
  ['key', 'Key moments'],
  ['goals', 'Goals'],
]

type Tab = 'commentary' | 'stats'

export function MatchViewer({ timeline }: { timeline: Timeline }) {
  const match = timeline.state
  const [home, away] = match.teams
  const { kits, keeperKits } = useMemo(() => fixtureKits(home.kit, away.kit), [home, away])

  const [playing, setPlaying] = useState(false)
  const [speed, setSpeed] = useState<(typeof SPEEDS)[number]>(1)
  const [mode, setMode] = useState<ViewMode>('full')
  const [cutTo, setCutTo] = useState<string | null>(null)
  const [showRoles, setShowRoles] = useState(false)
  const [tab, setTab] = useState<Tab>('commentary')
  const [tick, setTick] = useState(0)
  const [recorded, setRecorded] = useState(timeline.recorded)

  const playhead = useRef(0)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const wrapRef = useRef<HTMLDivElement>(null)
  const pitchCache = useRef<HTMLCanvasElement | null>(null)
  const coverRef = useRef<HTMLDivElement>(null)
  const viewRef = useRef(viewFor(600, 1))
  // Values the animation loop reads without restarting.
  const live = useRef({ playing, speed, showRoles, mode })
  useEffect(() => {
    live.current = { playing, speed, showRoles, mode }
  }, [playing, speed, showRoles, mode])

  // Size the canvas to its container and redraw the pitch at that size.
  useEffect(() => {
    const wrap = wrapRef.current
    const canvas = canvasRef.current
    if (!wrap || !canvas) return
    const resize = (): void => {
      const dpr = window.devicePixelRatio || 1
      const v = viewFor(wrap.clientWidth, dpr)
      viewRef.current = v
      canvas.width = Math.round(v.width * dpr)
      canvas.height = Math.round(v.height * dpr)
      canvas.style.height = `${v.height}px`
      const pitch = document.createElement('canvas')
      pitch.width = canvas.width
      pitch.height = canvas.height
      drawPitch(pitch.getContext('2d')!, v)
      pitchCache.current = pitch
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(wrap)
    return () => ro.disconnect()
  }, [])

  // One loop: simulate ahead, advance the playhead, draw.
  useEffect(() => {
    playhead.current = 0
    let last = performance.now()
    let raf = 0
    let lastRecordedUpdate = 0
    let windows: [number, number][] = []
    let windowsFor = { events: -1, mode: '' }
    // A cut in progress: when it started, where from, and where to (null until the next moment is known).
    let cut: { started: number; from: number; to: number | null } | null = null
    const cover = (opacity: number): void => {
      if (coverRef.current) coverRef.current.style.opacity = String(opacity)
    }
    const loop = (now: number): void => {
      const dt = Math.min(0.1, (now - last) / 1000)
      last = now
      if (!timeline.done) timeline.advanceFor(SIM_BUDGET_MS)
      const { playing: isPlaying, speed: rate, showRoles: roles, mode: view } = live.current
      const events = timeline.state.events
      if (windowsFor.events !== events.length || windowsFor.mode !== view) {
        windows = highlightWindows(events, view)
        windowsFor = { events: events.length, mode: view }
      }

      if (view === 'full' && cut) {
        cut = null
        cover(0)
        setCutTo(null)
      }
      if (!isPlaying && cut) cut.started += dt * 1000 // a paused cut stays where it is
      if (isPlaying) {
        let ph = playhead.current
        if (!cut && view !== 'full' && !windowAt(windows, ph).inside) {
          cut = { started: now, from: ph, to: null }
          setCutTo('')
        }
        if (cut) {
          if (cut.to === null) {
            const next = windowAt(windows, cut.from).next
            cut.to = next ? next[0] : timeline.done ? timeline.lastTick : null
            if (cut.to !== null) setCutTo(timeline.clockAt(cut.to))
          }
          const e = now - cut.started
          if (e < CUT_FADE_MS) {
            cover(e / CUT_FADE_MS)
          } else if (cut.to === null) {
            cut.started = now - CUT_FADE_MS // hold on the cover until the engine reaches the next moment
            cover(1)
          } else if (e < CUT_FADE_MS + CUT_ROLL_MS) {
            cover(1)
            ph = cut.from + (cut.to - cut.from) * ease((e - CUT_FADE_MS) / CUT_ROLL_MS)
          } else if (e < 2 * CUT_FADE_MS + CUT_ROLL_MS) {
            ph = cut.to
            cover(1 - (e - CUT_FADE_MS - CUT_ROLL_MS) / CUT_FADE_MS)
          } else {
            ph = cut.to
            cut = null
            cover(0)
            setCutTo(null)
          }
        } else {
          ph += dt * rate * TICKS_PER_SECOND_AT_1X
        }
        playhead.current = Math.min(ph, timeline.lastTick)
        if (timeline.done && playhead.current >= timeline.lastTick && !cut) setPlaying(false)
      }

      const t = Math.floor(playhead.current)
      setTick((prev) => (prev === t ? prev : t))
      if (now - lastRecordedUpdate > 250 || timeline.done) {
        lastRecordedUpdate = now
        setRecorded(timeline.recorded)
      }
      const canvas = canvasRef.current
      const pitch = pitchCache.current
      if (canvas && pitch) {
        const upTo = timeline.eventsUpTo(t)
        const goal = lastGoalBefore(upTo)
        const age = goal ? (playhead.current - goal.tick) / RIPPLE_TICKS : 1
        const pending = currentGoal(upTo)
        drawFrame(canvas.getContext('2d')!, viewRef.current, pitch, timeline, playhead.current, {
          kits,
          keeperKits,
          showRoles: roles,
          ripple: goal && age < 1 ? { x: goal.pos.x, y: goal.pos.y, age } : null,
          ballInNet: pending ? pending.pos : null,
          flight: pending ? null : flightAt(events, upTo.length),
        })
      }
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [timeline, kits, keeperKits])

  const seek = (t: number): void => {
    playhead.current = Math.max(0, Math.min(t, timeline.lastTick))
    setTick(Math.floor(playhead.current))
  }

  const events = useMemo(() => timeline.eventsUpTo(tick), [timeline, tick])
  const lines = useMemo(() => buildCommentary(match, events), [match, events])
  const score = timeline.scoreAt(tick)
  const status = periodStatus(events)
  const goalStrip = currentGoal(events)
  // Only goals already seen: marking future ones on the scrubber would give the result away.
  const goalsSoFar = events.filter((e): e is Extract<MatchEvent, { type: 'goal' }> => e.type === 'goal')
  // Rough full length so the scrubber doesn't jump around while the rest simulates.
  const total = timeline.done ? timeline.lastTick : Math.max(recorded, match.halfTicks * 2 + 3000)
  const name = (idx: number): string => surname(match.players[idx].def.name)

  return (
    <div className="viewer">
      <div className="stage">
        <div className="pitch-wrap" ref={wrapRef} style={{ aspectRatio: `${1 / PITCH_ASPECT}` }}>
          <canvas ref={canvasRef} aria-label={`${home.name} against ${away.name}`} />
          <div className="cut-cover" ref={coverRef} aria-hidden={cutTo === null}>
            {cutTo !== null && (
              <p className="cut-caption">
                {cutTo && <span className="cut-clock">{cutTo}</span>}
                <span className="cut-label">{mode === 'goals' ? 'Goals' : 'Key moments'}</span>
              </p>
            )}
          </div>
          <div className="scorebug">
            <span className="swatch" style={{ background: kits[0].shirt }} />
            <span className="abbr">{home.shortName}</span>
            <span className="score">
              {score[0]}–{score[1]}
            </span>
            <span className="abbr">{away.shortName}</span>
            <span className="swatch" style={{ background: kits[1].shirt }} />
            <span className="clock">{status ?? timeline.clockAt(tick)}</span>
          </div>
          {goalStrip && (
            <div className="goal-strip" key={goalStrip.tick}>
              <span className="swatch" style={{ background: kits[goalStrip.team].shirt }} />
              <span className="label">Goal</span>
              <span className="who">
                {name(goalStrip.scorerIdx)}
                {goalStrip.ownGoal ? ' (og)' : ''}
              </span>
              <span className="when">{goalStrip.clock}</span>
              {goalStrip.assistIdx !== null && <span className="assist">Assist {name(goalStrip.assistIdx)}</span>}
            </div>
          )}
        </div>

        <div className="controls">
          <button type="button" className="play" onClick={() => setPlaying(!playing)} aria-label={playing ? 'Pause' : 'Play'}>
            {playing ? <PauseIcon /> : <PlayIcon />}
          </button>
          <div className="segmented" role="group" aria-label="Playback speed">
            {SPEEDS.map((s) => (
              <button type="button" key={s} aria-pressed={speed === s} onClick={() => setSpeed(s)}>
                {s}×
              </button>
            ))}
          </div>
          <div className="segmented modes" role="group" aria-label="What to watch">
            {MODES.map(([m, label]) => (
              <button type="button" key={m} aria-pressed={mode === m} onClick={() => setMode(m)}>
                {label}
              </button>
            ))}
          </div>
          <label className="toggle">
            <input id="show-roles" type="checkbox" checked={showRoles} onChange={(e) => setShowRoles(e.target.checked)} />
            Roles
          </label>
          <div className="scrubber">
            <input
              id="scrubber"
              type="range"
              min={0}
              max={total}
              value={tick}
              aria-label="Match time"
              style={{
                ['--played-at' as string]: `${(100 * tick) / total}%`,
                ['--buffered-at' as string]: `${(100 * recorded) / total}%`,
              }}
              onChange={(e) => seek(Number(e.target.value))}
            />
            {goalsSoFar.map((g) => (
              <span key={g.tick} className="marker" style={{ left: `${(100 * g.tick) / total}%`, background: kits[g.team].shirt }} />
            ))}
          </div>
        </div>
      </div>

      <aside className="panel">
        <div className="tabs" role="tablist">
          <button type="button" role="tab" aria-selected={tab === 'commentary'} onClick={() => setTab('commentary')}>
            Commentary
          </button>
          <button type="button" role="tab" aria-selected={tab === 'stats'} onClick={() => setTab('stats')}>
            Stats
          </button>
        </div>
        {tab === 'commentary' ? (
          <Commentary
            lines={lines}
            kits={kits}
            onPick={(l) => {
              seek(l.kind === 'goal' || l.kind === 'chance' ? l.tick - 60 : l.tick)
              setPlaying(true)
            }}
          />
        ) : (
          <Stats stats={timeline.statsAt(tick)} teams={[home.shortName, away.shortName]} />
        )}
      </aside>
    </div>
  )
}

function Commentary({ lines, kits, onPick }: { lines: Line[]; kits: { shirt: string }[]; onPick: (l: Line) => void }) {
  if (lines.length === 0) return <p className="empty">Press play for kick-off.</p>
  return (
    <ol className="commentary">
      {[...lines].reverse().map((l) => (
        <li key={`${l.tick}-${l.text}`} className={`line ${l.kind}`}>
          <button type="button" onClick={() => onPick(l)} title="Watch from here">
            <span className="min">{l.clock}</span>
            <span className="dot" style={{ background: l.team === null ? 'transparent' : kits[l.team].shirt }} />
            <span className="text">{l.text}</span>
          </button>
        </li>
      ))}
    </ol>
  )
}

function Stats({ stats, teams }: { stats: [TeamStats, TeamStats]; teams: [string, string] }) {
  const [h, a] = stats
  const poss = Math.round((100 * h.possessionTicks) / (h.possessionTicks + a.possessionTicks || 1))
  const pct = (s: TeamStats): string => (s.passes ? `${Math.round((100 * s.passesCompleted) / s.passes)}%` : '–')
  const rows: [string, string | number, string | number, number, number][] = [
    ['Possession', `${poss}%`, `${100 - poss}%`, poss, 100 - poss],
    ['Shots', h.shots, a.shots, h.shots, a.shots],
    ['On target', h.shotsOnTarget, a.shotsOnTarget, h.shotsOnTarget, a.shotsOnTarget],
    ['Expected goals', h.xg.toFixed(2), a.xg.toFixed(2), h.xg, a.xg],
    ['Passes', h.passes, a.passes, h.passes, a.passes],
    ['Pass accuracy', pct(h), pct(a), h.passesCompleted / (h.passes || 1), a.passesCompleted / (a.passes || 1)],
    ['Corners', h.corners, a.corners, h.corners, a.corners],
    ['Fouls', h.fouls, a.fouls, h.fouls, a.fouls],
    ['Offsides', h.offsides, a.offsides, h.offsides, a.offsides],
    ['Yellow cards', h.yellowCards, a.yellowCards, h.yellowCards, a.yellowCards],
    ['Red cards', h.redCards, a.redCards, h.redCards, a.redCards],
  ]
  return (
    <div className="stats">
      <div className="stats-head">
        <span>{teams[0]}</span>
        <span>{teams[1]}</span>
      </div>
      {rows.map(([label, x, y, nx, ny]) => {
        const share = nx + ny > 0 ? nx / (nx + ny) : 0.5
        return (
          <div className="stat" key={label}>
            <span className="val">{x}</span>
            <span className="name">{label}</span>
            <span className="val">{y}</span>
            <span className="bar" aria-hidden="true">
              <span style={{ width: `${share * 100}%` }} />
            </span>
          </div>
        )
      })}
    </div>
  )
}

function lastGoalBefore(events: MatchEvent[]): Extract<MatchEvent, { type: 'goal' }> | null {
  for (let i = events.length - 1; i >= 0; i--) {
    const e = events[i]
    if (e.type === 'goal') return e
  }
  return null
}

/** The goal to show in the lower-third: from the goal until play restarts. */
function currentGoal(events: MatchEvent[]): Extract<MatchEvent, { type: 'goal' }> | null {
  for (let i = events.length - 1; i >= 0; i--) {
    const e = events[i]
    if (e.type === 'goal') return e
    if (e.type === 'restart' || e.type === 'halfTime' || e.type === 'fullTime') return null
  }
  return null
}

/** "HT" between half-time and the second-half kick-off, "FT" at the end. */
function periodStatus(events: MatchEvent[]): string | null {
  for (let i = events.length - 1; i >= 0; i--) {
    const e = events[i]
    if (e.type === 'fullTime') return 'FT'
    if (e.type === 'halfTime') return 'HT'
    if (e.type === 'restart' && e.restart === 'kickoff') return null
  }
  return null
}

function PlayIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
      <path d="M7 4.5v15l12.5-7.5z" fill="currentColor" />
    </svg>
  )
}

function PauseIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
      <path d="M6.5 4.5h4v15h-4zM13.5 4.5h4v15h-4z" fill="currentColor" />
    </svg>
  )
}
