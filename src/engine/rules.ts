/** Positional conditions the laws require before a restart may be taken. */
import { CENTER, CENTER_CIRCLE_RADIUS, GOAL_HALF_WIDTH, HALFWAY_X, dist, inPenaltyArea, ownGoalX } from './geometry.ts'
import { af } from './ai.ts'
import type { MatchState, Restart, Side } from './types.ts'

export function restartConditionsMet(s: MatchState, r: Restart): boolean {
  const players = s.players.filter((p) => p.onPitch)
  const opponents = players.filter((p) => p.team !== r.team)
  switch (r.type) {
    case 'kickoff':
      return (
        players.every((p) => af(s, p.team, p.pos).x <= HALFWAY_X) &&
        opponents.every((p) => dist(p.pos, CENTER) >= CENTER_CIRCLE_RADIUS)
      )
    case 'penalty': {
      const defending = (1 - r.team) as Side
      const goalX = ownGoalX(defending, s.half)
      return players.every((p) => {
        if (p.idx === r.takerIdx) return true
        if (p.team === defending && p.slot.role === 'GK') {
          return Math.abs(p.pos.x - goalX) <= 0.6 && Math.abs(p.pos.y - CENTER.y) <= GOAL_HALF_WIDTH
        }
        return !inPenaltyArea(p.pos, goalX) && dist(p.pos, r.spot) >= CENTER_CIRCLE_RADIUS
      })
    }
    case 'freeKick':
    case 'corner':
      return opponents.every((p) => dist(p.pos, r.spot) >= CENTER_CIRCLE_RADIUS - 0.15)
    case 'goalKick':
      return opponents.every((p) => !inPenaltyArea(p.pos, ownGoalX(r.team, s.half)))
    case 'throwIn':
      return opponents.every((p) => dist(p.pos, r.spot) >= 2)
  }
}
