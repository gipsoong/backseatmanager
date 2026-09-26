/**
 * Player decision-making. Everything here reads positions and returns intentions
 * (where to move, what to do with the ball). Nothing here decides an outcome —
 * outcomes are resolved by the match loop from where players and the ball end up.
 */
import {
  BOX_DEPTH,
  BOX_HALF_WIDTH,
  CENTER,
  CENTER_CIRCLE_RADIUS,
  GOAL_HALF_WIDTH,
  HALFWAY_X,
  PITCH_LENGTH,
  PITCH_WIDTH,
  type Vec,
  add,
  clamp,
  closestT,
  dist,
  distToSegment,
  projectT,
  len,
  lerp,
  norm,
  scale,
  sub,
  toAttackFrame,
  toWorld,
  vec,
} from './geometry.ts'
import {
  BALL_FRICTION,
  CELEBRATION_TICKS,
  CHARGE_DOWN_REACH,
  CONTROL_RADIUS,
    DT,
  GK_EXTRA_REACH,
  GK_HAND_REACH,
  GK_REACTION_TICKS,
  KEEPER_STAND_OFF,
  HEADER_REACH,
  MAX_SHOT_DISTANCE,
  PASS_ARRIVAL_SPEED,
} from './constants.ts'
import { type BallMotion, advanceBall, loft, loftHeightAt, loftTime } from './physics.ts'
import type { MatchState, PlayerState, Restart, Side } from './types.ts'

// ---------------------------------------------------------------------------
// Frames and lookups

/** Position in `team`'s attacking frame (x = metres from own goal line). */
export const af = (s: MatchState, team: Side, p: Vec): Vec => toAttackFrame(p, team, s.half)
/** Attacking-frame position back to world coordinates. */
export const wf = (s: MatchState, team: Side, p: Vec): Vec => toWorld(p, team, s.half)

export const onPitch = (s: MatchState): PlayerState[] => s.players.filter((p) => p.onPitch)
export const teammatesOf = (s: MatchState, team: Side): PlayerState[] =>
  s.players.filter((p) => p.onPitch && p.team === team)
export const opponentsOf = (s: MatchState, team: Side): PlayerState[] =>
  s.players.filter((p) => p.onPitch && p.team !== team)
export const goalkeeperOf = (s: MatchState, team: Side): PlayerState | undefined =>
  s.players.find((p) => p.onPitch && p.team === team && p.slot.role === 'GK')

const keeperInOwnBox = (s: MatchState, p: PlayerState): boolean => {
  if (p.slot.role !== 'GK') return false
  const a = af(s, p.team, p.pos)
  return a.x <= BOX_DEPTH && Math.abs(a.y - CENTER.y) <= BOX_HALF_WIDTH
}

/** A keeper with the ball in his own box has it in his hands. */
export const keeperHasItInHands = (s: MatchState, p: PlayerState): boolean => keeperInOwnBox(s, p)

/** How far sideways a player can reach the ball. */
export function reachOf(s: MatchState, p: PlayerState): number {
  return keeperInOwnBox(s, p) ? CONTROL_RADIUS + (GK_EXTRA_REACH * p.def.attrs.keeping) / 20 : CONTROL_RADIUS
}

/** How high a player can reach the ball: a header, or a keeper's hands in his own box. */
export function reachHeightOf(s: MatchState, p: PlayerState): number {
  return keeperInOwnBox(s, p) ? GK_HAND_REACH : HEADER_REACH
}

// ---------------------------------------------------------------------------
// Offside

/**
 * The offside line for `team` attacking, in its attacking frame: the further of
 * the second-last opponent, the ball and the halfway line.
 */
export function offsideLine(s: MatchState, team: Side, ballPos: Vec): number {
  const xs = opponentsOf(s, team)
    .map((o) => af(s, team, o.pos).x)
    .sort((a, b) => b - a)
  const secondLast = xs.length >= 2 ? xs[1] : 0
  return Math.max(secondLast, af(s, team, ballPos).x, HALFWAY_X)
}

export function offsidePositions(s: MatchState, kicker: PlayerState, ballPos: Vec): number[] {
  const line = offsideLine(s, kicker.team, ballPos)
  return teammatesOf(s, kicker.team)
    .filter((q) => q.idx !== kicker.idx && af(s, q.team, q.pos).x > line)
    .map((q) => q.idx)
}

// ---------------------------------------------------------------------------
// Ball prediction

export type BallPoint = Vec & { z: number }

