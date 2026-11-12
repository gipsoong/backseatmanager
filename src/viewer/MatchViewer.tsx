import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { CENTER, type MatchEvent, type Side, ownGoalX } from '../engine/index.ts'
import { ChangePanel } from './ChangePanel.tsx'
import { buildCommentary, matchNames } from './commentary.ts'
import {
  ANIMATION_LEAD,
  type ReplayMoment,
  type ViewMode,
  animationsAt,
  captionsAt,
  celebrationPose,
  flightAt,
  highlightWindows,
  replayMoments,
  runsAt,
} from './highlights.ts'
import { type Animation, type Camera, PITCH_ASPECT, type View, UPRIGHT_PAD, behindGoalCamera, drawFrame, fixtureKits, viewFor, wideCamera, zoomCamera } from './pitch.ts'
import { type NetState, netAt } from './net.ts'
import { Commentary, Players, Stats } from './panels.tsx'
import { playerLines } from './players.ts'
import { type Cut, advancePlayhead } from './playback.ts'
import { PLAYERS_AT, type Timeline } from './timeline.ts'

type Goal = Extract<MatchEvent, { type: 'goal' }>

const SPEEDS = [1, 2, 4] as const
/** Wall time per animation frame the engine may use to simulate ahead of playback. */
const SIM_BUDGET_MS = 6
const MODES: [ViewMode, string, string][] = [
  ['full', 'Full match', 'All'],
  ['key', 'Key moments', 'Key'],
  ['goals', 'Goals', 'Goals'],
]

/**
 * Replays of key moments (see `replayMoments`): the whole move, from each of the moment's angles
 * in turn. Rates are match ticks per wall second (the live 1× is 30): the close-up is slow motion.
 */
const ANGLE_VIEWS = [
  { name: 'Wide', short: 'Wide', rate: 22 },
  { name: 'Close-up', short: 'Close', rate: 10 },
  { name: 'Behind the goal', short: 'Goal', rate: 15 },
] as const
const ANGLE_FADE_MS = 250
/** Room the match screen needs besides an upright pitch: the header, scrubber and controls. */
const UPRIGHT_CHROME = 230

/** A phone held upright (a narrow, tall window): the pitch is drawn upright, filling the screen. */
function uprightPitch(width: number): boolean {
  return width < 600 && window.innerHeight > window.innerWidth * 1.25
}

