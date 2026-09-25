/**
 * Runs a match through the engine a slice at a time and records every tick, so the viewer can
 * play back, pause and seek without the engine knowing anything about rendering.
 *
 * Frames are packed into one Float32Array: per tick, [ballX, ballY, ownerIdx (-1 = none)] then
 * [x, y] for each player (NaN when off the pitch).
 */
import {
  type MatchEvent,
  type MatchState,
  type TeamDef,
  type TeamStats,
  createMatch,
  formatClock,
  step,
} from '../engine/index.ts'

const STATS_EVERY = 10

export class Timeline {
  readonly state: MatchState
  readonly stride: number
  /** Number of ticks recorded so far (ticks 0 .. recorded-1). */
  recorded = 0
  done = false
  halfTimeTick: number | null = null
  private frames: Float32Array
  private stats: [TeamStats, TeamStats][] = []

  constructor(home: TeamDef, away: TeamDef, seed: number) {
    this.state = createMatch(home, away, { seed })
    this.stride = 3 + this.state.players.length * 2
    this.frames = new Float32Array(this.stride * 70_000)
    this.record()
  }

  /** Simulate up to `ticks` more ticks. Returns how many were simulated. */
  advance(ticks: number): number {
    let n = 0
    while (n < ticks && !this.done) {
      const events = step(this.state)
      for (const e of events) if (e.type === 'halfTime') this.halfTimeTick = e.tick
      this.record()
      n++
      if (this.state.phase.kind === 'fullTime') this.done = true
    }
    return n
  }

  /** Simulate for roughly `ms` milliseconds of wall time. */
  advanceFor(ms: number): void {
    const until = performance.now() + ms
    while (!this.done && performance.now() < until) this.advance(50)
  }

  get lastTick(): number {
    return this.recorded - 1
  }

  private record(): void {
    const s = this.state
    const need = (s.tick + 1) * this.stride
    if (need > this.frames.length) {
      const grown = new Float32Array(this.frames.length * 2)
      grown.set(this.frames)
      this.frames = grown
    }
    const o = s.tick * this.stride
    const f = this.frames
    f[o] = s.ball.pos.x
    f[o + 1] = s.ball.pos.y
    f[o + 2] = s.ball.ownerIdx ?? -1
    s.players.forEach((p, i) => {
      f[o + 3 + i * 2] = p.onPitch ? p.pos.x : NaN
      f[o + 4 + i * 2] = p.onPitch ? p.pos.y : NaN
    })
    if (s.tick % STATS_EVERY === 0) this.stats.push(structuredClone(s.stats))
    this.recorded = s.tick + 1
  }

  /** Raw frame values for a tick (a view into the buffer; don't keep it). */
  frame(tick: number): Float32Array {
    const t = Math.max(0, Math.min(Math.floor(tick), this.lastTick))
    return this.frames.subarray(t * this.stride, (t + 1) * this.stride)
  }

  /** Events with tick <= `tick`. Events are appended in tick order, so this is a prefix. */
  eventsUpTo(tick: number): MatchEvent[] {
    const ev = this.state.events
    let lo = 0
    let hi = ev.length
    while (lo < hi) {
      const mid = (lo + hi) >> 1
      if (ev[mid].tick <= tick) lo = mid + 1
      else hi = mid
    }
    return ev.slice(0, lo)
  }

  scoreAt(tick: number): [number, number] {
    const score: [number, number] = [0, 0]
    for (const e of this.eventsUpTo(tick)) if (e.type === 'goal') score[e.team]++
    return score
  }

  clockAt(tick: number): string {
    const s = this.state
    if (this.halfTimeTick === null || tick <= this.halfTimeTick) return formatClock(1, tick, s.halfTicks)
    return formatClock(2, tick - this.halfTimeTick, s.halfTicks)
  }

  statsAt(tick: number): [TeamStats, TeamStats] {
    const i = Math.min(Math.floor(tick / STATS_EVERY), this.stats.length - 1)
    return this.stats[Math.max(0, i)]
  }
}
