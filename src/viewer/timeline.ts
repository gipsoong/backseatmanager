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
  type Order,
  type TeamDef,
  type TeamStats,
  type TimedOrder,
  cloneMatch,
  createMatch,
  giveOrder,
  orderProblem,
  formatClock,
  halfElapsed,
  step,
} from '../engine/index.ts'

const STATS_EVERY = 10
/** A copy of the match is kept this often (ticks), to play on from with new orders. */
const CHECKPOINT_EVERY = 500
export const PLAYERS_AT = 4

export class Timeline {
  /** The match as simulated so far (replaced when an order sends it down a new path). */
  state: MatchState
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
  /** Copies of the match every CHECKPOINT_EVERY ticks, oldest first. */
  private checkpoints: MatchState[] = []
  /** Every order given, in tick order: the match is `runMatch` with these as `config.orders`. */
  orders: TimedOrder[] = []
  /** Wall time (ms) the last order took to go back and play on to its tick. */
  lastOrderMs = 0
  /** Bumped by every order: views keyed on it know the match beyond the playhead changed. */
  version = 0

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

  /**
   * Gives an order as the match stands at `tick` (the playhead), between that tick and the next.
   * The match from there on is played afresh: back to the last copy at or before `tick`, on to
   * `tick` exactly as before (the same frames, the same events), then the order, then on as the
   * viewer asks. Orders given earlier for later ticks (after scrubbing back) are dropped, as that
   * future is gone. The match is then `runMatch` with `orders` as `config.orders`.
   * Returns why it can't be given then (changing nothing), or null.
   */
  order(tick: number, order: Order): string | null {
    const t0 = performance.now()
    const at = this.stateAt(tick)
    const problem = orderProblem(at, order)
    if (problem) return problem
    this.orders = [...this.orders.filter((o) => o.tick <= at.tick), { tick: at.tick, order }]
    this.rewind(at)
    giveOrder(this.state, order)
    this.lastOrderMs = performance.now() - t0
    this.version++
    return null
  }

  /**
   * The match as it stands at `tick` (after it, with the orders given then), as a copy to look at
   * or to play on from: the last copy at or before it, played on to it.
   */
  stateAt(tick: number): MatchState {
    const t = Math.max(0, Math.min(Math.floor(tick), this.lastTick))
    if (t === this.state.tick) return cloneMatch(this.state)
    const cp = [...this.checkpoints].reverse().find((c) => c.tick <= t)!
    const s = cloneMatch(cp)
    s.orders = this.orders.filter((o) => o.tick >= cp.tick && o.tick < t)
    while (s.tick < t) step(s)
    for (const o of this.orders) if (o.tick === t) giveOrder(s, o.order)
    return s
  }

  /** Plays on from `s`, a copy of the match at a recorded tick: everything recorded after it is forgotten. */
  private rewind(s: MatchState): void {
    this.state = s
    this.recorded = s.tick + 1
    this.done = false
    // Copies up to this tick still hold (one at it was taken before any order given at it).
    this.checkpoints = this.checkpoints.filter((c) => c.tick <= s.tick)
    this.stats.length = Math.floor(s.tick / STATS_EVERY) + 1
    for (const w of [...this.whistleTicks]) if (w > s.tick) this.whistleTicks.delete(w)
    if (this.halfTimeTick !== null && this.halfTimeTick > s.tick) this.halfTimeTick = null
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
    if (s.tick % CHECKPOINT_EVERY === 0) this.checkpoints.push(cloneMatch(s))
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
