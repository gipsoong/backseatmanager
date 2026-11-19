/**
 * Plays fixtures in the background and hands back their results, on a pool of workers (each match
 * is about a second of simulation on a desktop core, several on a phone).
 *
 * A match is a pure function of its sides, seed, fitness and tie, so results are kept by those
 * inputs: `prefetch` starts the day's matches while the manager is still on the hub, and the
 * results are used only if nothing about the match has changed by the time he plays it (a new
 * eleven, say, is a different match and is played afresh). Nothing about a result depends on
 * where or when it was played.
 */
import { type Fixture, type Result, type Season, fitnessFor, fixturesOn, matchTeam } from './season.ts'
import { cupFixturesToday, cupMatches, isCupDay } from '../draft/cup.ts'
import { domesticCupMatches, isDomesticCupDay } from '../career/cup.ts'
import type { SimRequest } from './simWorker.ts'

type Match = Omit<SimRequest, 'fitness'>

export function simulate(season: Season, fixtures: Fixture[], opts: { foreground?: boolean } = {}): Promise<Map<number, Result>> {
  return simulateMatches(
    fixtures.map((f) => ({ id: f.id, home: matchTeam(season, f.home), away: matchTeam(season, f.away), seed: f.seed })),
    fitnessFor(season),
    opts,
  )
}

/** The matches of the season's current day (league or cup), as the hub would play them. */
export function todaysMatches(s: Season): Match[] {
  if (isCupDay(s)) return cupMatches(s, cupFixturesToday(s))
  if (isDomesticCupDay(s)) return domesticCupMatches(s)
  return fixturesOn(s, s.matchday).map((f) => ({ id: f.id, home: matchTeam(s, f.home), away: matchTeam(s, f.away), seed: f.seed }))
}

/**
 * Start playing the current day's matches in the background (nothing is waiting on them yet), so
 * that "Just the result", or the rest of the day while he watches his own, is ready sooner.
 */
export function prefetch(s: Season): void {
  try {
    const fitness = fitnessFor(s)
    const keys = new Set<string>()
    for (const m of todaysMatches(s)) keys.add(play(m, fitness, false, true).key)
    // A head start nobody will want any more (his old eleven, before a swap) is dropped if it hasn't begun.
    for (let i = queue.length - 1; i >= 0; i--) {
      const job = queue[i]
      if (job.guess && !keys.has(job.key)) {
        queue.splice(i, 1)
        known.delete(job.key)
        job.reject(new Error('superseded'))
      }
    }
  } catch {
    // Only ever a head start: if anything about today can't be worked out, play it when asked.
  }
}

/**
 * Plays any set of matches (league or cup) and hands back their results by id. `foreground`: the
 * manager is waiting on them with nothing else running, so every worker may be used.
 */
export function simulateMatches(fixtures: Match[], fitness: Record<string, number>, opts: { foreground?: boolean } = {}): Promise<Map<number, Result>> {
  const foreground = opts.foreground ?? false
  return Promise.all(fixtures.map((f) => play(f, fitness, foreground, false).result.then((r) => [f.id, r] as const))).then((rs) => new Map(rs))
}

// ---------------------------------------------------------------------------
// Results by inputs

/** Results (or matches under way) by their inputs; the oldest go once there are more than this. */
const KEEP = 80
const known = new Map<string, Promise<Result>>()

/** A match's result, from what's known or played now. `guess`: only a prefetch has asked for it. */
function play(m: Match, fitness: Record<string, number>, foreground: boolean, guess: boolean): { key: string; result: Promise<Result> } {
  const req: SimRequest = { id: 0, home: m.home, away: m.away, seed: m.seed, fitness: fitnessOf(m, fitness), ...(m.knockout ? { knockout: m.knockout } : {}) }
  const key = keyOf(req)
  let p = known.get(key)
  if (p) {
    if (!guess) wanted(key, foreground)
  } else {
    p = new Promise<Result>((resolve, reject) => enqueue({ key, req, resolve, reject, foreground, guess }))
    known.set(key, p)
    p.catch(() => known.delete(key))
    while (known.size > KEEP) known.delete(known.keys().next().value!)
  }
  // Each caller gets its own copy: the season code is free to do what it likes with a result.
  const result = p.then((r) => structuredClone(r))
  if (guess) result.catch(() => undefined)
  return { key, result }
}

