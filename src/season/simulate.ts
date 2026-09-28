/**
 * Plays a set of fixtures in the background and hands back their results, spread over a few
 * workers (each match is ~2 s of simulation).
 */
import { type Fixture, type Result, type Season, fitnessFor, matchTeam } from './season.ts'
import type { SimRequest } from './simWorker.ts'

export function simulate(season: Season, fixtures: Fixture[]): Promise<Map<number, Result>> {
  const results = new Map<number, Result>()
  if (fixtures.length === 0) return Promise.resolve(results)
  const count = Math.max(1, Math.min(fixtures.length, (navigator.hardwareConcurrency || 2) - 1, 4))
  const workers = Array.from({ length: count }, () => new Worker(new URL('./simWorker.ts', import.meta.url), { type: 'module' }))
  const stop = (): void => workers.forEach((w) => w.terminate())
  const fitness = fitnessFor(season)
  return new Promise((resolve, reject) => {
    const queue = [...fixtures]
    const feed = (w: Worker): void => {
      const f = queue.shift()
      if (!f) return
      const req: SimRequest = { id: f.id, home: matchTeam(season, f.home), away: matchTeam(season, f.away), seed: f.seed, fitness }
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
