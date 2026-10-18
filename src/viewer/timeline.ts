/**
 * Runs a match through the engine a slice at a time and records every tick, so the viewer can
 * play back, pause and seek without the engine knowing anything about rendering.
 *
 * Frames are packed into one Float32Array: per tick, [ballX, ballY, ballZ, ownerIdx (-1 = none)]
 * then [x, y] for each player (NaN when off the pitch). PLAYERS_AT is where the players start.
 */
import {
  type MatchConfig,
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
  /** Per tick: clock ticks gone in the period (the clock also counts stoppages it didn't simulate). */
  private clock: Float64Array
  /** Per tick: the period (1-4, 5 for penalties) and which way round the teams are playing. */
  private period: Uint8Array
  private halves: Uint8Array
  /** Ticks of a whistle ending a period: they belong to the period just ended. */
  private whistleTicks = new Set<number>()
  private stats: [TeamStats, TeamStats][] = []

  constructor(home: TeamDef, away: TeamDef, seed: number, fitness?: Record<string, number>, knockout?: MatchConfig['knockout']) {
    this.state = createMatch(home, away, { seed, fitness, knockout })
    this.stride = PLAYERS_AT + this.state.players.length * 2
    this.frames = new Float32Array(this.stride * 70_000)
    this.clock = new Float64Array(70_000)
    this.period = new Uint8Array(70_000)
    this.halves = new Uint8Array(70_000)
    this.record()
  }

  /** Simulate up to `ticks` more ticks. Returns how many were simulated. */
  advance(ticks: number): number {
    let n = 0
    while (n < ticks && !this.done) {
      const events = step(this.state)
      for (const e of events) {
        if (e.type === 'halfTime') this.halfTimeTick = e.tick
        if (e.type === 'halfTime' || e.type === 'extraTime' || e.type === 'shootout') this.whistleTicks.add(e.tick)
      }
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
      const grow = <T extends Float64Array | Uint8Array>(a: T): T => {
        const grown = new (a.constructor as new (n: number) => T)(a.length * 2)
        grown.set(a)
        return grown
      }
      this.clock = grow(this.clock)
      this.period = grow(this.period)
      this.halves = grow(this.halves)
    }
    // A whistle's tick belongs to the period it ends: the engine has already reset the clock for
    // the next by the time it's recorded.
    const whistle = this.whistleTicks.has(s.tick)
    const period = s.shootout ? 5 : s.period
    this.period[s.tick] = whistle ? (s.shootout ? s.period : s.period - 1) : period
    this.clock[s.tick] = whistle ? (s.shootout ? halfElapsed(s) : (s.prevPeriodElapsed ?? 0)) : halfElapsed(s)
    this.halves[s.tick] = s.half
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
    const period = this.period[t]
    return period === 5 ? 'Pens' : formatClock(period, this.clock[t], this.state.halfTicks)
  }

  /** Which way round the teams were playing at a tick (for ownGoalX and the like). */
  halfAt(tick: number): 1 | 2 {
    const t = Math.max(0, Math.min(Math.floor(tick), this.lastTick))
    return this.halves[t] === 2 ? 2 : 1
  }

  statsAt(tick: number): [TeamStats, TeamStats] {
    const i = Math.min(Math.floor(tick / STATS_EVERY), this.stats.length - 1)
    return this.stats[Math.max(0, i)]
  }
}