/** Fitness of just this match's players: all the engine reads (a missing one plays fresh, as before). */
function fitnessOf(m: Match, fitness: Record<string, number>): Record<string, number> {
  const out: Record<string, number> = {}
  for (const t of [m.home, m.away]) {
    for (const p of [...t.players, ...t.bench]) {
      const id = String(p.id)
      if (Object.prototype.hasOwnProperty.call(fitness, id)) out[id] = fitness[id]
    }
  }
  return out
}

/** Everything the match is played from, as text. Undefined and non-finite numbers kept apart from null. */
function keyOf(r: SimRequest): string {
  return JSON.stringify([r.home, r.away, r.seed, r.fitness, r.knockout ?? null], (_k, v: unknown) =>
    v === undefined ? '\u0000undefined' : typeof v === 'number' && !Number.isFinite(v) ? `\u0000${v}` : v,
  )
}

// ---------------------------------------------------------------------------
// The pool

interface Job {
  key: string
  req: SimRequest
  resolve: (r: Result) => void
  reject: (e: Error) => void
  foreground: boolean
  /** Only a prefetch wants it so far. */
  guess: boolean
}
interface Slot {
  worker: Worker
  job: Job | null
}

const cores = (): number => (typeof navigator !== 'undefined' && navigator.hardwareConcurrency) || 2
/** Workers at most: one a core (the page waits with nothing else to do), up to eight. */
const poolSize = (): number => Math.max(1, Math.min(8, cores()))
/** Background matches leave a core for the page (a match being watched, the hub's animations). */
const backgroundLimit = (): number => Math.max(1, Math.min(poolSize(), cores() - 1))
/** Idle workers are let go after this long (ms). */
const IDLE = 180_000

const queue: Job[] = []
const slots: Slot[] = []
let nextId = 1
let idleTimer: ReturnType<typeof setTimeout> | null = null

function enqueue(job: Job): void {
  // Waited-on matches go ahead of background ones, otherwise in the order asked for.
  const before = job.foreground ? queue.findIndex((j) => !j.foreground) : -1
  if (before >= 0) queue.splice(before, 0, job)
  else queue.push(job)
  pump()
}

/**
 * A match a prefetch started is now asked for: no longer a guess; and if he's waiting on it, to the
 * front of the queue, with room for it on every core.
 */
function wanted(key: string, foreground: boolean): void {
  const i = queue.findIndex((j) => j.key === key)
  if (i >= 0) {
    const job = queue[i]
    job.guess = false
    if (foreground && !job.foreground) {
      queue.splice(i, 1)
      job.foreground = true
      enqueue(job)
      return
    }
  }
  for (const s of slots) if (s.job?.key === key && foreground) s.job.foreground = true
  pump()
}

function pump(): void {
  if (idleTimer) {
    clearTimeout(idleTimer)
    idleTimer = null
  }
  while (queue.length > 0) {
    const busy = slots.filter((s) => s.job).length
    const job = queue[0]
    const anyForeground = job.foreground || slots.some((s) => s.job?.foreground)
    if (busy >= (anyForeground ? poolSize() : backgroundLimit())) break
    let slot = slots.find((s) => !s.job)
    if (!slot) {
      if (slots.length >= poolSize()) break
      slot = spawn()
    }
    queue.shift()
    slot.job = job
    slot.worker.postMessage({ ...job.req, id: nextId++ })
  }
  if (queue.length === 0 && slots.every((s) => !s.job) && slots.length > 0) {
    idleTimer = setTimeout(() => {
      for (const s of slots.splice(0)) s.worker.terminate()
    }, IDLE)
  }
}

function spawn(): Slot {
  const slot: Slot = { worker: new Worker(new URL('./simWorker.ts', import.meta.url), { type: 'module' }), job: null }
  slot.worker.onmessage = (e: MessageEvent<{ id: number; result: Result }>) => {
    const job = slot.job
    slot.job = null
    job?.resolve(e.data.result)
    pump()
  }
  slot.worker.onerror = (e) => {
    e.preventDefault()
    const job = slot.job
    slot.job = null
    slot.worker.terminate()
    slots.splice(slots.indexOf(slot), 1)
    job?.reject(new Error(e.message || 'match worker failed'))
    pump()
  }
  slots.push(slot)
  return slot
}