/** Future ball positions (with height), one per tick, using the same physics as the match loop. */
export function ballPath(b: BallMotion, ticks = 40): BallPoint[] {
  const out: BallPoint[] = [{ ...b.pos, z: b.z }]
  let m = b
  for (let k = 1; k <= ticks; k++) {
    m = advanceBall(m)
    out.push({ ...m.pos, z: m.z })
  }
  return out
}

/** Earliest tick at which `pl` could reach the ball along `path` (low enough to play), and where. */
export function interceptOf(pl: PlayerState, path: BallPoint[], reach: number, reachHeight: number): { ticks: number; point: Vec } {
  for (let k = 0; k < path.length; k++) {
    if (path[k].z > reachHeight) continue
    if (dist(pl.pos, path[k]) - reach <= pl.maxSpeed * k * DT * 0.9) return { ticks: k, point: path[k] }
  }
  const end = path[path.length - 1]
  return { ticks: path.length + dist(pl.pos, end) / (pl.maxSpeed * DT), point: end }
}

/** Time (s) for a ground pass of length d to arrive, and its launch speed. */
export function passKinematics(d: number): { speed: number; time: number } {
  const speed = Math.sqrt(PASS_ARRIVAL_SPEED ** 2 + 2 * BALL_FRICTION * d)
  return { speed, time: (speed - PASS_ARRIVAL_SPEED) / BALL_FRICTION }
}

// ---------------------------------------------------------------------------
// Valuing positions

/** Chance quality of a shot from attacking-frame point a, from the visible goal angle. */
export function xgFrom(a: Vec): number {
  const dx = PITCH_LENGTH - a.x
  const dy = a.y - CENTER.y
  if (Math.hypot(dx, dy) > MAX_SHOT_DISTANCE || dx <= 0) return 0
  const angle = Math.abs(Math.atan2(dy + GOAL_HALF_WIDTH, dx) - Math.atan2(dy - GOAL_HALF_WIDTH, dx))
  return 0.9 * (1 - Math.exp(-0.95 * angle * angle))
}

/**
 * How valuable it is for the attacking team to have the ball at a. The chance a spot *might* give
 * is discounted well below a shot on offer now: by the time you get there defenders have closed,
 * so carrying on past a good shooting chance is rarely worth it.
 */
export function threat(a: Vec): number {
  return 0.005 + 0.03 * (a.x / PITCH_LENGTH) ** 2 + 0.3 * xgFrom(a)
}

/** Value of simply keeping the ball, on top of where it is: a shot gives this up. */
const POSSESSION_VALUE = 0.03
/** Cost of losing the ball at a: the value of keeping it, plus what the opponent could do from there. */
const lossCost = (a: Vec): number => POSSESSION_VALUE + threat(vec(PITCH_LENGTH - a.x, PITCH_WIDTH - a.y))

/**
 * Chance an opponent cuts a pass out, from how much later than the ball (s) he can reach its path.
 * Already there (margin <= 0) is close to certain; a few tenths of a second behind, unlikely.
 */
const interceptChance = (margin: number): number => 0.95 / (1 + Math.exp((margin - 0.15) * 10))

function nearestDist(ps: PlayerState[], p: Vec): number {
  let best = Infinity
  for (const o of ps) best = Math.min(best, dist(o.pos, p))
  return best
}

// ---------------------------------------------------------------------------
// Ball-carrier decisions

export type Action =
  | { kind: 'shot'; target: Vec; xg: number; height: number }
  | { kind: 'pass'; toIdx: number; target: Vec; lofted: boolean }
  | { kind: 'clearance'; target: Vec }
  | { kind: 'dribble'; target: Vec }
  | { kind: 'hold' }

interface ChooseOpts {
  allowShot: boolean
  allowDribble: boolean
  maxPass: number
  minPass: number
  /** Restarts: which teammates may be passed to (default: any). */
  passFilter?: (q: PlayerState) => boolean
  /** For free kicks, which are allowed from a little further out. */
  maxShotDistance?: number
}

/** Chance quality from the carrier's actual position, reduced by pressure and bodies in the way. */
export function shotQuality(s: MatchState, p: PlayerState, ballPos: Vec, maxDistance = MAX_SHOT_DISTANCE): number {
  const a = af(s, p.team, ballPos)
  const goal = vec(PITCH_LENGTH, CENTER.y)
  if (dist(a, goal) > maxDistance) return 0
  let q = maxDistance > MAX_SHOT_DISTANCE ? xgFrom(vec(Math.max(a.x, PITCH_LENGTH - MAX_SHOT_DISTANCE + 0.5), a.y)) * 0.5 : xgFrom(a)
  const opps = opponentsOf(s, p.team)
  q *= clamp(nearestDist(opps, ballPos) / 4, 0.45, 1)
  for (const o of opps) {
    if (o.slot.role === 'GK') continue
    const oa = af(s, p.team, o.pos)
    const t = closestT(a, goal, oa)
    if (t > 0.02 && dist(oa, lerp(a, goal, t)) < 1.2) q *= 0.55
  }
  return q
}

