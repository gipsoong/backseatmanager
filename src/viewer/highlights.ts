/**
 * What to show in each viewing mode, and which kick is in the air. Pure functions over the event
 * stream, so they work on whatever the timeline has simulated so far.
 */
import type { MatchEvent } from '../engine/index.ts'

export type ViewMode = 'full' | 'key' | 'goals'

/** Ticks of build-up shown before a moment, and of aftermath after it. */
const LEAD = 90
const TAIL = 40
const GOAL_TAIL = 90

/** Is this event one the mode wants to show? */
function isMoment(e: MatchEvent, mode: ViewMode): boolean {
  if (mode === 'full') return false
  const penalty = (e.type === 'foul' && e.award === 'penalty') || (e.type === 'shot' && e.penalty)
  if (e.type === 'goal' || penalty) return true
  if (mode === 'goals') return false
  return (e.type === 'shot' && e.onTarget) || e.type === 'woodwork' || (e.type === 'card' && e.color === 'red')
}

/** Sorted, non-overlapping [start, end] tick windows the mode plays at normal speed. */
export function highlightWindows(events: MatchEvent[], mode: ViewMode): [number, number][] {
  const out: [number, number][] = []
  for (const e of events) {
    if (!isMoment(e, mode)) continue
    const start = Math.max(0, e.tick - LEAD)
    const end = e.tick + (e.type === 'goal' ? GOAL_TAIL : TAIL)
    const last = out[out.length - 1]
    if (last && start <= last[1]) last[1] = Math.max(last[1], end)
    else out.push([start, end])
  }
  return out
}

/** The window containing `tick`, or the next one after it. */
export function windowAt(windows: [number, number][], tick: number): { inside: boolean; next: [number, number] | null } {
  for (const w of windows) {
    if (tick < w[0]) return { inside: false, next: w }
    if (tick <= w[1]) return { inside: true, next: w }
  }
  return { inside: false, next: null }
}

type Kick = Extract<MatchEvent, { type: 'pass' | 'shot' | 'clearance' }>

/** Events that end a kick's flight: someone touches it, it goes dead, or play stops. */
const endsFlight = (e: MatchEvent): boolean =>
  e.type === 'possession' ||
  e.type === 'deflection' ||
  e.type === 'offside' ||
  e.type === 'goal' ||
  e.type === 'out' ||
  e.type === 'woodwork' ||
  e.type === 'halfTime' ||
  e.type === 'fullTime'

/**
 * The most recent kick at or before the events prefix `upTo` (index just past the last event
 * <= the playhead), and the tick its flight ended: null if it hasn't ended in what's been
 * simulated so far. The caller decides how long a finished flight stays visible.
 */
export function flightAt(events: MatchEvent[], upTo: number): { kick: Kick; end: number | null } | null {
  let i = upTo - 1
  while (i >= 0 && !isKick(events[i])) i--
  if (i < 0) return null
  const kick = events[i] as Kick
  for (let j = i + 1; j < events.length; j++) {
    // A header is a touch and a kick in the same tick; either ends this flight.
    if (endsFlight(events[j]) || isKick(events[j])) return { kick, end: events[j].tick }
  }
  return { kick, end: null }
}

const isKick = (e: MatchEvent): e is Kick => e.type === 'pass' || e.type === 'shot' || e.type === 'clearance'

/** Ticks before the contact that a slide or dive starts: the body goes before the ball arrives. */
export const ANIMATION_LEAD = 3

/**
 * Slides and dives happening around `playhead`: who, towards where, and how far through (0..1).
 * `upTo` is the index just past the last event at or before `playhead + ANIMATION_LEAD`, so a
 * dive can start a moment before the keeper gets to the ball.
 */
export function animationsAt(
  events: MatchEvent[],
  upTo: number,
  playhead: number,
): { kind: 'slide' | 'dive'; idx: number; toward: { x: number; y: number; z: number }; age: number }[] {
  const SLIDE_TICKS = 10
  const DIVE_TICKS = 13
  const out: ReturnType<typeof animationsAt> = []
  for (let i = upTo - 1; i >= 0; i--) {
    const e = events[i]
    if (playhead - e.tick > DIVE_TICKS) break
    const since = playhead - e.tick + ANIMATION_LEAD
    if (since < 0) continue
    if ((e.type === 'tackle' || e.type === 'foul') && e.style === 'slide' && since < SLIDE_TICKS) {
      out.push({ kind: 'slide', idx: e.byIdx, toward: { ...e.pos, z: 0 }, age: since / SLIDE_TICKS })
    }
    const save = (e.type === 'possession' && e.via === 'save') || (e.type === 'deflection' && e.kind === 'parry')
    if (save && e.dive && since < DIVE_TICKS) {
      out.push({ kind: 'dive', idx: e.idx, toward: { ...e.contact, z: e.height }, age: since / DIVE_TICKS })
    }
  }
  return out
}

