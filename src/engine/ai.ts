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
  inPenaltyArea,
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
  AERIAL_HEIGHT,
  BALL_FRICTION,
  CELEBRATION_TICKS,
  CHARGE_DOWN_CHANCE,
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
  PLAYER_ACCEL,
} from './constants.ts'
import { type BallMotion, advanceBall, loftTime, shotVz } from './physics.ts'
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
  return Math.max(defensiveLine(s, team), af(s, team, ballPos).x, HALFWAY_X)
}

/** Where `team`'s opponents' second-last player stands, in `team`'s attacking frame. */
export function defensiveLine(s: MatchState, team: Side): number {
  const snap = snapshots.get(s)
  const cached = snap?.lines[team]
  if (cached !== undefined) return cached
  let first = -Infinity
  let second = -Infinity
  for (const o of s.players) {
    if (!o.onPitch || o.team === team) continue
    const x = af(s, team, o.pos).x
    if (x > first) {
      second = first
      first = x
    } else if (x > second) second = x
  }
  const line = second === -Infinity ? 0 : second
  if (snap) snap.lines[team] = line
  return line
}

// ---------------------------------------------------------------------------
// Movement snapshot

/**
 * While players choose where to move, nothing those choices read changes until they move: the
 * defensive lines, the loose ball's path, and who can reach it when. Worked out once per tick
 * instead of once per player; outside the movement step everything is computed fresh.
 */
interface Snapshot {
  lines: (number | undefined)[]
  unpressured?: (boolean | undefined)[]
  path?: BallPoint[]
  arrivals?: Map<number, { ticks: number; point: BallPoint }>
}
const snapshots = new WeakMap<MatchState, Snapshot>()

export function beginMovement(s: MatchState): void {
  snapshots.set(s, { lines: [] })
}

export function endMovement(s: MatchState): void {
  snapshots.delete(s)
}

/** An opponent has the ball and none of `team` is within 4m of him. */
function ballUnpressured(s: MatchState, team: Side): boolean {
  const snap = snapshots.get(s)
  const cached = snap?.unpressured?.[team]
  if (cached !== undefined) return cached
  const owner = s.ball.ownerIdx === null ? null : s.players[s.ball.ownerIdx]
  const v = owner !== null && owner.team !== team && nearestDist(teammatesOf(s, team), owner.pos) > 4
  if (snap) (snap.unpressured ??= [])[team] = v
  return v
}