export function chooseAction(s: MatchState, p: PlayerState, opts: ChooseOpts): Action {
  const rng = s.rng
  const ball = s.ball.pos
  const a = af(s, p.team, ball)
  const opps = opponentsOf(s, p.team)
  const attrs = p.def.attrs
  const loss = lossCost(a)
  const offside = new Set(offsidePositions(s, p, ball))

  // Holding the ball is only a fallback when nothing else is possible; it never wins on merit,
  // or carriers stand still waiting for a perfect option.
  let best: Action = { kind: 'hold' }
  let bestU = -Infinity

  // Passes
  for (const q of teammatesOf(s, p.team)) {
    if (q.idx === p.idx) continue
    if (opts.passFilter && !opts.passFilter(q)) continue
    const d0 = dist(ball, q.pos)
    if (d0 < opts.minPass || d0 > opts.maxPass) continue
    const lead = scale(q.vel, passKinematics(d0).time)
    const target = vec(clamp(q.pos.x + lead.x, 1, PITCH_LENGTH - 1), clamp(q.pos.y + lead.y, 1, PITCH_WIDTH - 1))
    const d = dist(ball, target)
    if (d > opts.maxPass) continue
    if (offside.has(q.idx) && rng.chance(0.4 + (attrs.passing + attrs.composure) / 80)) continue
    const ta = af(s, p.team, target)
    const space = clamp(nearestDist(opps, target) / 6, 0.5, 1.1)
    const value = threat(ta) * space + POSSESSION_VALUE
    const misplace = ((21 - attrs.passing) / 20) * (d / 40) * 0.25

    // Along the ground: can an opponent get to the ball's path before the ball does?
    const { speed } = passKinematics(d)
    let keep = 1
    for (const o of opps) {
      // Behind the pass: it's played away from him, unless he's tight enough to charge it down.
      if (projectT(ball, target, o.pos) < 0 && dist(o.pos, ball) > CHARGE_DOWN_REACH) continue
      const t = closestT(ball, target, o.pos)
      const c = lerp(ball, target, t)
      const db = t * d
      const tBall = (speed - Math.sqrt(Math.max(speed * speed - 2 * BALL_FRICTION * db, 0))) / BALL_FRICTION
      // Matches how the loop resolves it: anyone who can get within reach of the path first gets a touch.
      const tOpp = Math.max(0, dist(o.pos, c) - reachOf(s, o)) / o.maxSpeed
      keep *= 1 - interceptChance(tOpp - tBall)
    }
    const risk = clamp(1 - keep + misplace, 0, 1)
    const u = (1 - risk) * value - risk * loss + rng.gauss() * 0.002
    if (u > bestU) {
      bestU = u
      best = { kind: 'pass', toIdx: q.idx, target, lofted: false }
    }

    // In the air: only opponents under the ball where it's low enough to reach can cut it out,
    // and an aerial ball is harder to bring down.
    // Nobody chips it back to their own keeper (he'd have to head it, next to his own goal).
    if (d >= 18 && q.slot.role !== 'GK') {
      const T = loftTime(d)
      const { apex } = loft(d, T)
      let keepAir = 1
      for (const o of opps) {
        if (projectT(ball, target, o.pos) < 0 && dist(o.pos, ball) > CHARGE_DOWN_REACH) continue
        const t = closestT(ball, target, o.pos)
        if (loftHeightAt(apex, t) > reachHeightOf(s, o)) continue
        const c = lerp(ball, target, t)
        const tOpp = Math.max(0, dist(o.pos, c) - reachOf(s, o)) / o.maxSpeed
        keepAir *= 1 - interceptChance(tOpp - t * T)
      }
      const riskAir = clamp(1 - keepAir + misplace * 1.5 + 0.12, 0, 1)
      // A ball into the box is worth more than the header alone: knock-downs, second balls, corners.
      const intoBox = ta.x > PITCH_LENGTH - BOX_DEPTH && Math.abs(ta.y - CENTER.y) < BOX_HALF_WIDTH
      const uAir = (1 - riskAir) * value * (intoBox ? 2.5 : 1) - riskAir * loss + rng.gauss() * 0.002
      if (uAir > bestU) {
        bestU = uAir
        best = { kind: 'pass', toIdx: q.idx, target, lofted: true }
      }
    }
  }

  // Dribble: carry towards goal, bending away from the nearest opponent.
  if (opts.allowDribble) {
    // Towards goal. Wide players go down the line to the byline; everyone else cuts in near goal.
    const wide = ['W', 'WM', 'FB'].includes(p.slot.role) && Math.abs(a.y - CENTER.y) > 14
    const cutIn = wide ? (a.x > PITCH_LENGTH - 8 ? 0.6 : 0) : a.x > 80 ? 0.6 : 0.1
    const aim = vec(Math.min(a.x + 12, PITCH_LENGTH - 3), a.y + (CENTER.y - a.y) * cutIn)
    let dir = norm(sub(aim, a))
    let nearest: PlayerState | null = null
    for (const o of opps) if (!nearest || dist(o.pos, p.pos) < dist(nearest.pos, p.pos)) nearest = o
    if (nearest) {
      const na = af(s, p.team, nearest.pos)
      const dn = dist(na, a)
      if (dn < 6) dir = add(norm(dir), scale(norm(sub(a, na)), (6 - dn) / 4))
    }
    dir = norm(dir)
    const ta = vec(clamp(a.x + dir.x * 5, 2, PITCH_LENGTH - 2), clamp(a.y + dir.y * 5, 2, PITCH_WIDTH - 2))
    const target = wf(s, p.team, ta)
    const closest = dist(ta, a) < 3 ? 0 : nearestDist(opps, target) // boxed in: nowhere to go
    const beat = (attrs.dribbling + attrs.pace) / 40
    const pressure = clamp((2.5 - nearestDist(opps, p.pos)) / 2.5, 0, 1) * 0.4
    const risk = clamp(clamp((5 - closest) / 5, 0, 1) * (1 - beat * 0.5) + pressure, 0, 1)
    const heldFor = (s.tick - s.possessedSince) * DT // players don't dribble forever
    const u = (1 - risk) * (threat(ta) + POSSESSION_VALUE) - risk * loss + p.def.traits.flair * 0.004 - heldFor * 0.006 + rng.gauss() * 0.002
    if (u > bestU) {
      bestU = u
      best = { kind: 'dribble', target }
    }
  }

  // Shot: only from where a shot is physically sensible.
  if (opts.allowShot) {
    const q = shotQuality(s, p, ball, opts.maxShotDistance)
    const eagerness = 0.8 + p.def.traits.flair * 0.3 + attrs.shooting / 50
    if (q > 0.025 && q * eagerness > bestU) {
      const gk = goalkeeperOf(s, 1 - p.team as Side)
      const gy = gk ? af(s, p.team, gk.pos).y : CENTER.y
      const side = gy > CENTER.y ? -1 : 1
      const aim = CENTER.y + side * (GOAL_HALF_WIDTH - 0.5) * rng.range(0.5, 1)
      const dGoal = dist(a, vec(PITCH_LENGTH, CENTER.y))
      const sigma = ((26 - attrs.shooting) / 20) * (1.5 + dGoal * 0.28)
      const target = wf(s, p.team, vec(PITCH_LENGTH, aim + rng.gauss() * sigma))
      // Height as it reaches the line: aimed under the bar, with error growing with distance.
      const height = Math.max(0.1, rng.range(0.2, 1.6) + Math.abs(rng.gauss()) * sigma * 0.45)
      return { kind: 'shot', target, xg: q, height }
    }
  }

  // Under pressure deep in our own half with nothing on (or a keeper with it in his hands): get rid of it.
  const keeper = p.slot.role === 'GK'
  // A pass that's more likely to be lost than kept (utility below zero) is no better than no pass:
  // near our own goal, go long instead of playing it through the man waiting for it.
  const nothingOn = best.kind !== 'pass' || bestU < 0
  if (nothingOn && a.x < 30 && (keeper || nearestDist(opps, p.pos) < 3)) {
    // Long, and away from whoever is closing him down: of a spread of directions (upfield first,
    // then towards the touchlines), take the one whose first few metres are clearest.
    const len = rng.range(35, 55)
    const candidates = [0, 0.35, -0.35, 0.7, -0.7, 1.05, -1.05].map((angle) => {
      const dir = vec(Math.cos(angle), Math.sin(angle))
      return wf(s, p.team, vec(a.x + dir.x * len, a.y + dir.y * len))
    })
    const clearance = (target: Vec): number => {
      const near = lerp(ball, target, Math.min(1, 6 / Math.max(dist(ball, target), 1)))
      let gap = Infinity
      for (const o of opps) {
        if (projectT(ball, near, o.pos) < 0 && dist(o.pos, ball) > CHARGE_DOWN_REACH) continue
        gap = Math.min(gap, distToSegment(ball, near, o.pos))
      }
      return gap
    }
    const clear = candidates.find((t) => clearance(t) > 2) ?? candidates.reduce((x, y) => (clearance(y) > clearance(x) ? y : x))
    return { kind: 'clearance', target: clear }
  }
  return best
}

