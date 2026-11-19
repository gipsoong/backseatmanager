/**
 * Who's on top, a few minutes at a time, for the strip above the scrubber: how deep in the other
 * half each side has had the ball (sampled), plus its shots' xG. Only bins already played are
 * measured, so the strip never gives away what's coming.
 */
import { PITCH_LENGTH, oppGoalX } from '../engine/index.ts'
import type { Timeline } from './timeline.ts'

const SAMPLE = 5
/** From this far up the pitch (as a share of its length) the ball counts as pressure. */
const DEEP = 0.6
/** A shot's xG, in sampled ticks of pressure. */
const SHOT_WEIGHT = 40

/** Home pressure less away pressure in each of `bins` equal slices of [0, total), up to `upTo`. */
export function momentum(t: Timeline, upTo: number, total: number, bins: number): number[] {
  const size = total / bins
  const done = Math.min(bins, Math.floor(upTo / size))
  const out = new Array<number>(done).fill(0)
  const players = t.state.players
  for (let b = 0; b < done; b++) {
    const from = Math.ceil(b * size)
    const to = Math.ceil((b + 1) * size)
    for (let tick = from; tick < to; tick += SAMPLE) {
      const f = t.frame(tick)
      const owner = f[3]
      if (owner < 0) continue
      const team = players[owner].team
      const depth = 1 - Math.abs(f[0] - oppGoalX(team, t.halfAt(tick))) / PITCH_LENGTH
      if (depth > DEEP) out[b] += (team === 0 ? 1 : -1) * (depth - DEEP)
    }
  }
  const events = t.eventsUpTo(done * size)
  for (const e of events) {
    if (e.type !== 'shot') continue
    const b = Math.floor(e.tick / size)
    if (b < done) out[b] += (players[e.byIdx].team === 0 ? 1 : -1) * e.xg * SHOT_WEIGHT * (DEEP / 2)
  }
  return out
}
