import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { CENTER, type MatchEvent, type TeamStats, ownGoalX } from '../engine/index.ts'
import { type Line, buildCommentary, surname } from './commentary.ts'
import {
  ANIMATION_LEAD,
  type ReplayMoment,
  type ViewMode,
  animationsAt,
  flightAt,
  highlightWindows,
  replayMoments,
  runsAt,
  windowAt,
} from './highlights.ts'
import { type Camera, PITCH_ASPECT, type View, behindGoalCamera, drawFrame, fixtureKits, viewFor, wideCamera, zoomCamera } from './pitch.ts'
import { PLAYERS_AT, type Timeline } from './timeline.ts'

type Goal = Extract<MatchEvent, { type: 'goal' }>

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

/**
 * Replays of key moments (see `replayMoments`): the whole move, from each of the moment's angles
 * in turn. Rates are match ticks per wall second (the live 1× is 30): the close-up is slow motion.
 */
const ANGLE_VIEWS = [
  { name: 'Wide', rate: 22 },
  { name: 'Close-up', rate: 10 },
  { name: 'Behind the goal', rate: 15 },
] as const
const ANGLE_FADE_MS = 250

/** Replayable moments among `events`, with teams and goal ends read from the match. */
function momentsOf(timeline: Timeline, events: MatchEvent[]): ReplayMoment[] {
  const players = timeline.state.players
  return replayMoments(
    events,
    (idx) => players[idx].team,
    (team, tick) => ownGoalX(team, timeline.halfTimeTick !== null && tick > timeline.halfTimeTick ? 2 : 1),
  )
}

interface Replay {
  moment: ReplayMoment
  /** Index into moment.angles. */
  angle: number
  playhead: number
  angleStarted: number
  /** Close-up camera centre, eased towards the action. */
  cx: number
  cy: number
}

type Tab = 'commentary' | 'stats'

