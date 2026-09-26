/**
 * Plays fixtures the manager isn't watching, off the main thread, with the full engine: the same
 * match seed gives the same match as if it had been watched.
 */
import { type TeamDef, runMatch } from '../engine/index.ts'
import { resultOf } from './season.ts'

export interface SimRequest {
  id: number
  home: TeamDef
  away: TeamDef
  seed: number
}

self.onmessage = (e: MessageEvent<SimRequest>) => {
  const { id, home, away, seed } = e.data
  self.postMessage({ id, result: resultOf(runMatch(home, away, { seed })) })
}
