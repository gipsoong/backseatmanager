/**
 * Runs a match through the engine a slice at a time and records every tick, so the viewer can
 * play back, pause and seek without the engine knowing anything about rendering.
 *
 * Frames are packed into one Float32Array: per tick, [ballX, ballY, ballZ, ownerIdx (-1 = none)]
 * then [x, y] for each player (NaN when off the pitch). PLAYERS_AT is where the players start.
 */
import {
  type MatchEvent,
  type MatchState,
  type TeamDef,
  type TeamStats,
  createMatch,
  formatClock,
  halfElapsed,
  step,
} from '../engine/index.ts'

const STATS_EVERY = 10
export const PLAYERS_AT = 4

export class Timeline {
  readonly state: MatchState
  readonly stride: number
  /** Number of ticks recorded so far (ticks 0 .. recorded-1). */
  recorded = 0
  done = false
  halfTimeTick: number | null = null
  private frames: Float32Array
  /** Per tick: clock ticks gone in the half (the clock also counts stoppages it didn't simulate). */
  private clock: Float64Array
  private stats: [TeamStats, TeamStats][] = []

  constructor(home: TeamDef, away: TeamDef, seed: number, fitness?: Record<string, number>) {
    this.state = createMatch(home, away, { seed, fitness })
    this.stride = PLAYERS_AT + this.state.players.length * 2
    this.frames = new Float32Array(this.stride * 70_000)
    this.clock = new Float64Array(70_000)
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
    if (s.tick >= this.clock.length) {
      const grown = new Float64Array(this.clock.length * 2)
      grown.set(this.clock)
      this.clock = grown
    }
    // The half-time whistle's tick belongs to the first half: the engine has already reset the
    // clock for the second by the time it's recorded.
    this.clock[s.tick] = s.tick === this.halfTimeTick ? (s.firstHalfElapsed ?? 0) : halfElapsed(s)
    const o = s.tick * this.stride
    const f = this.frames
    f[o] = s.ball.pos.x
    f[o + 1] = s.ball.pos.y
    f[o + 2] = s.ball.z
    f[o + 3] = s.ball.ownerIdx ?? -1
    s.players.forEach((p, i) => {
      f[o + PLAYERS_AT + i * 2] = p.onPitch ? p.pos.x : NaN
      f[o + PLAYERS_AT + 1 + i * 2] = p.onPitch ? p.pos.y : NaN
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
    return this.state.events.slice(0, this.indexAfter(tick))
  }

  /** Index of the first event with tick > `tick`. */
  indexAfter(tick: number): number {
    const ev = this.state.events
    let lo = 0
    let hi = ev.length
    while (lo < hi) {
      const mid = (lo + hi) >> 1
      if (ev[mid].tick <= tick) lo = mid + 1
      else hi = mid
    }
    return lo
  }

  scoreAt(tick: number): [number, number] {
    const score: [number, number] = [0, 0]
    for (const e of this.eventsUpTo(tick)) if (e.type === 'goal') score[e.team]++
    return score
  }

  clockAt(tick: number): string {
    const t = Math.max(0, Math.min(Math.floor(tick), this.lastTick))
    const half = this.halfTimeTick === null || t <= this.halfTimeTick ? 1 : 2
    return formatClock(half, this.clock[t], this.state.halfTicks)
  }

  statsAt(tick: number): [TeamStats, TeamStats] {
    const i = Math.min(Math.floor(tick / STATS_EVERY), this.stats.length - 1)
    return this.stats[Math.max(0, i)]
  }
}
