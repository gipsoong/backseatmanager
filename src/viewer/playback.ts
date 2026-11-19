/**
 * Moving the playhead while the match plays. In the highlight modes, between moments we skip
 * ahead: a light scrim comes over the pitch and the match fast-forwards underneath it to the next
 * moment (the skipped play still happens; commentary and stats catch up), then the scrim lifts.
 * Longer gaps take a little longer, so play never becomes a blur. Pure: the viewer applies the
 * result (playhead, scrim opacity) to the screen.
 */
import { windowAt } from './highlights.ts'

/** Match ticks per wall-clock second at 1×. Ten ticks are one second of match time, so 1× is 3× real time. */
export const TICKS_PER_SECOND_AT_1X = 30
export const CUT_FADE_MS = 300
const CUT_ROLL_MIN_MS = 1200
const CUT_ROLL_MAX_MS = 3200
/** Skipped ticks per millisecond of skip, before the limits above. */
const CUT_TICKS_PER_MS = 2
/** How fast play runs under the scrim while the engine hasn't reached the next moment yet. */
const CUT_HOLD_TICKS_PER_S = 300
const ease = (x: number): number => (x < 0.5 ? 2 * x * x : 1 - (-2 * x + 2) ** 2 / 2)

/** A skip in progress: when it started (ms), the tick it left from, and the tick it's going to (null until known). */
export interface Cut {
  started: number
  from: number
  to: number | null
  rollMs: number
}

export interface Step {
  playhead: number
  cut: Cut | null
  /** Scrim opacity to show, 0-1. */
  cover: number
}

/**
 * One frame of playback: `dt` seconds at `rate`×. Outside a highlight window (`windows` empty in
 * full-match mode) a skip starts; it rolls on to the next window once the engine has got there
 * (`done` and `lastTick` say whether it will).
 */
export function advancePlayhead(
  playhead: number,
  cut: Cut | null,
  o: { now: number; dt: number; rate: number; skipping: boolean; windows: [number, number][]; done: boolean; lastTick: number },
): Step {
  const normal = o.dt * o.rate * TICKS_PER_SECOND_AT_1X
  if (!o.skipping) return { playhead: playhead + normal, cut: null, cover: 0 }
  let ph = playhead
  if (!cut) {
    if (windowAt(o.windows, ph).inside) return { playhead: ph + normal, cut: null, cover: 0 }
    cut = { started: o.now, from: ph, to: null, rollMs: CUT_ROLL_MIN_MS }
  } else cut = { ...cut }
  if (cut.to === null) {
    const next = windowAt(o.windows, ph).next
    cut.to = next ? next[0] : o.done ? o.lastTick : null
  }
  const e = o.now - cut.started
  if (e < CUT_FADE_MS) {
    // Scrim comes in while play carries on as normal.
    ph = Math.min(ph + normal, cut.to ?? Infinity)
    cut.from = ph
    return { playhead: ph, cut, cover: e / CUT_FADE_MS }
  }
  if (cut.to === null) {
    // The engine hasn't reached the next moment yet: keep playing on under the scrim.
    ph += o.dt * CUT_HOLD_TICKS_PER_S
    return { playhead: ph, cut: { ...cut, started: o.now - CUT_FADE_MS, from: ph }, cover: 1 }
  }
  if (e < CUT_FADE_MS + 16) cut.rollMs = Math.min(CUT_ROLL_MAX_MS, Math.max(CUT_ROLL_MIN_MS, (cut.to - cut.from) / CUT_TICKS_PER_MS))
  const roll = e - CUT_FADE_MS
  if (roll < cut.rollMs) return { playhead: cut.from + (cut.to - cut.from) * ease(roll / cut.rollMs), cut, cover: 1 }
  // Scrim lifts as the moment begins, at normal speed.
  if (roll < cut.rollMs + CUT_FADE_MS) return { playhead: Math.max(ph, cut.to) + normal, cut, cover: 1 - (roll - cut.rollMs) / CUT_FADE_MS }
  return { playhead: ph + normal, cut: null, cover: 0 }
}