// ---------------------------------------------------------------------------
// Movement targets

export interface MoveIntent {
  target: Vec
  /** Fraction of max speed. */
  urgency: number
}

/** Where a player stands in the team's shape, given the ball and who has it. */
export function shapeTarget(s: MatchState, p: PlayerState, inPossession: boolean): Vec {
  const team = p.team
  const b = af(s, team, s.ball.pos)
  if (p.slot.role === 'GK') return wf(s, team, goalkeeperSpot(b))

  let lineX: number
  let length: number
  let widthK: number
  if (inPossession) {
    lineX = clamp(b.x - 32, 20, 58)
    length = 40
    widthK = 1.05
  } else {
    const [lo, hi] = { low: [14, 32], mid: [20, 42], high: [26, 55] }[s.teams[team].block]
    // Never hold a line further out than the ball: drop towards the six-yard box when it's deep.
    lineX = Math.min(clamp(b.x - 22, lo, hi), Math.max(b.x - 2, 4))
    length = 30
    widthK = 0.7
  }
  const depth = p.slot.depth + (inPossession ? p.slot.attackDepth : 0)
  const x = lineX + depth * length
  const y = CENTER.y + (p.slot.y - CENTER.y) * widthK + (b.y - CENTER.y) * (inPossession ? 0.2 : 0.4)

  let target = vec(x, y)
  const run = inPossession ? boxRun(s, p, b) : null
  if (run) return wf(s, team, run)
  if (inPossession) {
    // Get free: step away from the nearest opponent to offer a clear pass.
    const opps = opponentsOf(s, team).map((o) => af(s, team, o.pos))
    let near: Vec | null = null
    for (const o of opps) if (!near || dist(o, target) < dist(near, target)) near = o
    if (near && dist(near, target) < 5) target = add(target, scale(norm(sub(target, near)), 5 - dist(near, target)))
    const line = offsideLine(s, team, s.ball.pos)
    if (p.runUntil > s.tick) target = vec(Math.min(line + 12, PITCH_LENGTH - 6), target.y)
    else target = vec(Math.min(target.x, line - 0.7), target.y)
  }
  return wf(s, team, vec(clamp(target.x, 3, PITCH_LENGTH - 3), clamp(target.y, 2, PITCH_WIDTH - 2)))
}