/** The loose ball's path over the next 40 ticks. */
function loosePath(s: MatchState): BallPoint[] {
  const snap = snapshots.get(s)
  if (snap?.path) return snap.path
  const path = ballPath(s.ball)
  if (snap) snap.path = path
  return path
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


/**
 * Time (s) for `pl` to get within `reach` of `point`, accelerating from how he's moving now (as
 * `movePlayer` does): a man running the other way has to stop first.
 */
export function reachTime(pl: PlayerState, point: Vec, reach: number): number {
  const dx = point.x - pl.pos.x
  const dy = point.y - pl.pos.y
  const full = Math.sqrt(dx * dx + dy * dy)
  const d = full - reach
  if (d <= 0) return 0
  const along = (pl.vel.x * dx + pl.vel.y * dy) / full
  const stop = Math.max(0, -along) / PLAYER_ACCEL
  const v0 = clamp(along, 0, pl.maxSpeed)
  const accelDist = (pl.maxSpeed ** 2 - v0 ** 2) / (2 * PLAYER_ACCEL)
  if (d <= accelDist) return stop + (Math.sqrt(v0 * v0 + 2 * PLAYER_ACCEL * d) - v0) / PLAYER_ACCEL
  return stop + (pl.maxSpeed - v0) / PLAYER_ACCEL + (d - accelDist) / pl.maxSpeed
}

/**
 * Earliest tick at which `pl` could reach the ball along `path` (low enough to play), and where,
 * accelerating as `reachTime` has it.
 */
export function arrivalOf(pl: PlayerState, path: BallPoint[], reach: number, reachHeight: number): { ticks: number; point: BallPoint } {
  for (let k = 0; k < path.length; k++) {
    if (path[k].z <= reachHeight && reachTime(pl, path[k], reach) <= k * DT) return { ticks: k, point: path[k] }
  }
  const end = path[path.length - 1]
  return { ticks: path.length + reachTime(pl, end, reach) / DT, point: end }
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
  return 0.005 + 0.03 * (a.x / PITCH_LENGTH) ** 2 + 0.3 * xgFrom(a) + cutBackValue(a)
}

/**
 * Near the byline in the channels there's no shot, but it's where the most dangerous balls come
 * from: a cut-back to the penalty spot or a cross along the six-yard line.
 */
function cutBackValue(a: Vec): number {
  const toByline = PITCH_LENGTH - a.x
  const wide = Math.abs(a.y - CENTER.y)
  if (toByline > 14 || wide < GOAL_HALF_WIDTH + 2 || wide > BOX_HALF_WIDTH + 6) return 0
  return 0.02 * (1 - toByline / 14)
}

/** Value of simply keeping the ball, on top of where it is: a shot gives this up. */
const POSSESSION_VALUE = 0.03
/** Extra worth of winning the ball in the box beyond the chance itself: knock-downs, second balls. */
const SECOND_BALLS = 1.2
/** Cost of losing the ball at a: the value of keeping it, plus what the opponent could do from there. */
const lossCost = (a: Vec): number => POSSESSION_VALUE + threat(vec(PITCH_LENGTH - a.x, PITCH_WIDTH - a.y))

/**
 * Chance an opponent cuts a pass out, from how much later than the ball (s) he can reach its path.
 * Already there (margin <= 0) is close to certain; a few tenths of a second behind, unlikely.
 */
const interceptChance = (margin: number): number => 0.95 / (1 + Math.exp((margin - 0.15) * 10))

/**
 * Chance the receiver loses a race to the ball, from how much sooner (s) he gets there than the
 * first opponent. Level is a 50/50 (a contested header); a few tenths either way mostly decides it.
 */
const raceLost = (margin: number): number => 1 / (1 + Math.exp(margin * 8))

/**
 * How much a passer is being hurried, 0 (nobody near) to 1 (an opponent on him): passes played
 * under pressure are less accurate, by up to double.
 */
export function pressureOn(s: MatchState, p: PlayerState): number {
  return clamp((3 - nearestDist(opponentsOf(s, p.team), p.pos)) / 2.5, 0, 1)
}

function nearestDist(ps: PlayerState[], p: Vec): number {
  let best = Infinity
  for (const o of ps) best = Math.min(best, dist(o.pos, p))
  return best
}

// ---------------------------------------------------------------------------
// Ball-carrier decisions

export type Action =
  | { kind: 'shot'; target: Vec; xg: number; height: number; finesse: boolean }
  | { kind: 'pass'; toIdx: number; target: Vec; lofted: boolean; through?: boolean }
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
  // Teammates in an offside position he's noticed (a good passer usually does) aren't passed to.
  const offside = new Set(offsidePositions(s, p, ball).filter(() => rng.chance(0.1 + (attrs.passing + attrs.composure) / 80)))
  const hurried = pressureOn(s, p)

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
    if (offside.has(q.idx)) continue
    const ta = af(s, p.team, target)
    const space = clamp(nearestDist(opps, target) / 6, 0.5, 1.1)
    const value = threat(ta) * space + POSSESSION_VALUE
    const misplace = ((21 - attrs.passing) / 20) * (d / 40) * 0.25 * (1 + hurried)

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
    const u = (1 - risk) * value - risk * loss + forwardLean(p, a, ta) + rng.gauss() * 0.002
    if (u > bestU) {
      bestU = u
      best = { kind: 'pass', toIdx: q.idx, target, lofted: false }
    }

    // In the air: a race on the ball's actual flight between him and the first opponent who can get
    // to it low enough to play (the keeper can reach higher in his box). A cross is aimed at head height.
    // Nobody chips it back to their own keeper (he'd have to head it, next to his own goal), or
    // lofts it backwards at all: an overhit ball over a teammate's head runs on towards our goal.
    if (d >= 18 && q.slot.role !== 'GK' && ta.x > a.x - 5) {
      const path = ballPath(passMotion(ball, target, true, isCross(ta) ? CROSS_HEIGHT : LOFTED_PASS_HEIGHT), 45)
      const race = raceFor(s, q, path, ball, target)
      if (race) {
        const riskAir = clamp(race.lost + misplace * 1.5, 0, 1)
        // A ball into the box is worth a little more than the header alone: knock-downs, second balls.
        const intoBox = ta.x > PITCH_LENGTH - BOX_DEPTH && Math.abs(ta.y - CENTER.y) < BOX_HALF_WIDTH
        const uAir = (1 - riskAir) * value * (intoBox ? SECOND_BALLS : 1) - riskAir * loss + forwardLean(p, a, ta) + rng.gauss() * 0.002
        if (uAir > bestU) {
          bestU = uAir
          best = { kind: 'pass', toIdx: q.idx, target, lofted: true }
        }
      }
    }
  }

  // Through balls: into the space ahead of a forward, for him to run onto.
  if (a.x > 35) {
    for (const q of teammatesOf(s, p.team)) {
      if (q.idx === p.idx || offside.has(q.idx) || !THROUGH_ROLES.has(q.slot.role)) continue
      if (opts.passFilter && !opts.passFilter(q)) continue
      const qa = af(s, p.team, q.pos)
      if (qa.x < 50 || qa.x < a.x - 8 || dist(q.pos, ball) < 8) continue
      for (const option of throughBalls(s, p, q, qa, opts.maxPass)) {
        if (option.u > bestU) {
          bestU = option.u
          best = { kind: 'pass', toIdx: q.idx, target: option.target, lofted: option.lofted, through: true }
        }
      }
    }
  }

  // Crosses into space: near post, penalty spot, far post, or pulled back from the byline.
  if (a.x > 72 && Math.abs(a.y - CENTER.y) > 10 && !opts.passFilter) {
    for (const option of crossesIntoSpace(s, p, a, offside, opts.maxPass)) {
      if (option.u > bestU) {
        bestU = option.u
        best = { kind: 'pass', toIdx: option.toIdx, target: option.target, lofted: option.lofted }
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

    // Clean through, nobody but the keeper goal-side of him: run at goal. Chasers behind him have
    // to catch him first; value it at where he'll be in a couple of seconds.
    const goalSide = opps.some((o) => o.slot.role !== 'GK' && af(s, p.team, o.pos).x > a.x - 0.5)
    if (!goalSide && a.x > 55) {
      const goal = vec(PITCH_LENGTH, CENTER.y)
      const ahead = add(a, scale(norm(sub(goal, a)), Math.min(12, Math.max(0, dist(a, goal) - 8))))
      const chased = clamp((2 - nearestDist(opps, p.pos)) / 2, 0, 1) * 0.3
      const uRun = (1 - chased) * (threat(ahead) + POSSESSION_VALUE) - chased * loss + rng.gauss() * 0.002
      if (uRun > bestU) {
        bestU = uRun
        best = { kind: 'dribble', target: wf(s, p.team, add(a, scale(norm(sub(goal, a)), 5))) }
      }
    }
  }

  // Shot: only from where a shot is physically sensible.
  if (opts.allowShot) {
    const q = shotQuality(s, p, ball, opts.maxShotDistance)
    const eagerness = 1.0 + p.def.traits.flair * 0.3 + attrs.shooting / 50
    if (q > 0.021 && q * eagerness > bestU) {
      const gk = goalkeeperOf(s, 1 - p.team as Side)
      const gy = gk ? af(s, p.team, gk.pos).y : CENTER.y
      const side = gy > CENTER.y ? -1 : 1
      const dGoal = dist(a, vec(PITCH_LENGTH, CENTER.y))
      // From the edge of the box a player with flair may curl it rather than drive it: placed
      // right into the far corner, more accurately, but with less pace on it (see execute).
      const finesse = dGoal > 11 && dGoal < 26 && rng.chance(0.1 + p.def.traits.flair * 0.45)
      const aim = CENTER.y + side * (GOAL_HALF_WIDTH - 0.5) * (finesse ? rng.range(0.8, 1) : rng.range(0.5, 1))
      const sigma = ((26 - attrs.shooting) / 20) * (1.5 + dGoal * 0.28) * (finesse ? 0.8 : 1)
      const target = wf(s, p.team, vec(PITCH_LENGTH, aim + rng.gauss() * sigma))
      // Height as it reaches the line: aimed under the bar, with error growing with distance.
      const height = Math.max(0.1, rng.range(0.2, 1.6) + Math.abs(rng.gauss()) * sigma * 0.45)
      return { kind: 'shot', target, xg: q, height, finesse }
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
    // Out wide, a defender under pressure (not the keeper) puts it out of play if he can.
    const touchSide = Math.sign(a.y - CENTER.y)
    const angles = !keeper && Math.abs(a.y - CENTER.y) > 18 ? [touchSide * 1.3, 0, 0.35 * touchSide, 0.7 * touchSide] : [0, 0.35, -0.35, 0.7, -0.7, 1.05, -1.05]
    const candidates = angles.map((angle) => {
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

/**
 * A player's own taste for going forward (directness) or keeping it (low directness): a small nudge
 * to how he rates a pass by how far it moves the ball upfield, on top of what it's actually worth.
 */
function forwardLean(p: PlayerState, from: Vec, to: Vec): number {
  return (p.def.traits.directness - 0.5) * 0.012 * clamp((to.x - from.x) / 25, -1, 1)
}

/** Who gets played in behind: forwards and wide men, and midfielders arriving late. */
const THROUGH_ROLES = new Set(['ST', 'W', 'WM', 'CM'])
/** Height a ball over the top is aimed to come down at, so the runner can take it in his stride. */
export const THROUGH_BALL_HEIGHT = 0.4
/** A lofted ball aimed here (attacking frame) is a cross, aimed at head height. */
export const isCross = (ta: Vec): boolean => ta.x > PITCH_LENGTH - 18 && Math.abs(ta.y - CENTER.y) < 14
/** Heights at the target a cross (head) and other lofted passes (chest) are aimed at, on average. */
export const CROSS_HEIGHT = 1.75
export const LOFTED_PASS_HEIGHT = 0.95

/** The ball's motion when kicked from `from` to `target`, on the ground or lofted, as `execute` plays it. */
export function passMotion(from: Vec, target: Vec, lofted: boolean, arrivalHeight: number): BallMotion {
  const d = dist(from, target)
  const dir = norm(sub(target, from))
  if (!lofted) return { pos: from, vel: scale(dir, passKinematics(d).speed), z: 0, vz: 0 }
  const time = loftTime(d)
  return { pos: from, vel: scale(dir, d / time), z: 0, vz: shotVz(arrivalHeight, time) }
}

/**
 * Passes into space ahead of `q`, each valued by a race run on the ball's actual path: when does he
 * get to it, and when does the first defender (or the keeper, off his line)?
 */
function throughBalls(s: MatchState, p: PlayerState, q: PlayerState, qa: Vec, maxPass: number): { target: Vec; lofted: boolean; u: number }[] {
  const out: { target: Vec; lofted: boolean; u: number }[] = []
  const ball = s.ball.pos
  const attrs = p.def.attrs
  const loss = lossCost(af(s, p.team, ball))
  // Ahead of him, bending towards goal; with his run, if he's already going.
  const va = sub(af(s, p.team, add(q.pos, q.vel)), qa)
  const toGoal = norm(sub(vec(PITCH_LENGTH, CENTER.y), qa))
  const dir = norm(add(add(vec(1, 0), scale(toGoal, 0.6)), scale(va, 0.1)))
  for (const ahead of [6, 11, 16]) {
    // Short of the byline, or it runs out of play before he gets there.
    const spotA = vec(Math.min(qa.x + dir.x * ahead, PITCH_LENGTH - 12), clamp(qa.y + dir.y * ahead, 5, PITCH_WIDTH - 5))
    if (spotA.x < qa.x + 3) continue
    const target = wf(s, p.team, spotA)
    const d = dist(ball, target)
    if (d < 8 || d > maxPass + 5) continue
    // Over the top only to land outside the box: in it, it's the keeper's.
    // and in from the touchline: a dropping ball skids on and out.
    const canLoft = d >= 18 && spotA.x < PITCH_LENGTH - BOX_DEPTH - 2 && Math.abs(spotA.y - CENTER.y) < CENTER.y - 10
    for (const lofted of canLoft ? [false, true] : [false]) {
      const path = ballPath(passMotion(ball, target, lofted, THROUGH_BALL_HEIGHT), 45)
      const race = raceFor(s, q, path, ball, target)
      if (!race) continue
      const misplace = ((21 - attrs.passing) / 20) * (d / 40) * (lofted ? 0.4 : 0.3) * (1 + pressureOn(s, p))
      // Weighting a ball into space is harder than playing it to feet.
      const risk = clamp(race.lost + misplace + (lofted ? 0.08 : 0) + 0.18, 0, 1)
      // Onto the ball in space: worth more the further clear of the defence he is.
      const space = clamp(0.7 + (1 - race.lost) * 0.4, 0.5, 1.3)
      const value = threat(af(s, p.team, race.point)) * space + POSSESSION_VALUE
      out.push({ target, lofted, u: (1 - risk) * value - risk * loss + forwardLean(p, af(s, p.team, ball), spotA) + s.rng.gauss() * 0.002 })
    }
  }
  return out
}

/**
 * The race for a ball played along `path` to `q`: his arrival against the first opponent's, as
 * the chance he loses it, and where he meets it.
 */
function raceFor(s: MatchState, q: PlayerState, path: BallPoint[], from: Vec, target: Vec): { lost: number; point: BallPoint } | null {
  const mine = arrivalOf(q, path, reachOf(s, q), reachHeightOf(s, q))
  if (mine.ticks >= path.length) return null
  // He has to get there well before it runs out of play (the pass won't be perfect).
  if (path.slice(0, mine.ticks + 8).some((b) => b.x < 0 || b.x > PITCH_LENGTH || b.y < 0 || b.y > PITCH_WIDTH)) return null
  let first = Infinity
  let chargedDown = 0
  const early = lerp(from, target, Math.min(1, 1.5 / Math.max(dist(from, target), 1)))
  for (const o of opponentsOf(s, q.team)) {
    // Played away from someone right behind the passer: the loop won't let him touch it where it
    // was struck, and from that close he'd look like he's already there.
    if (projectT(from, target, o.pos) < 0 && dist(o.pos, from) > CHARGE_DOWN_REACH && dist(o.pos, from) < 3) continue
    // Standing right in front of the kick: he may charge it down (as the loop resolves it), or not.
    if (o.slot.role !== 'GK' && distToSegment(from, early, o.pos) <= reachOf(s, o)) {
      chargedDown = 1 - (1 - chargedDown) * (1 - CHARGE_DOWN_CHANCE)
      continue
    }
    first = Math.min(first, arrivalOf(o, path, reachOf(s, o), reachHeightOf(s, o)).ticks)
  }
  // Taking it in the air (head or chest) is harder than at his feet.
  const inAir = mine.point.z > AERIAL_HEIGHT ? 0.2 : 0
  const lost = 1 - (1 - chargedDown) * (1 - raceLost((first - mine.ticks) * DT))
  return { lost: clamp(lost + inAir, 0, 1), point: mine.point }
}

/**
 * Crosses aimed at space in the box for a runner to attack, rather than at where he's standing
 * (level with his marker): near post, penalty spot, far post; from the byline, pulled back.
 */
function crossesIntoSpace(
  s: MatchState,
  p: PlayerState,
  a: Vec,
  offside: Set<number>,
  maxPass: number,
): { toIdx: number; target: Vec; lofted: boolean; u: number }[] {
  const out: { toIdx: number; target: Vec; lofted: boolean; u: number }[] = []
  const ball = s.ball.pos
  const side = Math.sign(a.y - CENTER.y)
  const loss = lossCost(a)
  const spots: [Vec, boolean][] = [
    [vec(PITCH_LENGTH - 5, CENTER.y + side * 2.5), true],
    [vec(PITCH_LENGTH - 10, CENTER.y), true],
    [vec(PITCH_LENGTH - 6, CENTER.y - side * 4), true],
  ]
  if (a.x > PITCH_LENGTH - 10) spots.push([vec(PITCH_LENGTH - 13, CENTER.y + side * 3), false])
  for (const [spotA, lofted] of spots) {
    const target = wf(s, p.team, spotA)
    const d = dist(ball, target)
    if (d > maxPass + 5 || (lofted && d < 12)) continue
    const path = ballPath(passMotion(ball, target, lofted, CROSS_HEIGHT), 45)
    const misplace = ((21 - p.def.attrs.passing) / 20) * (d / 40) * (lofted ? 0.375 : 0.25) * (1 + pressureOn(s, p))
    for (const q of teammatesOf(s, p.team)) {
      if (q.idx === p.idx || q.slot.role === 'GK' || offside.has(q.idx) || dist(q.pos, target) > 16) continue
      const race = raceFor(s, q, path, ball, target)
      if (!race) continue
      const risk = clamp(race.lost + misplace, 0, 1)
      const value = threat(af(s, p.team, race.point)) * SECOND_BALLS + POSSESSION_VALUE
      out.push({ toIdx: q.idx, target, lofted, u: (1 - risk) * value - risk * loss + s.rng.gauss() * 0.002 })
    }
  }
  return out
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
  if (p.slot.role === 'GK') {
    const spot = goalkeeperSpot(b)
    // Sweeping behind a high line: with the ball well away, he stands up to the edge of his box so
    // the space in behind is his, not the forwards'.
    if (b.x > 40) {
      const deepest = Math.min(...teammatesOf(s, team).filter((q) => q.slot.role !== 'GK').map((q) => af(s, team, q.pos).x))
      const sweep = clamp(deepest - 20, 0, BOX_DEPTH - 3)
      if (sweep > spot.x) return wf(s, team, vec(sweep, lerp(spot, vec(0, CENTER.y), 0.5).y))
    }
    return wf(s, team, spot)
  }

  let lineX: number
  let length: number
  let widthK: number
  if (inPossession) {
    lineX = clamp(b.x - 32, 20, 58)
    length = 40
    widthK = 1.05
  } else {
    const [lo, hi] = { low: [14, 32], mid: [20, 42], high: [26, 55] }[s.teams[team].block]
    // No pressure on the ball: he has time to pick a pass in behind, so the line drops off.
    const unpressured = ballUnpressured(s, team)
    // Never hold a line further out than the ball: drop towards the six-yard box when it's deep.
    lineX = Math.min(clamp(b.x - 22, lo, hi) - (unpressured ? 7 : 0), Math.max(b.x - 2, 4))
    // Ball wide near our byline: drop to the six-yard box, where the crosses are aimed.
    if (b.x < 24 && Math.abs(b.y - CENTER.y) > 10) lineX = Math.min(lineX, 6)
    length = 30
    widthK = 0.7
  }
  const depth = p.slot.depth + (inPossession ? p.slot.attackDepth : 0)
  const x = lineX + depth * length
  const y = CENTER.y + (p.slot.y - CENTER.y) * widthK + (b.y - CENTER.y) * (inPossession ? 0.2 : 0.4)

  let target = vec(x, y)
  // A one-two: straight to the space he's going for.
  if (inPossession && p.runUntil > s.tick && p.runTo) return p.runTo
  const run = inPossession ? boxRun(s, p, b) : null
  if (run) return wf(s, team, run)
  if (inPossession) {
    // Get free: step away from the nearest opponent to offer a clear pass.
    let near: Vec | null = null
    let nearD = Infinity
    for (const o of s.players) {
      if (!o.onPitch || o.team === team) continue
      const oa = af(s, team, o.pos)
      const d = dist(oa, target)
      if (d < nearD) {
        nearD = d
        near = oa
      }
    }
    if (near && nearD < 5) target = add(target, scale(norm(sub(target, near)), 5 - nearD))
    const line = offsideLine(s, team, s.ball.pos)
    const role = p.slot.role
    const forward = role === 'ST' || role === 'W' || role === 'WM'
    if (p.runUntil > s.tick) {
      // In behind, angled into the channel: between centre-back and full-back.
      const side = Math.sign(p.slot.y - CENTER.y) || Math.sign(target.y - CENTER.y) || 1
      const channel = CENTER.y + side * (role === 'ST' ? 7 : 13)
      target = vec(Math.min(line + 12, PITCH_LENGTH - 6), lerp(target, vec(0, channel), 0.7).y)
    } else {
      // Marked tight: check back towards the ball to make a yard of space for a pass to feet.
      const ownerPos = s.ball.ownerIdx === null ? null : s.players[s.ball.ownerIdx].pos
      if (forward && ownerPos && nearestDist(opponentsOf(s, team), p.pos) < 2.5 && dist(ownerPos, p.pos) > 14) {
        target = add(target, scale(norm(sub(af(s, team, ownerPos), target)), 6))
      }
      // On the shoulder of the last defender, drifting a little either side of him as the line
      // moves: now and then he's caught a yard off.
      const drift = forward ? Math.sin(s.tick / 37 + p.idx * 1.7) * 2 : 0
      target = vec(Math.min(target.x, line - 0.5 + drift), target.y)
    }
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
      const known = snapshots.get(s)?.arrivals?.get(p.idx)
      return { target: (known ?? arrivalOf(p, loosePath(s), reachOf(s, p), reachHeightOf(s, p))).point, urgency: 1 }
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
    const t = p.def.traits
    // A hard-working presser pushes the press a little higher up the pitch.
    const pressing = oa.x <= pressLine + t.workRate * 8
    // How tight he gets: an aggressive man gets right up to him, a cautious one stands off.
    const stand = pressing ? 1.4 - t.aggression * 0.8 : 3.5
    const ahead = add(owner.pos, scale(owner.vel, 0.4)) // meet him where he's going, not where he was
    return { target: add(ahead, scale(goalSide, stand)), urgency: pressing ? 0.8 + t.workRate * 0.2 : 0.6 + t.workRate * 0.2 }
  }
  return defendIntent(s, p, shapeTarget(s, p, false))
}

/** Hold the zone, but stay goal-side of any opponent who comes into it. Sprint back if out of position. */
function defendIntent(s: MatchState, p: PlayerState, zone: Vec): MoveIntent {
  let target = zone
  const ownGoal = wf(s, p.team, vec(0, CENTER.y))
  // A back-line defender with a forward already in behind him goes with him, goal-side. One still
  // making his run is left to the line: step up and he's offside.
  if (p.slot.role === 'CB' || p.slot.role === 'FB') {
    const pa = af(s, p.team, p.pos)
    let runner: PlayerState | null = null
    // Their offside line, in their frame: a man beyond it is left there (the line holds).
    const theirLine = offsideLine(s, (1 - p.team) as Side, s.ball.pos)
    for (const o of opponentsOf(s, p.team)) {
      if (o.slot.role === 'GK' || o.idx === s.ball.ownerIdx) continue
      const oa = af(s, p.team, o.pos)
      if (oa.x >= pa.x - 0.5 || Math.abs(oa.y - pa.y) > 12) continue
      if (af(s, o.team, o.pos).x > theirLine + 0.3) continue
      // Unless a teammate is already closer to him.
      const closer = teammatesOf(s, p.team).some((q) => q.idx !== p.idx && q.slot.role !== 'GK' && dist(q.pos, o.pos) < dist(p.pos, o.pos) - 1)
      if (closer) continue
      if (!runner || dist(o.pos, p.pos) < dist(runner.pos, p.pos)) runner = o
    }
    if (runner) {
      const ahead = add(runner.pos, scale(runner.vel, 0.5))
      return { target: add(ahead, scale(norm(sub(ownGoal, ahead)), 1.5)), urgency: 1 }
    }
  }
  if (p.slot.role !== 'GK') {
    let mark: PlayerState | null = null
    for (const o of opponentsOf(s, p.team)) {
      if (o.slot.role === 'GK' || o.idx === s.ball.ownerIdx || dist(o.pos, zone) > 10) continue
      if (!mark || dist(o.pos, zone) < dist(mark.pos, zone)) mark = o
    }
    if (mark) {
      // Tighter in our own box.
      const tight = inPenaltyArea(mark.pos, ownGoal.x) ? 0.95 : 0.7
      target = lerp(zone, add(mark.pos, scale(norm(sub(ownGoal, mark.pos)), 1.5)), tight)
      // Whatever the zone says, never be caught on the wrong side of him: stay at least a yard deeper.
      // (Unless he's offside: then the line holds and leaves him there.)
      const ta = af(s, p.team, target)
      const ma = af(s, p.team, mark.pos)
      const offsideNow = af(s, mark.team, mark.pos).x > offsideLine(s, mark.team, s.ball.pos) + 0.3
      if (ta.x > ma.x - 1 && !offsideNow) target = wf(s, p.team, vec(ma.x - 1, ta.y))
    }
  }
  // Out of position, he sprints back; how hard he gets back into shape otherwise is down to him.
  return { target, urgency: dist(p.pos, target) > 8 ? 0.8 + p.def.traits.workRate * 0.2 : 0.55 + p.def.traits.workRate * 0.3 }
}

/** While a shot is travelling towards his goal, the keeper moves across to where it will cross the line. */
function keeperShotTarget(s: MatchState, gk: PlayerState): Vec | null {
  const k = s.ball.kick
  if (!k || k.kind !== 'shot' || k.team === gk.team || s.ball.touchedSinceKick) return null
  if (s.tick - k.tick < GK_REACTION_TICKS) return gk.pos
  const path = loosePath(s).slice(0, 31)
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
    // Keeper comes off his line to confront a carrier bearing down on goal, clean through: with a
    // defender still goal-side of him, the keeper stays to guard the goal.
    const gk = goalkeeperOf(s, (1 - owner.team) as Side)
    const oa = af(s, owner.team, owner.pos)
    const through = !opponentsOf(s, owner.team).some((o) => o.slot.role !== 'GK' && af(s, owner.team, o.pos).x > oa.x)
    if (gk && through && dist(owner.pos, wf(s, gk.team, vec(0, CENTER.y))) < 16) out.set(gk.idx, 0)
    return out
  }
  const path = loosePath(s)
  const times = new Map<number, { ticks: number; point: BallPoint }>()
  for (const p of onPitch(s)) times.set(p.idx, arrivalOf(p, path, reachOf(s, p), reachHeightOf(s, p)))
  const snap = snapshots.get(s)
  if (snap) snap.arrivals = times
  const firstOf = (team: Side): number => Math.min(...teammatesOf(s, team).map((p) => times.get(p.idx)!.ticks))
  for (const team of [0, 1] as const) {
    let best: PlayerState | null = null
    let bestT = Infinity
    let second: PlayerState | null = null
    let secondT = Infinity
    for (const p of teammatesOf(s, team)) {
      const ic = times.get(p.idx)!
      if (p.slot.role === 'GK') {
        const ia = af(s, team, ic.point)
        if (ia.x > BOX_DEPTH || Math.abs(ia.y - CENTER.y) > BOX_HALF_WIDTH) continue
        // He only leaves his line for a ball he'll get to first; otherwise he's left stranded.
        if (ic.ticks > firstOf((1 - team) as Side) - 2) continue
      }
      let t = ic.ticks
      // Intended receiver of a pass gets priority unless someone is clearly closer.
      if (ball.kick?.kind === 'pass' && ball.kick.targetIdx === p.idx && !ball.touchedSinceKick) t -= 5
      if (t < bestT) {
        second = best
        secondT = bestT
        bestT = t
        best = p
      } else if (t < secondT) {
        secondT = t
        second = p
      }
    }
    if (best) out.set(best.idx, 0)
    // An opponent's ball running towards our goal: a second man races for it too.
    const theirs = ball.lastTouchIdx !== null && s.players[ball.lastTouchIdx].team !== team
    if (best && second && theirs && af(s, team, times.get(best.idx)!.point).x < 45) out.set(second.idx, 1)
  }
  return out
}

/**
 * Maybe start a run in behind for forwards when a teammate has the ball in midfield. Runners go
 * when the man on the ball has time to pick them out, and more often when they're tightly marked
 * (spinning off the defender). Returns who set off.
 */
export function maybeStartRuns(s: MatchState): PlayerState[] {
  const owner = s.ball.ownerIdx === null ? null : s.players[s.ball.ownerIdx]
  if (!owner || keeperHasItInHands(s, owner)) return []
  const a = af(s, owner.team, owner.pos)
  if (a.x < 35 || a.x > 88) return []
  const opps = opponentsOf(s, owner.team)
  const time = nearestDist(opps, owner.pos) > 5 ? 2.5 : 1
  const line = offsideLine(s, owner.team, owner.pos)
  const started: PlayerState[] = []
  for (const p of teammatesOf(s, owner.team)) {
    if (p.idx === owner.idx || p.runUntil > s.tick) continue
    if (p.slot.role !== 'ST' && p.slot.role !== 'W' && p.slot.role !== 'WM') continue
    // From on (or near) the line: a run from deep is just getting forward.
    if (af(s, p.team, p.pos).x < line - 12) continue
    const marked = nearestDist(opps, p.pos) < 3 ? 1.6 : 1
    const chance = (0.002 + (p.def.attrs.positioning / 20) * 0.002) * time * marked * (0.5 + p.def.traits.workRate)
    if (s.rng.chance(chance)) {
      p.runUntil = s.tick + s.rng.int(20, 35)
      p.runTo = null
      started.push(p)
    }
  }
  return started
}

/**
 * After a short pass in the opponents' half, does the passer burst forward for the return? If so,
 * the spot he runs to: past the man he gave it to, into the space ahead, staying onside-ish (the
 * return pass is judged for offside when it's played).
 */
export function giveAndGo(s: MatchState, p: PlayerState, to: PlayerState): Vec | null {
  if (!['CM', 'W', 'WM', 'ST', 'FB'].includes(p.slot.role)) return null
  const a = af(s, p.team, p.pos)
  const ta = af(s, p.team, to.pos)
  if (a.x < 45 || a.x > 90 || dist(a, ta) > 20) return null
  const chance = 0.03 + p.def.traits.flair * 0.06 + (p.def.attrs.positioning / 20) * 0.05
  if (!s.rng.chance(chance)) return null
  const line = offsideLine(s, p.team, s.ball.pos)
  const toGoal = norm(sub(vec(PITCH_LENGTH, CENTER.y), a))
  const aim = add(add(a, scale(vec(1, 0), 10)), scale(toGoal, 5))
  // Go round the side of the receiver away from where the pass came from.
  const x = Math.min(Math.max(aim.x, ta.x + 6), line + 5, PITCH_LENGTH - 12)
  return wf(s, p.team, vec(x, clamp(aim.y, 5, PITCH_WIDTH - 5)))
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