export function MatchViewer({ timeline }: { timeline: Timeline }) {
  const match = timeline.state
  const [home, away] = match.teams
  const { kits, keeperKits } = useMemo(() => fixtureKits(home.kit, away.kit), [home, away])

  const [playing, setPlaying] = useState(false)
  const [speed, setSpeed] = useState<(typeof SPEEDS)[number]>(1)
  const [mode, setMode] = useState<ViewMode>('full')
  const [cutTo, setCutTo] = useState<string | null>(null)
  const [replayAngle, setReplayAngle] = useState<string | null>(null)
  const [showRoles, setShowRoles] = useState(false)
  const [tab, setTab] = useState<Tab>('commentary')
  const [tick, setTick] = useState(0)
  const [recorded, setRecorded] = useState(timeline.recorded)

  const playhead = useRef(0)
  const replay = useRef<Replay | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const wrapRef = useRef<HTMLDivElement>(null)
  const coverRef = useRef<HTMLDivElement>(null)
  const viewRef = useRef<View>(viewFor(600, 1))
  // Values the animation loop reads without restarting.
  const live = useRef({ playing, speed, showRoles, mode })
  useEffect(() => {
    live.current = { playing, speed, showRoles, mode }
  }, [playing, speed, showRoles, mode])

  const startReplay = useCallback(
    (moment: ReplayMoment): void => {
      const f = timeline.frame(moment.tick)
      replay.current = { moment, angle: 0, playhead: moment.start, angleStarted: performance.now(), cx: f[0], cy: f[1] }
      setReplayAngle(ANGLE_VIEWS[moment.angles[0]].name)
    },
    [timeline],
  )
  const endReplay = (): void => {
    replay.current = null
    setReplayAngle(null)
    if (coverRef.current) coverRef.current.style.opacity = '0'
  }

  // Size the canvas to its container; everything is re-drawn at that size every frame.
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
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(wrap)
    return () => ro.disconnect()
  }, [])

  // One loop: simulate ahead, advance the playhead (or the replay), draw.
  useEffect(() => {
    playhead.current = 0
    let last = performance.now()
    let raf = 0
    let lastRecordedUpdate = 0
    let windows: [number, number][] = []
    let windowsFor = { events: -1, mode: '' }
    let moments: ReplayMoment[] = []
    let momentsFor = -1
    const replayed = new Set<number>()
    // A cut in progress: when it started, where from, and where to (null until the next moment is known).
    let cut: { started: number; from: number; to: number | null } | null = null
    const cover = (opacity: number): void => {
      if (coverRef.current) coverRef.current.style.opacity = String(opacity)
    }

    const draw = (ph: number, cam: Camera, roles: boolean): void => {
      const canvas = canvasRef.current
      if (!canvas) return
      const events = timeline.state.events
      const t = Math.floor(ph)
      const upTo = timeline.indexAfter(t)
      const shown = events.slice(0, upTo)
      const goal = lastGoalBefore(shown)
      const age = goal ? (ph - goal.tick) / RIPPLE_TICKS : 1
      const pending = currentGoal(shown)
      drawFrame(canvas.getContext('2d')!, viewRef.current, cam, timeline, ph, {
        kits,
        keeperKits,
        showRoles: roles,
        ripple: goal && age < 1 ? { x: goal.pos.x, y: goal.pos.y, age } : null,
        ballInNet: pending ? pending.pos : null,
        flight: pending ? null : flightAt(events, upTo),
        animations: animationsAt(events, timeline.indexAfter(t + ANIMATION_LEAD), ph),
        runs: runsAt(events, upTo, ph).map((r) => {
          const end = timeline.frame(Math.min(r.until, timeline.lastTick))
          return {
            idx: r.idx,
            to: { x: end[PLAYERS_AT + r.idx * 2], y: end[PLAYERS_AT + r.idx * 2 + 1] },
            progress: (ph - r.start) / (r.until - r.start),
          }
        }),
      })
    }

    const loop = (now: number): void => {
      const dt = Math.min(0.1, (now - last) / 1000)
      last = now
      if (!timeline.done) timeline.advanceFor(SIM_BUDGET_MS)
      const { playing: isPlaying, speed: rate, showRoles: roles, mode: view } = live.current
      const v = viewRef.current

      // A replay holds the live match where it is and plays the move from each angle in turn.
      const rep = replay.current
      if (rep) {
        rep.playhead += dt * ANGLE_VIEWS[rep.moment.angles[rep.angle]].rate
        if (rep.playhead >= rep.moment.end) {
          if (rep.angle < rep.moment.angles.length - 1) {
            rep.angle++
            rep.playhead = rep.moment.start
            rep.angleStarted = now
            setReplayAngle(ANGLE_VIEWS[rep.moment.angles[rep.angle]].name)
          } else {
            endReplay()
          }
        }
      }
      if (replay.current) {
        const r = replay.current
        cover(Math.max(0, 1 - (now - r.angleStarted) / ANGLE_FADE_MS))
        const f = timeline.frame(r.playhead)
        const angle = r.moment.angles[r.angle]
        const goalX = r.moment.goalX ?? f[0]
        // The close-up follows the ball (leaning towards the goal, for a goal).
        const k = Math.min(1, dt * 4)
        const lean = r.moment.goalX === null ? 0 : 0.35
        r.cx += (f[0] * (1 - lean) + goalX * lean - r.cx) * k
        r.cy += (f[1] * (1 - lean) + CENTER.y * lean - r.cy) * k
        const cam =
          angle === 0 ? wideCamera(v) : angle === 1 ? zoomCamera(v, r.cx, r.cy, 2.6) : behindGoalCamera(v, r.moment.goalX ?? 0)
        draw(r.playhead, cam, false)
        raf = requestAnimationFrame(loop)
        return
      }

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
        const before = playhead.current
        let ph = before
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

        // Replay a moment once it has played out (a goal once the celebration is over).
        if (!cut) {
          if (momentsFor !== events.length) {
            moments = momentsOf(timeline, events)
            momentsFor = events.length
          }
          const due = moments.find((m) => !replayed.has(m.tick) && before < m.autoAt && playhead.current >= m.autoAt)
          if (due) {
            replayed.add(due.tick)
            startReplay(due)
          }
        }
      }

      const t = Math.floor(playhead.current)
      setTick((prev) => (prev === t ? prev : t))
      if (now - lastRecordedUpdate > 250 || timeline.done) {
        lastRecordedUpdate = now
        setRecorded(timeline.recorded)
      }
      draw(playhead.current, wideCamera(v), roles)
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [timeline, kits, keeperKits, startReplay])

  const seek = (t: number): void => {
    if (replay.current) endReplay()
    playhead.current = Math.max(0, Math.min(t, timeline.lastTick))
    setTick(Math.floor(playhead.current))
  }

  const events = useMemo(() => timeline.eventsUpTo(tick), [timeline, tick])
  const lines = useMemo(() => buildCommentary(match, events), [match, events])
  const score = timeline.scoreAt(tick)
  const status = periodStatus(events)
  const goalStrip = currentGoal(events)
  // Only goals already seen: marking future ones on the scrubber would give the result away.
  const goalsSoFar = events.filter((e): e is Goal => e.type === 'goal')
  // Moments that can be replayed from the commentary, by the tick of their line.
  const replayable = useMemo(() => {
    const byTick = new Map<number, ReplayMoment>()
    for (const m of momentsOf(timeline, events)) if (m.end <= tick) byTick.set(m.tick, m)
    return byTick
  }, [timeline, events, tick])
  // Rough full length so the scrubber doesn't jump around while the rest simulates.
  const total = timeline.done ? timeline.lastTick : Math.max(recorded, Math.round(match.halfTicks * 2 * 0.68))
  const name = (idx: number): string => surname(match.players[idx].def.name)

  return (
    <div className="viewer">
      <div className="stage">
        <div className="pitch-wrap" ref={wrapRef} style={{ aspectRatio: `${1 / PITCH_ASPECT}` }}>
          <canvas ref={canvasRef} aria-label={`${home.name} against ${away.name}`} />
          <div className="cut-cover" ref={coverRef} aria-hidden={cutTo === null}>
            {cutTo !== null && !replayAngle && (
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
          {replayAngle && (
            <div className="replay-chip">
              <span className="replay-label">Replay</span>
              <span>{replayAngle}</span>
              <button type="button" onClick={endReplay}>
                Skip
              </button>
            </div>
          )}
          {goalStrip && !replayAngle && (
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
            {SPEEDS.map((sp) => (
              <button type="button" key={sp} aria-pressed={speed === sp} onClick={() => setSpeed(sp)}>
                {sp}×
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
            replayable={replayable}
            onReplay={(l) => {
              const m = replayable.get(l.tick)
              if (m) startReplay(m)
            }}
          />
        ) : (
          <Stats stats={timeline.statsAt(tick)} teams={[home.shortName, away.shortName]} />
        )}
      </aside>
    </div>
  )
}

function Commentary({
  lines,
  kits,
  onPick,
  replayable,
  onReplay,
}: {
  lines: Line[]
  kits: { shirt: string }[]
  onPick: (l: Line) => void
  replayable: Map<number, ReplayMoment>
  onReplay: (l: Line) => void
}) {
  if (lines.length === 0) return <p className="empty">Press play for kick-off.</p>
  return (
    <ol className="commentary">
      {[...lines].reverse().map((l) => (
        <li key={`${l.tick}-${l.text}`} className={`line ${l.kind}`}>
          <button type="button" className="line-main" onClick={() => onPick(l)} title="Watch from here">
            <span className="min">{l.clock}</span>
            <span className="dot" style={{ background: l.team === null ? 'transparent' : kits[l.team].shirt }} />
            <span className="text">{l.text}</span>
          </button>
          {replayable.has(l.tick) && (l.kind === 'goal' || l.kind === 'chance' || l.kind === 'card') && (
            <button type="button" className="line-replay" onClick={() => onReplay(l)}>
              Replay
            </button>
          )}
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