// ---------------------------------------------------------------------------
// Replays

export type ReplayKind = 'goal' | 'penalty' | 'redCard' | 'chance' | 'tackle'

/** Camera angles, in order: 0 wide, 1 close-up, 2 behind the goal. */
export type Angle = 0 | 1 | 2

export interface ReplayMoment {
  kind: ReplayKind
  /** Tick of the moment itself (the goal, the foul, the shot, the tackle). */
  tick: number
  /** Where the replay starts: when the team that made the move won the ball, within limits. */
  start: number
  end: number
  angles: Angle[]
  /** When the automatic replay plays: after a goal's celebration, soon after anything else. */
  autoAt: number
  /** The goal the camera behind the goal looks into, for angle 2. */
  goalX: number | null
}

/** Build-up shown before a moment: at least this much... */
const MIN_BUILD_UP = 50
/** ...and at most this much (15 match seconds). */
const MAX_BUILD_UP = 150

/**
 * The tick a move began: walking back from the moment, the point where `team` last won the ball
 * (a possession or restart of theirs straight after the other side had it), clamped to limits.
 */
export function moveStart(events: MatchEvent[], index: number, team: 0 | 1, teamOf: (idx: number) => 0 | 1): number {
  const tick = events[index].tick
  let start = tick - MIN_BUILD_UP
  for (let i = index - 1; i >= 0; i--) {
    const e = events[i]
    if (tick - e.tick > MAX_BUILD_UP) return tick - MAX_BUILD_UP
    const theirs =
      (e.type === 'possession' && teamOf(e.idx) !== team) ||
      (e.type === 'restart' && e.team !== team) ||
      (e.type === 'tackle' && e.won && teamOf(e.byIdx) !== team)
    if (theirs) break
    if ((e.type === 'possession' && teamOf(e.idx) === team) || (e.type === 'restart' && e.team === team)) start = e.tick
    if (e.type === 'halfTime') break
  }
  return Math.min(start, tick - MIN_BUILD_UP)
}

/** Every moment worth a replay, in order, with how to show it. */
export function replayMoments(events: MatchEvent[], teamOf: (idx: number) => 0 | 1, ownGoalXOf: (team: 0 | 1, tick: number) => number): ReplayMoment[] {
  const out: ReplayMoment[] = []
  const add = (i: number, kind: ReplayKind, team: 0 | 1, after: number, angles: Angle[], autoDelay: number, goalX: number | null): void => {
    const tick = events[i].tick
    out.push({ kind, tick, start: moveStart(events, i, team, teamOf), end: tick + after, angles, autoAt: tick + autoDelay, goalX })
  }
  for (let i = 0; i < events.length; i++) {
    const e = events[i]
    if (e.type === 'goal') {
      add(i, 'goal', e.team, 12, [0, 1, 2], 75, e.pos.x < 1 ? 0 : 105)
    } else if (e.type === 'foul' && e.award === 'penalty') {
      add(i, 'penalty', teamOf(e.onIdx), 15, [0, 1], 25, null)
    } else if (e.type === 'card' && e.color === 'red') {
      const foul = events.slice(Math.max(0, i - 3), i).reverse().find((f) => f.type === 'foul')
      if (foul?.type === 'foul') add(i, 'redCard', teamOf(foul.onIdx), 15, [0, 1], 25, null)
    } else if ((e.type === 'shot' && !e.penalty && e.onTarget && e.xg >= 0.15) || e.type === 'woodwork') {
      // A chance that didn't go in: a goal shortly after is replayed as the goal instead.
      const team = e.type === 'shot' ? teamOf(e.byIdx) : e.byIdx === null ? null : teamOf(e.byIdx)
      const scored = events.slice(i + 1).find((g) => g.tick > e.tick + 30 || g.type === 'goal')
      if (team === null || scored?.type === 'goal') continue
      if (out.length && out[out.length - 1].kind === 'chance' && e.tick - out[out.length - 1].tick < 40) continue
      add(i, 'chance', team, 20, [0], 30, ownGoalXOf((1 - team) as 0 | 1, e.tick))
    } else if (e.type === 'tackle' && e.won && e.style === 'slide') {
      // A last-ditch slide in his own box.
      const tackler = teamOf(e.byIdx)
      const goalX = ownGoalXOf(tackler, e.tick)
      if (Math.abs(e.pos.x - goalX) <= 16.5 && Math.abs(e.pos.y - 34) <= 20.16) add(i, 'tackle', teamOf(e.onIdx), 15, [0], 25, null)
    }
  }
  return out
}