/** Replayable moments among `events`, with teams and goal ends read from the match. */
function momentsOf(timeline: Timeline, events: MatchEvent[]): ReplayMoment[] {
  const players = timeline.state.players
  return replayMoments(
    events,
    (idx) => players[idx].team,
    (team, tick) => ownGoalX(team, timeline.halfAt(tick)),
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

type Tab = 'commentary' | 'stats' | 'players'

/**
 * `manage`: the side whose manager may make changes while watching (subs, shape, block); `onOrder`
 * hears when one is made (the match from the playhead on has changed).
 */
export function MatchViewer({ timeline, manage, onOrder, initialMode = 'full' }: { timeline: Timeline; manage?: Side; onOrder?: () => void; initialMode?: ViewMode }) {
  const [version, setVersion] = useState(timeline.version)
  const [changing, setChanging] = useState(false)
  const match = timeline.state
  const [home, away] = match.teams
  // By kit: an order gives a side a new definition (its shape), with the same kit.
  const { kits, keeperKits } = useMemo(() => fixtureKits(home.kit, away.kit), [home.kit, away.kit])

  const [playing, setPlaying] = useState(false)
  const [speed, setSpeed] = useState<(typeof SPEEDS)[number]>(1)
  const [mode, setMode] = useState<ViewMode>(initialMode)
  const [cutTo, setCutTo] = useState<string | null>(null)
  // The replay showing (its moment and which of its angles), and the tick it has reached: the
  // scorebug shows the score and clock as they were then, not as they are live.
  const [replayView, setReplayView] = useState<{ moment: ReplayMoment; angle: number } | null>(null)
  const [replayTick, setReplayTick] = useState(0)
  const replayAngle = replayView ? ANGLE_VIEWS[replayView.moment.angles[replayView.angle]].name : null
  const [viewOpts, setViewOpts] = useState(false)
  const [showRoles, setShowRoles] = useState(false)
  const [showCaptions, setShowCaptions] = useState(true)
  const [tab, setTab] = useState<Tab>('commentary')
  const [tick, setTick] = useState(0)
  const [recorded, setRecorded] = useState(timeline.recorded)

  const playhead = useRef(0)
  const replay = useRef<Replay | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const wrapRef = useRef<HTMLDivElement>(null)
  const coverRef = useRef<HTMLDivElement>(null)
  const viewRef = useRef<View>(viewFor(600, 1))
  const [upright, setUpright] = useState(false)
  // Values the animation loop reads without restarting.
  const live = useRef({ playing, speed, showRoles, showCaptions, mode })
  useEffect(() => {
    live.current = { playing, speed, showRoles, showCaptions, mode }
  }, [playing, speed, showRoles, showCaptions, mode])

  const startReplay = useCallback(
    (moment: ReplayMoment): void => {
      const f = timeline.frame(moment.tick)
      replay.current = { moment, angle: 0, playhead: moment.start, angleStarted: performance.now(), cx: f[0], cy: f[1] }
      setReplayView({ moment, angle: 0 })
      setReplayTick(moment.start)
    },
    [timeline],
  )
  const endReplay = (): void => {
    replay.current = null
    setReplayView(null)
    if (coverRef.current) coverRef.current.style.opacity = '0'
  }

  // Size the canvas to its container; everything is re-drawn at that size every frame.
  useEffect(() => {
    const wrap = wrapRef.current
    const canvas = canvasRef.current
    if (!wrap || !canvas) return
    const resize = (): void => {
      const dpr = window.devicePixelRatio || 1
      // A phone held upright gets the pitch upright too, as tall as the screen leaves room for.
      const full = wrap.parentElement?.clientWidth ?? wrap.clientWidth
      const portrait = uprightPitch(full)
      const room = window.innerHeight - UPRIGHT_CHROME
      const width = portrait ? Math.min(full, Math.max(240, (room - UPRIGHT_PAD.top - UPRIGHT_PAD.bottom) * PITCH_ASPECT)) : full
      wrap.style.width = portrait ? `${width}px` : ''
      const v = viewFor(width, dpr, portrait)
      viewRef.current = v
      setUpright(portrait)
      canvas.width = Math.round(v.width * dpr)
      canvas.height = Math.round(v.height * dpr)
      canvas.style.width = portrait ? `${v.width}px` : ''
      canvas.style.height = `${v.height}px`
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(wrap.parentElement ?? wrap)
    window.addEventListener('resize', resize)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', resize)
    }
  }, [])

  // One loop: simulate ahead, advance the playhead (or the replay), draw.
  useEffect(() => {
    playhead.current = 0
    let last = performance.now()
    let raf = 0
    let lastRecordedUpdate = 0
    let windows: [number, number][] = []
    let windowsFor = { events: -1, mode: '', version: -1 }
    let moments: ReplayMoment[] = []
    let momentsFor = { events: -1, version: -1 }
    const replayed = new Set<number>()
    // A cut in progress: when it started, where from, and where to (null until the next moment is known).
    let cut: Cut | null = null
    const cover = (opacity: number): void => {
      if (coverRef.current) coverRef.current.style.opacity = String(opacity)
    }

    const teamOf = (idx: number): 0 | 1 => timeline.state.players[idx].team
    const attacksHigh = (team: 0 | 1, tick: number): boolean =>
      ownGoalX(team, timeline.halfAt(tick)) === 0
    const draw = (ph: number, cam: Camera, roles: boolean): void => {
      const canvas = canvasRef.current
      if (!canvas) return
      const events = timeline.state.events
      const t = Math.floor(ph)
      const upTo = timeline.indexAfter(t)
      const shown = events.slice(0, upTo)
      const pending = currentGoal(shown)
      // The ball going into the net: from where it crossed the line, at the pace it crossed it.
      let net: NetState | null = null
      if (pending) {
        const prev = timeline.frame(pending.tick - 1)
        net = netAt({ ...pending.pos, z: pending.height }, { x: prev[0], y: prev[1], z: prev[2] }, (ph - pending.tick + 1) / 10 - 0.05)
      }
      const animations: Animation[] = animationsAt(events, timeline.indexAfter(t + ANIMATION_LEAD), ph)
      // The scorer's celebration, once he's got where he was running.
      const celebrating = pending
      if (celebrating) {
        const i = celebrating.scorerIdx
        const pose = celebrationPose(celebrating, ph, (tk) => {
          if (tk > timeline.lastTick) return null
          const f = timeline.frame(tk)
          return { x: f[PLAYERS_AT + i * 2], y: f[PLAYERS_AT + i * 2 + 1] }
        })
        if (pose && !animations.some((an) => an.idx === i)) animations.push(pose)
      }
      drawFrame(canvas.getContext('2d')!, viewRef.current, cam, timeline, ph, {
        kits,
        keeperKits,
        showRoles: roles,
        net,
        captions: live.current.showCaptions ? captionsAt(events, upTo, ph, attacksHigh, teamOf) : [],
        flight: pending ? null : flightAt(events, upTo),
        animations,
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
            setReplayView({ moment: rep.moment, angle: rep.angle })
          } else {
            endReplay()
          }
        }
      }
      if (replay.current) {
        const r = replay.current
        setReplayTick(Math.floor(r.playhead))
        cover(Math.max(0, 1 - (now - r.angleStarted) / ANGLE_FADE_MS))
        // Follow the ball; after a goal it's in the net (the recorded ball is already back on the spot).
        const f = timeline.frame(r.moment.kind === 'goal' ? Math.min(r.playhead, r.moment.tick - 1) : r.playhead)
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
      if (windowsFor.events !== events.length || windowsFor.mode !== view || windowsFor.version !== timeline.version) {
        windows = highlightWindows(events, view)
        windowsFor = { events: events.length, mode: view, version: timeline.version }
      }
      if (view === 'full' && cut) {
        cut = null
        cover(0)
        setCutTo(null)
      }
      if (!isPlaying && cut) cut.started += dt * 1000 // a paused skip stays where it is
      if (isPlaying) {
        const before = playhead.current
        const step = advancePlayhead(before, cut, { now, dt, rate, skipping: view !== 'full', windows, done: timeline.done, lastTick: timeline.lastTick })
        const ph = step.playhead
        cut = step.cut
        if (view !== 'full') cover(step.cover)
        setCutTo(cut ? (cut.to === null ? '' : timeline.clockAt(cut.to)) : null)
        playhead.current = Math.min(ph, timeline.lastTick)
        if (timeline.done && playhead.current >= timeline.lastTick && !cut) setPlaying(false)

        // Replay a moment once it has played out (a goal once the celebration is over).
        if (!cut) {
          if (momentsFor.events !== events.length || momentsFor.version !== timeline.version) {
            moments = momentsOf(timeline, events)
            momentsFor = { events: events.length, version: timeline.version }
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

  /** Watch the replay from another of its angles, from the start of the move. */
  const chooseAngle = (k: number): void => {
    const r = replay.current
    if (!r || k === r.angle) return
    r.angle = k
    r.playhead = r.moment.start
    r.angleStarted = performance.now()
    setReplayView({ moment: r.moment, angle: k })
  }

  const seek = (t: number): void => {
    if (replay.current) endReplay()
    playhead.current = Math.max(0, Math.min(t, timeline.lastTick))
    setTick(Math.floor(playhead.current))
  }

  // `version`: the match changed under the same timeline (an order).
  const events = useMemo(() => timeline.eventsUpTo(tick), [timeline, tick, version])
  const lines = useMemo(() => buildCommentary(match, events), [match, events])
  const playerStats = useMemo(() => (tab === 'commentary' ? null : playerLines(match, events)), [tab, match, events])
  const score = timeline.scoreAt(tick)
  const bugTick = replayView ? replayTick : tick
  const bugScore = replayView ? timeline.scoreAt(replayTick) : score
  const status = periodStatus(events)
  const pens = shootoutScore(events)
  // A second leg: the first leg's goals, from this match's sides.
  const carried = match.carried && (match.carried[0] || match.carried[1]) ? match.carried : null
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
  // Short names, with an initial where two men in the match share one.
  const names = useMemo(() => matchNames(match), [match])
  const name = (idx: number): string => names[idx]
  const finished = status === 'FT' || status === 'AET' || status === 'Pens'
  // The man of the match, once it's over: the best rating on either side.
  const motm = useMemo(() => {
    if (!finished) return null
    const all = playerLines(match, events)
    let best = -1
    all.forEach((l, i) => {
      if (l.played && (best < 0 || l.rating > all[best].rating)) best = i
    })
    return best < 0 ? null : { idx: best, rating: all[best].rating }
  }, [finished, match, events])
  const replayGoal = (m: ReplayMoment | undefined): void => {
    if (!m) return
    setChanging(false)
    startReplay(m)
    wrapRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
  }

  return (
    <div className="viewer">
      <div className="stage">
        <div className={`pitch-wrap${upright ? ' upright' : ''}`} ref={wrapRef} style={upright ? undefined : { aspectRatio: `${1 / PITCH_ASPECT}` }}>
          <canvas ref={canvasRef} aria-label={`${home.name} against ${away.name}`} />
          <div className={`cut-cover${replayAngle ? ' replay' : ''}`} ref={coverRef} aria-hidden={cutTo === null}>
            {cutTo !== null && !replayAngle && (
              <p className="cut-caption" role="status">
                <span className="cut-icon" aria-hidden="true">
                  ▸▸
                </span>
                <span className="cut-label">{mode === 'goals' ? 'Next goal' : 'Next key moment'}</span>
                {cutTo && <span className="cut-clock">{cutTo}</span>}
              </p>
            )}
          </div>
          <div className="scorebug">
            <span className="swatch" style={{ background: kits[0].shirt }} />
            <span className="abbr">{home.shortName}</span>
            <span className="score">
              {bugScore[0]}–{bugScore[1]}
              {pens && !replayView && <small className="pens"> ({pens[0]}–{pens[1]})</small>}
            </span>
            <span className="abbr">{away.shortName}</span>
            <span className="swatch" style={{ background: kits[1].shirt }} />
            <span className="clock">{replayView ? timeline.clockAt(bugTick) : (status ?? timeline.clockAt(tick))}</span>
            {carried && (
              <span className="agg" title="On aggregate, counting the first leg">
                Agg {bugScore[0] + carried[0]}–{bugScore[1] + carried[1]}
              </span>
            )}
          </div>
          {replayView && (
            <div className="replay-chip">
              <span className="replay-label">Replay</span>
              {replayView.moment.angles.length > 1 ? (
                <span className="replay-angles" role="group" aria-label="Camera">
                  {replayView.moment.angles.map((a, k) => (
                    <button type="button" key={a} aria-pressed={k === replayView.angle} onClick={() => chooseAngle(k)}>
                      <span className="label-long">{ANGLE_VIEWS[a].name}</span>
                      <span className="label-short">{ANGLE_VIEWS[a].short}</span>
                    </button>
                  ))}
                </span>
              ) : (
                <span className="replay-angle">{replayAngle}</span>
              )}
              <button type="button" className="replay-skip" onClick={endReplay}>
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
          <div className="control-row">
            <button type="button" className="play" onClick={() => (setPlaying(!playing), setChanging(false))} aria-label={playing ? 'Pause' : 'Play'}>
              {playing ? <PauseIcon /> : <PlayIcon />}
            </button>
            <div className="segmented speeds" role="group" aria-label="Playback speed">
              {SPEEDS.map((sp) => (
                <button type="button" key={sp} aria-pressed={speed === sp} onClick={() => setSpeed(sp)}>
                  {sp}×
                </button>
              ))}
            </div>
            {/* On a phone one button steps through the speeds, to keep the controls on one row. */}
            <button
              type="button"
              className="speed-step"
              aria-label={`Playback speed ${speed}×, change`}
              onClick={() => setSpeed(SPEEDS[(SPEEDS.indexOf(speed) + 1) % SPEEDS.length])}
            >
              {speed}×
            </button>
            <div className="segmented modes" role="group" aria-label="What to watch">
              {MODES.map(([m, label, short]) => (
                <button type="button" key={m} aria-pressed={mode === m} onClick={() => setMode(m)} title={label}>
                  <span className="label-long">{label}</span>
                  <span className="label-short">{short}</span>
                </button>
              ))}
            </div>
            {manage !== undefined && (
              <button
                type="button"
                className="btn ghost slim change-btn"
                aria-expanded={changing}
                onClick={() => {
                  if (changing) return setChanging(false)
                  if (replay.current) endReplay()
                  setPlaying(false)
                  setChanging(true)
                  // Below an upright pitch the panel starts off screen: bring it up.
                  if (upright) requestAnimationFrame(() => document.querySelector('.changes')?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
                }}
              >
                Change
              </button>
            )}
            <button type="button" className="view-opts-btn" aria-expanded={viewOpts} aria-label="Pitch labels" onClick={() => setViewOpts(!viewOpts)}>
              <DotsIcon />
            </button>
            <div className={`view-opts${viewOpts ? ' open' : ''}`}>
              <label className="toggle">
                <input id="show-roles" type="checkbox" checked={showRoles} onChange={(e) => setShowRoles(e.target.checked)} />
                Roles
              </label>
              <label className="toggle">
                <input id="show-captions" type="checkbox" checked={showCaptions} onChange={(e) => setShowCaptions(e.target.checked)} />
                Captions
              </label>
            </div>
          </div>
        </div>
        {changing && manage !== undefined && (
          <ChangePanel
            timeline={timeline}
            tick={tick}
            side={manage}
            onClose={() => setChanging(false)}
            onOrder={() => {
              setVersion(timeline.version)
              setRecorded(timeline.recorded)
              onOrder?.()
            }}
          />
        )}
        {(goalsSoFar.length > 0 || finished) && (
          <section className={`goal-reel${finished ? ' final' : ''}`} aria-label={finished ? 'Full-time summary' : 'Goals'}>
            {finished && (
              <header className="reel-head">
                <p className="eyebrow">{status === 'FT' ? 'Full-time' : status === 'AET' ? 'After extra time' : 'Full-time · penalties'}</p>
                <p className="reel-score">
                  <span className="swatch" style={{ background: kits[0].shirt }} /> {home.name} {score[0]}–{score[1]} {away.name}{' '}
                  <span className="swatch" style={{ background: kits[1].shirt }} />
                  {pens && <small className="pens"> ({pens[0]}–{pens[1]} on penalties)</small>}
                </p>
                {motm && (
                  <p className="meta">
                    Player of the match: {match.players[motm.idx].def.name} ({match.teams[match.players[motm.idx].team].shortName}, {motm.rating.toFixed(1)})
                  </p>
                )}
              </header>
            )}
            {goalsSoFar.length > 0 ? (
              <>
                <p className="eyebrow reel-title">{finished ? 'Goals · watch any again' : 'Goals'}</p>
                <ol className="reel">
                  {goalsSoFar.map((g) => {
                    const m = replayable.get(g.tick)
                    return (
                      <li key={g.tick}>
                        <button type="button" className="reel-goal" disabled={!m} onClick={() => replayGoal(m)} title={m ? 'Watch the replay' : 'After the live replay'}>
                          <span className="swatch" style={{ background: kits[g.team].shirt }} />
                          <span className="reel-min">{g.clock}</span>
                          <span className="reel-who">
                            {name(g.scorerIdx)}
                            {g.ownGoal ? ' (og)' : ''}
                            {g.assistIdx !== null && <small> · {name(g.assistIdx)}</small>}
                          </span>
                          <span className="reel-play" aria-hidden="true">
                            <PlayIcon /> Replay
                          </span>
                        </button>
                      </li>
                    )
                  })}
                </ol>
              </>
            ) : (
              <p className="meta reel-none">No goals to replay.</p>
            )}
          </section>
        )}
      </div>

      <aside className="panel">
        <div className="tabs" role="tablist">
          <button type="button" role="tab" aria-selected={tab === 'commentary'} onClick={() => setTab('commentary')}>
            Commentary
          </button>
          <button type="button" role="tab" aria-selected={tab === 'stats'} onClick={() => setTab('stats')}>
            Stats
          </button>
          <button type="button" role="tab" aria-selected={tab === 'players'} onClick={() => setTab('players')}>
            Players
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
        ) : tab === 'stats' ? (
          <Stats stats={timeline.statsAt(tick)} lines={playerStats} match={match} teams={[home.shortName, away.shortName]} />
        ) : (
          <Players match={match} lines={playerStats} kits={kits} keeperKits={keeperKits} />
        )}
      </aside>
    </div>
  )
}

/** The goal to show in the lower-third: from the goal until play restarts. */
function currentGoal(events: MatchEvent[]): Extract<MatchEvent, { type: 'goal' }> | null {
  for (let i = events.length - 1; i >= 0; i--) {
    const e = events[i]
    if (e.type === 'goal') return e
    if (e.type === 'restart' || e.type === 'halfTime' || e.type === 'extraTime' || e.type === 'shootout' || e.type === 'fullTime') return null
  }
  return null
}

/** "HT" between half-time and the second-half kick-off, "ET" before each half of extra time, "FT" (or "AET") at the end. */
function periodStatus(events: MatchEvent[]): string | null {
  for (let i = events.length - 1; i >= 0; i--) {
    const e = events[i]
    if (e.type === 'fullTime') return events.some((f) => f.type === 'shootout') ? 'Pens' : events.some((f) => f.type === 'extraTime') ? 'AET' : 'FT'
    if (e.type === 'halfTime') return 'HT'
    if (e.type === 'extraTime') return 'ET'
    if (e.type === 'shootout' || e.type === 'shootoutKick') return null
    if (e.type === 'restart' && e.restart === 'kickoff') return null
  }
  return null
}

/** Penalties scored by each side so far, once there's a shootout. */
function shootoutScore(events: MatchEvent[]): [number, number] | null {
  if (!events.some((e) => e.type === 'shootout')) return null
  const pens: [number, number] = [0, 0]
  for (const e of events) if (e.type === 'shootoutKick' && e.scored) pens[e.team]++
  return pens
}

function PlayIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
      <path d="M7 4.5v15l12.5-7.5z" fill="currentColor" />
    </svg>
  )
}

function DotsIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
      <circle cx="5.5" cy="12" r="1.8" fill="currentColor" />
      <circle cx="12" cy="12" r="1.8" fill="currentColor" />
      <circle cx="18.5" cy="12" r="1.8" fill="currentColor" />
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
