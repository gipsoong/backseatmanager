/**
 * Plays fixtures the manager isn't watching, off the main thread, with the full engine: the same
 * match seed gives the same match as if it had been watched.
 */
import { type MatchConfig, type TeamDef, runMatch } from '../engine/index.ts'
import { resultOf } from './season.ts'

export interface SimRequest {
  id: number
  home: TeamDef
  away: TeamDef
  seed: number
  fitness: Record<string, number>
  knockout?: MatchConfig['knockout']
}

self.onmessage = (e: MessageEvent<SimRequest>) => {
  const { id, home, away, seed, fitness, knockout } = e.data
  self.postMessage({ id, result: resultOf(runMatch(home, away, { seed, fitness, knockout })) })
}