/**
 * Ball wide in the final third with a teammate on it: attack the box. Striker to the near post,
 * far-side winger to the far post, the most advanced midfielder to the penalty spot. With the
 * ball this deep they're onside anywhere goal-side of it.
 */
function boxRun(s: MatchState, p: PlayerState, b: Vec): Vec | null {
  const owner = s.ball.ownerIdx === null ? null : s.players[s.ball.ownerIdx]
  if (!owner || owner.team !== p.team || owner.idx === p.idx) return null
  if (b.x < 75 || Math.abs(b.y - CENTER.y) < 12) return null
  const side = Math.sign(b.y - CENTER.y)
  const line = offsideLine(s, p.team, s.ball.pos) - 0.5
  const spot = (x: number, y: number): Vec => vec(Math.min(x, line), y)
  const role = p.slot.role
  if (role === 'ST') return spot(PITCH_LENGTH - 6, CENTER.y + side * (p.slot.y > CENTER.y === side > 0 ? 3 : -2))
  if ((role === 'W' || role === 'WM') && Math.sign(p.slot.y - CENTER.y) === -side) return spot(PITCH_LENGTH - 7, CENTER.y - side * 5)
  if (role === 'CM') {
    const cms = teammatesOf(s, p.team).filter((q) => q.slot.role === 'CM')
    const furthest = cms.reduce((m, q) => (q.slot.depth + q.slot.attackDepth > m.slot.depth + m.slot.attackDepth ? q : m))
    if (furthest.idx === p.idx) return spot(PITCH_LENGTH - 12, CENTER.y - side)
  }
  return null
}

