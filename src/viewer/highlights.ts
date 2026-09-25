/**
 * What to show in each viewing mode, and which kick is in the air. Pure functions over the event
 * stream, so they work on whatever the timeline has simulated so far.
 */
import type { MatchEvent } from '../engine/index.ts'

export type ViewMode = 'full' | 'key' | 'goals'

/** Ticks of build-up shown before a moment, and of aftermath after it. */
const LEAD = 90
const TAIL = 40
const GOAL_TAIL = 70

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
