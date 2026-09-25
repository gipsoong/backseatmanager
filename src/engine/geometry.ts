/** Pitch geometry. World units are metres; x runs goal-to-goal, y touchline-to-touchline. */

export interface Vec {
  x: number
  y: number
}

export const PITCH_LENGTH = 105
export const PITCH_WIDTH = 68
export const HALFWAY_X = PITCH_LENGTH / 2
export const CENTER: Vec = { x: HALFWAY_X, y: PITCH_WIDTH / 2 }
export const GOAL_HALF_WIDTH = 7.32 / 2
export const BOX_DEPTH = 16.5
export const BOX_HALF_WIDTH = 40.32 / 2
export const PENALTY_SPOT_DIST = 11
export const CENTER_CIRCLE_RADIUS = 9.15
export const POST_RADIUS = 0.15

export const vec = (x: number, y: number): Vec => ({ x, y })
export const add = (a: Vec, b: Vec): Vec => ({ x: a.x + b.x, y: a.y + b.y })
export const sub = (a: Vec, b: Vec): Vec => ({ x: a.x - b.x, y: a.y - b.y })
export const scale = (a: Vec, k: number): Vec => ({ x: a.x * k, y: a.y * k })
export const len = (a: Vec): number => Math.hypot(a.x, a.y)
export const dist = (a: Vec, b: Vec): number => Math.hypot(a.x - b.x, a.y - b.y)
export const lerp = (a: Vec, b: Vec, t: number): Vec => ({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t })
export const clamp = (v: number, lo: number, hi: number): number => (v < lo ? lo : v > hi ? hi : v)

export function norm(a: Vec): Vec {
  const l = len(a)
  return l < 1e-9 ? { x: 0, y: 0 } : { x: a.x / l, y: a.y / l }
}

/** Parameter t in [0,1] of the point on segment a→b closest to p. */
export function closestT(a: Vec, b: Vec, p: Vec): number {
  const abx = b.x - a.x
  const aby = b.y - a.y
  const l2 = abx * abx + aby * aby
  if (l2 < 1e-12) return 0
  return clamp(((p.x - a.x) * abx + (p.y - a.y) * aby) / l2, 0, 1)
}

export function distToSegment(a: Vec, b: Vec, p: Vec): number {
  return dist(p, lerp(a, b, closestT(a, b, p)))
}

/** x of the goal line a team defends (side depends on the half). */
export function ownGoalX(team: 0 | 1, half: 1 | 2): number {
  const defendsLeft = (team === 0) === (half === 1)
  return defendsLeft ? 0 : PITCH_LENGTH
}

export function oppGoalX(team: 0 | 1, half: 1 | 2): number {
  return PITCH_LENGTH - ownGoalX(team, half)
}

/** +1 if the team attacks towards increasing x. */
export function attackDir(team: 0 | 1, half: 1 | 2): 1 | -1 {
  return ownGoalX(team, half) === 0 ? 1 : -1
}

/**
 * Team-relative ("attacking frame") coordinates: x = metres from own goal line,
 * y mirrored so a team's left is always the same side of the frame.
 */
export function toWorld(p: Vec, team: 0 | 1, half: 1 | 2): Vec {
  return attackDir(team, half) === 1 ? { x: p.x, y: p.y } : { x: PITCH_LENGTH - p.x, y: PITCH_WIDTH - p.y }
}

export const toAttackFrame = toWorld // the transform is its own inverse

/** Is p inside the penalty area in front of the goal line at goalX? */
export function inPenaltyArea(p: Vec, goalX: number): boolean {
  const depth = Math.abs(p.x - goalX)
  return depth <= BOX_DEPTH && Math.abs(p.y - CENTER.y) <= BOX_HALF_WIDTH && inPitch(p)
}

export function inPitch(p: Vec, margin = 0): boolean {
  return p.x >= -margin && p.x <= PITCH_LENGTH + margin && p.y >= -margin && p.y <= PITCH_WIDTH + margin
}

export function penaltySpot(goalX: number): Vec {
  return { x: goalX === 0 ? PENALTY_SPOT_DIST : PITCH_LENGTH - PENALTY_SPOT_DIST, y: CENTER.y }
}