/** Keeper stands on the line between ball and goal centre, stepping out as the ball approaches. */
function goalkeeperSpot(ballA: Vec): Vec {
  const goal = vec(0, CENTER.y)
  const d = dist(ballA, goal)
  const out = clamp(d * 0.08, 0.5, 5)
  const dir = norm(sub(ballA, goal))
  return vec(Math.max(0.5, dir.x * out), CENTER.y + dir.y * out)
}

/** Movement target for a player during open play. */
export function playIntent(s: MatchState, p: PlayerState, chasers: Map<number, number>): MoveIntent {
  const ball = s.ball
  const owner = ball.ownerIdx === null ? null : s.players[ball.ownerIdx]

  if (owner && owner.idx === p.idx) {
    if (!s.dribbleTarget) return { target: p.pos, urgency: 0.3 }
    // A defender standing in the way slows the carrier right down: he has to go round, not through.
    const dir = norm(sub(s.dribbleTarget, p.pos))
    const blocked = opponentsOf(s, p.team).some((o) => {
      const to = sub(o.pos, p.pos)
      return len(to) < 2 && (to.x * dir.x + to.y * dir.y) / (len(to) || 1) > 0.5
    })
    return { target: s.dribbleTarget, urgency: blocked ? 0.3 : 0.65 }
  }

  // Loose ball: the quickest player from each team goes for it.
  if (!owner) {
    if (chasers.has(p.idx)) {
      const path = ballPath(ball)
      return { target: interceptOf(p, path, reachOf(s, p), reachHeightOf(s, p)).point, urgency: 1 }
    }
    if (p.slot.role === 'GK') return { target: keeperShotTarget(s, p) ?? shapeTarget(s, p, false), urgency: 1 }
    const lastTeam = ball.lastTouchIdx === null ? null : s.players[ball.lastTouchIdx].team
    if (lastTeam !== p.team) return defendIntent(s, p, shapeTarget(s, p, false))
    return { target: shapeTarget(s, p, true), urgency: 0.6 }
  }

  if (owner.team === p.team) {
    const running = p.runUntil > s.tick
    return { target: shapeTarget(s, p, true), urgency: running ? 1 : 0.6 }
  }

  // Out of possession: nearest player engages the carrier, the next covers behind him; others hold shape and mark.
  if (chasers.get(p.idx) === 1) {
    const goalSide = norm(sub(wf(s, p.team, vec(0, CENTER.y)), owner.pos))
    return { target: add(owner.pos, scale(goalSide, 4)), urgency: 1 }
  }
  // A keeper holding the ball can't be challenged: forwards drop off and wait for the release.
  if (chasers.has(p.idx) && keeperHasItInHands(s, owner)) {
    const away = norm(sub(wf(s, p.team, vec(0, CENTER.y)), owner.pos))
    return { target: add(owner.pos, scale(away, KEEPER_STAND_OFF)), urgency: 0.7 }
  }
  if (chasers.get(p.idx) === 0) {
    const oa = af(s, p.team, owner.pos)
    const block = s.teams[p.team].block
    const pressLine = { low: 38, mid: 55, high: 105 }[block]
    const goalSide = norm(sub(wf(s, p.team, vec(0, CENTER.y)), owner.pos))
    const pressing = oa.x <= pressLine
    const stand = pressing ? 0.9 : 3.5
    const ahead = add(owner.pos, scale(owner.vel, 0.4)) // meet him where he's going, not where he was
    return { target: add(ahead, scale(goalSide, stand)), urgency: pressing ? 1 : 0.7 }
  }
  return defendIntent(s, p, shapeTarget(s, p, false))
}

/** Hold the zone, but stay goal-side of any opponent who comes into it. Sprint back if out of position. */
function defendIntent(s: MatchState, p: PlayerState, zone: Vec): MoveIntent {
  let target = zone
  if (p.slot.role !== 'GK') {
    let mark: PlayerState | null = null
    for (const o of opponentsOf(s, p.team)) {
      if (o.slot.role === 'GK' || o.idx === s.ball.ownerIdx || dist(o.pos, zone) > 10) continue
      if (!mark || dist(o.pos, zone) < dist(mark.pos, zone)) mark = o
    }
    if (mark) {
      const ownGoal = wf(s, p.team, vec(0, CENTER.y))
      target = lerp(zone, add(mark.pos, scale(norm(sub(ownGoal, mark.pos)), 1.5)), 0.7)
    }
  }
  return { target, urgency: dist(p.pos, target) > 8 ? 1 : 0.7 }
}

