/**
 * Plays a set of fixtures in the background and hands back their results, spread over a few
 * workers (each match is ~2 s of simulation).
 */
import { type Fixture, type Result, type Season, fitnessFor, matchTeam } from './season.ts'
import type { SimRequest } from './simWorker.ts'

export function simulate(season: Season, fixtures: Fixture[]): Promise<Map<number, Result>> {
  return simulateMatches(
    fixtures.map((f) => ({ id: f.id, home: matchTeam(season, f.home), away: matchTeam(season, f.away), seed: f.seed })),
    fitnessFor(season),
  )
}

/** Plays any set of matches (league or cup) and hands back their results by id. */
export function simulateMatches(fixtures: Omit<SimRequest, 'fitness'>[], fitness: Record<string, number>): Promise<Map<number, Result>> {
  const results = new Map<number, Result>()
  if (fixtures.length === 0) return Promise.resolve(results)
  const count = Math.max(1, Math.min(fixtures.length, (navigator.hardwareConcurrency || 2) - 1, 4))
  const workers = Array.from({ length: count }, () => new Worker(new URL('./simWorker.ts', import.meta.url), { type: 'module' }))
  const stop = (): void => workers.forEach((w) => w.terminate())
  return new Promise((resolve, reject) => {
    const queue = [...fixtures]
    const feed = (w: Worker): void => {
      const f = queue.shift()
      if (!f) return
      const req: SimRequest = { ...f, fitness }
      w.postMessage(req)
    }
    for (const w of workers) {
      w.onmessage = (e: MessageEvent<{ id: number; result: Result }>) => {
        results.set(e.data.id, e.data.result)
        if (results.size === fixtures.length) {
          stop()
          resolve(results)
        } else feed(w)
      }
      w.onerror = (e) => {
        stop()
        reject(new Error(e.message))
      }
      feed(w)
    }
  })
}