/** While a shot is travelling towards his goal, the keeper moves across to where it will cross the line. */
function keeperShotTarget(s: MatchState, gk: PlayerState): Vec | null {
  const k = s.ball.kick
  if (!k || k.kind !== 'shot' || k.team === gk.team || s.ball.touchedSinceKick) return null
  if (s.tick - k.tick < GK_REACTION_TICKS) return gk.pos
  const path = ballPath(s.ball, 30)
  const ga = af(s, gk.team, gk.pos)
  let best = path[path.length - 1]
  for (const bp of path) {
    const ba = af(s, gk.team, bp)
    if (ba.x <= ga.x) {
      best = bp
      break
    }
  }
  const ba = af(s, gk.team, best)
  return wf(s, gk.team, vec(Math.max(0.3, ga.x), clamp(ba.y, CENTER.y - GOAL_HALF_WIDTH - 0.5, CENTER.y + GOAL_HALF_WIDTH + 0.5)))
}

/**
 * Which players go to the ball this tick: idx -> rank. With a carrier, rank 0 engages him and
 * (near our goal) rank 1 covers; with a loose ball, the quickest player from each team chases.
 */
export function pickChasers(s: MatchState): Map<number, number> {
  const out = new Map<number, number>()
  const ball = s.ball
  if (ball.ownerIdx !== null) {
    const owner = s.players[ball.ownerIdx]
    const near = opponentsOf(s, owner.team)
      .filter((o) => o.slot.role !== 'GK')
      .sort((x, y) => dist(x.pos, owner.pos) - dist(y.pos, owner.pos))
    if (near[0]) out.set(near[0].idx, 0)
    if (near[1] && af(s, near[1].team, owner.pos).x < 35) out.set(near[1].idx, 1)
    // Keeper comes off his line to confront a carrier bearing down on goal.
    const gk = goalkeeperOf(s, (1 - owner.team) as Side)
    if (gk && dist(owner.pos, wf(s, gk.team, vec(0, CENTER.y))) < 14) out.set(gk.idx, 0)
    return out
  }
  const path = ballPath(ball)
  for (const team of [0, 1] as const) {
    let best: PlayerState | null = null
    let bestT = Infinity
    for (const p of teammatesOf(s, team)) {
      const ic = interceptOf(p, path, reachOf(s, p), reachHeightOf(s, p))
      if (p.slot.role === 'GK') {
        const ia = af(s, team, ic.point)
        if (ia.x > BOX_DEPTH || Math.abs(ia.y - CENTER.y) > BOX_HALF_WIDTH) continue
      }
      let t = ic.ticks
      // Intended receiver of a pass gets priority unless someone is clearly closer.
      if (ball.kick?.kind === 'pass' && ball.kick.targetIdx === p.idx && !ball.touchedSinceKick) t -= 5
      if (t < bestT) {
        bestT = t
        best = p
      }
    }
    if (best) out.set(best.idx, 0)
  }
  return out
}

/** Maybe start a run in behind for forwards when a teammate has the ball in midfield. Returns who set off. */
export function maybeStartRuns(s: MatchState): PlayerState[] {
  const owner = s.ball.ownerIdx === null ? null : s.players[s.ball.ownerIdx]
  if (!owner) return []
  const a = af(s, owner.team, owner.pos)
  if (a.x < 35 || a.x > 88) return []
  const started: PlayerState[] = []
  for (const p of teammatesOf(s, owner.team)) {
    if (p.idx === owner.idx || p.runUntil > s.tick) continue
    if (p.slot.role !== 'ST' && p.slot.role !== 'W' && p.slot.role !== 'WM') continue
    const chance = 0.005 + (p.def.attrs.positioning / 20) * 0.004
    if (s.rng.chance(chance)) {
      p.runUntil = s.tick + s.rng.int(20, 40)
      started.push(p)
    }
  }
  return started
}

// ---------------------------------------------------------------------------
// Restarts

/** Where each player goes while a restart is being set up. */
export function restartIntent(s: MatchState, p: PlayerState, r: Restart): MoveIntent {
  if (p.idx === r.takerIdx) return { target: takerSpot(s, r), urgency: 0.9 }
  const attacking = p.team === r.team

  if (r.type === 'kickoff') {
    const c = r.celebration
    if (c && s.tick - r.since < CELEBRATION_TICKS) {
      // The scorer wheels away; teammates nearby run to join him; everyone else trudges back.
      const scorer = s.players[c.scorerIdx]
      if (p.idx === c.scorerIdx) return { target: c.spot, urgency: c.style === 'fistPump' ? 0.55 : 1 }
      if (p.team === scorer.team && p.slot.role !== 'GK' && dist(p.pos, scorer.pos) < 60) {
        const angle = (p.idx * 2.4) % (Math.PI * 2)
        return { target: add(scorer.pos, vec(Math.cos(angle) * 1.4, Math.sin(angle) * 1.4)), urgency: 0.95 }
      }
      return { target: kickoffPosition(s, p), urgency: 0.35 }
    }
    return { target: kickoffPosition(s, p), urgency: 0.7 }
  }

  let target = shapeTarget(s, p, attacking)

  if (r.type === 'penalty') {
    const defTeam = (1 - r.team) as Side
    if (!attacking && p.slot.role === 'GK') return { target: wf(s, defTeam, vec(0.3, CENTER.y)), urgency: 0.8 }
    // Everyone else outside the box and the arc (in the defending team's frame).
    const d = af(s, defTeam, target)
    if (d.x < BOX_DEPTH + 5) target = wf(s, defTeam, vec(BOX_DEPTH + 5, d.y))
    return { target, urgency: 0.8 }
  }

  if (r.type === 'goalKick' && !attacking) {
    const d = af(s, r.team, target)
    if (d.x < BOX_DEPTH + 2) target = wf(s, r.team, vec(BOX_DEPTH + 2, d.y))
  }

  if (r.type === 'corner') {
    const boxSpots = [vec(98, 30), vec(97, 38), vec(94, 34), vec(92, 27), vec(92, 42)]
    if (attacking && p.slot.role !== 'GK' && p.slot.role !== 'FB') {
      const order = teammatesOf(s, p.team).filter((q) => q.slot.role !== 'GK' && q.slot.role !== 'FB' && q.idx !== r.takerIdx)
      const i = order.findIndex((q) => q.idx === p.idx)
      if (i >= 0 && i < boxSpots.length) target = wf(s, p.team, boxSpots[i])
    } else if (!attacking && p.slot.role !== 'GK') {
      const d = af(s, p.team, target)
      target = wf(s, p.team, vec(Math.min(d.x, 8 + p.slot.depth * 12), d.y))
    }
  }

  // Opponents keep their distance from the ball.
  const minDist = r.type === 'throwIn' ? 2 : r.type === 'goalKick' ? 0 : CENTER_CIRCLE_RADIUS
  if (!attacking && minDist > 0 && dist(target, r.spot) < minDist + 1) {
    const away = norm(sub(target, r.spot))
    const dir = len(away) > 0 ? away : norm(sub(wf(s, p.team, vec(0, CENTER.y)), r.spot))
    const inside = (v: Vec): Vec => vec(clamp(v.x, 0.5, PITCH_LENGTH - 0.5), clamp(v.y, 0.5, PITCH_WIDTH - 0.5))
    target = inside(add(r.spot, scale(dir, minDist + 1.5)))
    // Near a corner the straight-back spot can be off the pitch: retreat towards the middle instead.
    if (dist(target, r.spot) < minDist + 0.5) target = inside(add(r.spot, scale(norm(sub(CENTER, r.spot)), minDist + 1.5)))
  }
  return { target, urgency: 0.8 }
}

export function takerSpot(s: MatchState, r: Restart): Vec {
  if (r.type === 'kickoff') return wf(s, r.team, vec(HALFWAY_X - 0.3, CENTER.y))
  return r.spot
}

/** Own half, opponents outside the centre circle. */
export function kickoffPosition(s: MatchState, p: PlayerState): Vec {
  if (p.slot.role === 'GK') return wf(s, p.team, vec(4, CENTER.y))
  const x = 18 + p.slot.depth * 24
  const y = CENTER.y + (p.slot.y - CENTER.y) * 0.85
  return wf(s, p.team, vec(clamp(x, 5, HALFWAY_X - CENTER_CIRCLE_RADIUS - 1.5), y))
}

/** Taker for a restart: the player best placed (or suited) to take it. */
export function chooseTaker(s: MatchState, type: Restart['type'], team: Side, spot: Vec): PlayerState {
  const squad = teammatesOf(s, team)
  const outfield = squad.filter((p) => p.slot.role !== 'GK')
  if (type === 'goalKick') return goalkeeperOf(s, team) ?? outfield[0]
  if (type === 'penalty') return outfield.reduce((a, b) => (b.def.attrs.shooting > a.def.attrs.shooting ? b : a))
  if (type === 'kickoff') {
    const fwd = outfield.reduce((a, b) => (b.slot.depth > a.slot.depth ? b : a))
    return fwd
  }
  return outfield.reduce((a, b) => (dist(b.pos, spot) < dist(a.pos, spot) ? b : a))
}

