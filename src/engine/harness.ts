/**
 * Headless consistency harness. Runs a match and checks, tick by tick, that every
 * outcome the engine reports is consistent with where the ball and players actually were.
 *
 * The checks here are deliberately written independently of the engine's own logic
 * (only pure geometry is shared), so a bug in a rule's implementation can't also
 * hide itself from the check.
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
  dist,
  oppGoalX,
  ownGoalX,
  penaltySpot,
} from './geometry.ts'
import {
  CONTROL_RADIUS,
  CROSSBAR_HEIGHT,
  DRIBBLE_OFFSET,
  DT,
  GK_EXTRA_REACH,
  GK_HAND_REACH,
  HEADER_REACH,
  MAX_BALL_SPEED,
  MAX_FREE_KICK_SHOT_DISTANCE,
  MAX_SHOT_DISTANCE,
  TACKLE_RANGE,
} from './constants.ts'
import { frameOf, runMatch } from './match.ts'
import type { Frame, MatchConfig, MatchEvent, MatchState, Side, TeamDef } from './types.ts'

export interface Violation {
  tick: number
  rule: string
  detail: string
}

export interface CheckResult {
  state: MatchState
  violations: Violation[]
  /** Restarts taken on timeout rather than because players got into position. */
  forcedRestarts: number
  frames?: Frame[]
}

const EPS = 1e-6
const BALL_STEP = MAX_BALL_SPEED * DT + EPS
const fmt = (v: Vec): string => `(${v.x.toFixed(2)}, ${v.y.toFixed(2)})`

/** Independent penalty-area test: is p inside the box in front of goal line goalX? */
function inBox(p: Vec, goalX: number): boolean {
  return (
    Math.abs(p.x - goalX) <= BOX_DEPTH &&
    Math.abs(p.y - CENTER.y) <= BOX_HALF_WIDTH &&
    p.x >= 0 &&
    p.x <= PITCH_LENGTH
  )
}

/** Attacking-frame x for a team: metres from its own goal line. */
const attackX = (x: number, team: Side, half: 1 | 2): number => (ownGoalX(team, half) === 0 ? x : PITCH_LENGTH - x)

interface PendingKick {
  tick: number
  team: Side
  offside: Set<number>
}

export function checkMatch(
  home: TeamDef,
  away: TeamDef,
  config: MatchConfig,
  opts: {
    keepFrames?: boolean
    /** Test hook: mutate the state after a tick, before it's checked (to prove the checks catch things). */
    tamper?: (s: MatchState) => void
  } = {},
): CheckResult {
  const violations: Violation[] = []
  const frames: Frame[] = []
  let forcedRestarts = 0
  let prev: Frame | null = null
  let pending: PendingKick | null = null
  let stillBallTicks = 0
  let heldTicks = 0
  const tally: [number, number] = [0, 0]

  const state = runMatch(home, away, config, (s, events) => {
    opts.tamper?.(s)
    const cur = frameOf(s)
    if (opts.keepFrames) frames.push(cur)
    if (prev) {
      const v = (rule: string, detail: string): void => {
        violations.push({ tick: s.tick, rule, detail })
      }
      checkTick(s, prev, cur, events, v)
    }
    prev = cur
  })

  function checkTick(s: MatchState, P: Frame, C: Frame, events: MatchEvent[], v: (rule: string, detail: string) => void): void {
    // Players are repositioned for the second half, so positions can't be checked on that tick.
    if (events.some((e) => e.type === 'halfTime')) {
      for (const e of events) if (e.type === 'goal') tally[e.team]++
      pending = null
      return
    }
    const half = C.half
    const team = (i: number): Side => s.players[i].team
    const keeperInBox = (i: number, pos: Vec): boolean => s.players[i].slot.role === 'GK' && inBox(pos, ownGoalX(team(i), half))
    const reach = (i: number, pos: Vec): number =>
      keeperInBox(i, pos) ? CONTROL_RADIUS + (GK_EXTRA_REACH * s.players[i].def.attrs.keeping) / 20 : CONTROL_RADIUS
    const reachHeight = (i: number, pos: Vec): number => (keeperInBox(i, pos) ? GK_HAND_REACH : HEADER_REACH)
    const UNDER_BAR = CROSSBAR_HEIGHT - 0.11
    const restartEv = events.find((e) => e.type === 'restart')

    // --- Movement: nobody teleports or outruns their top speed.
    s.players.forEach((p, i) => {
      if (!P.players[i].onPitch || !C.players[i].onPitch) return
      const d = dist(P.players[i], C.players[i])
      if (d > p.maxSpeed * DT + EPS) v('speed', `player ${i} moved ${d.toFixed(3)}m in one tick (max ${(p.maxSpeed * DT).toFixed(3)})`)
    })

    // --- Ball stays on the pitch at the end of every tick; an owned ball is at its owner's feet.
    if (C.ball.x < -EPS || C.ball.x > PITCH_LENGTH + EPS || C.ball.y < -EPS || C.ball.y > PITCH_WIDTH + EPS) {
      v('ball-bounds', `ball at ${fmt(C.ball)}`)
    }
    if (C.ball.z < 0) v('ball-height', `ball below the grass (${C.ball.z.toFixed(2)})`)
    if (C.ball.ownerIdx !== null) {
      const d = dist(C.ball, C.players[C.ball.ownerIdx])
      if (d > DRIBBLE_OFFSET + EPS) v('ball-owner', `ball ${d.toFixed(2)}m from owner ${C.ball.ownerIdx}`)
      if (C.ball.z !== 0) v('ball-owner', `owned ball ${C.ball.z.toFixed(2)}m in the air`)
    }

    // --- Possession only changes hands to someone actually at the ball.
    if (C.ball.ownerIdx !== null && C.ball.ownerIdx !== P.ball.ownerIdx) {
      const ev = events.find((e) => e.type === 'possession' && e.idx === C.ball.ownerIdx)
      if (!ev) v('possession', `player ${C.ball.ownerIdx} gained the ball with no possession event`)
    }
    for (const e of events) {
      if (e.type !== 'possession' && e.type !== 'deflection') continue
      const d = dist(C.players[e.idx], e.contact)
      if (d > reach(e.idx, C.players[e.idx]) + EPS) v('touch-reach', `${e.type} by ${e.idx} at ${d.toFixed(2)}m from the ball`)
      if (dist(P.ball, e.contact) > BALL_STEP) v('touch-path', `${e.type} contact ${fmt(e.contact)} not on the ball's path from ${fmt(P.ball)}`)
      if (e.height > reachHeight(e.idx, C.players[e.idx]) + EPS) v('touch-height', `${e.type} by ${e.idx} with the ball ${e.height.toFixed(2)}m up`)
    }

    // --- Kicks and touches, in the order they happened (a header is a touch and then a kick).
    // Offside is called if and only if the first player to touch a kick was offside when it was played.
    for (const e of events) {
      if (e.type === 'tackle' || e.type === 'goal' || e.type === 'out' || e.type === 'foul') pending = null

      if (e.type === 'possession' || e.type === 'deflection' || e.type === 'offside') {
        const pk = pending as PendingKick | null
        if (!pk) continue
        const was = pk.offside.has(e.idx)
        if (e.type === 'offside' && !was) v('offside-wrong', `player ${e.idx} flagged offside but was onside at tick ${pk.tick}`)
        if (e.type !== 'offside' && was) v('offside-missed', `player ${e.idx} played the ball from an offside position (kick at ${pk.tick})`)
        if (e.type === 'offside' && e.kickTick !== pk.tick) v('offside-kick', `offside refers to kick ${e.kickTick}, last kick was ${pk.tick}`)
        pending = null
        continue
      }

      if (e.type !== 'pass' && e.type !== 'shot' && e.type !== 'clearance') continue
      // Kicks from the feet are decided at the start of the tick (previous frame); headers happen
      // when the ball arrives, after everyone has moved (this frame).
      const at = e.header ? C : P
      const byRestart = restartEv?.type === 'restart' && restartEv.takerIdx === e.byIdx
      if (e.header) {
        const headed = events.some((h) => h.type === 'deflection' && h.kind === 'header' && h.idx === e.byIdx)
        if (!headed) v('kick-owner', `headed ${e.type} by ${e.byIdx} without a header`)
        const d = dist(C.players[e.byIdx], e.from)
        if (d > reach(e.byIdx, C.players[e.byIdx]) + EPS) v('kick-origin', `header from ${d.toFixed(2)}m away`)
      } else {
        if (!byRestart && P.ball.ownerIdx !== e.byIdx) v('kick-owner', `${e.type} by ${e.byIdx} who didn't have the ball`)
        const d = dist(P.players[e.byIdx], e.from)
        if (d > (byRestart ? 1.0 : DRIBBLE_OFFSET) + EPS) v('kick-origin', `${e.type} from ${d.toFixed(2)}m away from the kicker`)
      }
      if (e.type === 'shot') {
        const goal = { x: oppGoalX(team(e.byIdx), half), y: CENTER.y }
        const range = restartEv?.type === 'restart' && restartEv.restart === 'freeKick' ? MAX_FREE_KICK_SHOT_DISTANCE : MAX_SHOT_DISTANCE
        if (e.penalty) {
          if (dist(e.from, penaltySpot(goal.x)) > EPS) v('penalty-spot', `penalty taken from ${fmt(e.from)}`)
        } else if (dist(e.from, goal) > range + EPS) v('shot-range', `shot from ${dist(e.from, goal).toFixed(1)}m`)
        const t = (goal.x - e.from.x) / (e.target.x - e.from.x)
        const yAtLine = e.from.y + (e.target.y - e.from.y) * t
        const between = Math.abs(yAtLine - CENTER.y) < GOAL_HALF_WIDTH - 0.11
        if ((between && e.height < UNDER_BAR) !== e.onTarget) {
          v('shot-on-target', `onTarget=${e.onTarget} but it crosses at y=${yAtLine.toFixed(2)}, height ${e.height.toFixed(2)}`)
        }
      }
      if (e.type === 'pass') {
        if (team(e.toIdx) !== team(e.byIdx) || !C.players[e.toIdx].onPitch) v('pass-receiver', `pass to ${e.toIdx}`)
        if (dist(e.from, e.target) > 65) v('pass-length', `pass of ${dist(e.from, e.target).toFixed(1)}m`)
      }

      // Offside positions at the moment of the kick.
      const exempt = !e.header && restartEv?.type === 'restart' && ['throwIn', 'corner', 'goalKick'].includes(restartEv.restart)
      const kt = team(e.byIdx)
      const oppXs = s.players
        .map((p, i) => ({ p, i }))
        .filter(({ p, i }) => p.team !== kt && at.players[i].onPitch)
        .map(({ i }) => attackX(at.players[i].x, kt, half))
        .sort((a, b) => b - a)
      const line = Math.max(oppXs[1] ?? 0, attackX(e.from.x, kt, half), HALFWAY_X)
      const offside = new Set<number>()
      if (!exempt) {
        s.players.forEach((p, i) => {
          if (p.team === kt && i !== e.byIdx && at.players[i].onPitch && attackX(at.players[i].x, kt, half) > line + EPS) offside.add(i)
        })
      }
      pending = { tick: s.tick, team: kt, offside }
    }

    // --- Fouls: the fouler was close enough; penalty iff the foul was in his own box.
    for (const e of events) {
      if (e.type === 'tackle' || e.type === 'foul') {
        const d = dist(C.players[e.byIdx], C.players[e.onIdx])
        if (d > TACKLE_RANGE + EPS) v(`${e.type}-range`, `${e.type} from ${d.toFixed(2)}m`)
        const gained = events.some((g) => g.type === 'possession' && g.idx === e.onIdx)
        if (P.ball.ownerIdx !== e.onIdx && !gained) v(`${e.type}-carrier`, `${e.onIdx} didn't have the ball`)
      }
      if (e.type === 'foul') {
        if (dist(e.pos, C.players[e.onIdx]) > EPS) v('foul-pos', `foul logged at ${fmt(e.pos)} but player was at ${fmt(C.players[e.onIdx])}`)
        const inOwnBox = inBox(e.pos, ownGoalX(team(e.byIdx), half))
        if (inOwnBox !== (e.award === 'penalty')) v('foul-award', `${e.award} for a foul at ${fmt(e.pos)} (in box: ${inOwnBox})`)
      }
    }

    // --- Goals and balls out of play happen on the lines, where the ball actually was.
    for (const e of events) {
      if (e.type === 'goal') {
        tally[e.team]++
        const onLine = Math.abs(e.pos.x) < EPS || Math.abs(e.pos.x - PITCH_LENGTH) < EPS
        if (!onLine || Math.abs(e.pos.y - CENTER.y) >= GOAL_HALF_WIDTH) v('goal-pos', `goal crossing at ${fmt(e.pos)}`)
        if (e.height >= UNDER_BAR) v('goal-height', `goal given for a ball ${e.height.toFixed(2)}m up`)
        if (Math.abs(e.pos.x - oppGoalX(e.team, half)) > EPS) v('goal-end', `goal for team ${e.team} in the wrong goal`)
        if (dist(P.ball, e.pos) > BALL_STEP + DRIBBLE_OFFSET) v('goal-path', `ball was ${dist(P.ball, e.pos).toFixed(1)}m from the line`)
      }
      if (e.type === 'out') {
        const onGoalLine = Math.abs(e.pos.x) < EPS || Math.abs(e.pos.x - PITCH_LENGTH) < EPS
        const onTouchline = Math.abs(e.pos.y) < EPS || Math.abs(e.pos.y - PITCH_WIDTH) < EPS
        if (!onGoalLine && !onTouchline) v('out-pos', `out at ${fmt(e.pos)}`)
        if (onGoalLine && Math.abs(e.pos.y - CENTER.y) < GOAL_HALF_WIDTH - 0.11 && e.height < UNDER_BAR) {
          v('out-goal', `ball out under the bar between the posts at ${fmt(e.pos)}`)
        }
        if ((e.award === 'throwIn') !== onTouchline) v('out-award', `${e.award} for ball out at ${fmt(e.pos)}`)
        if (dist(P.ball, e.pos) > BALL_STEP + DRIBBLE_OFFSET) v('out-path', `ball was ${dist(P.ball, e.pos).toFixed(1)}m from the line`)
      }
    }

    // --- Restarts are taken only once players are where the laws require.
    if (restartEv?.type === 'restart') {
      if (restartEv.forced) forcedRestarts++
      else checkRestart(s, P, restartEv, half, v)
    }
    if (C.phase === 'restart' && (C.ball.ownerIdx !== null || Math.hypot(C.ball.vx, C.ball.vy) > EPS)) {
      v('dead-ball', 'ball moving or owned while play is stopped')
    }

    // --- Nobody sits on the ball forever.
    heldTicks = C.ball.ownerIdx !== null && C.ball.ownerIdx === P.ball.ownerIdx ? heldTicks + 1 : 0
    if (heldTicks === 200) v('stall', `player ${C.ball.ownerIdx} has held the ball for 20s`)

    // --- Loose balls don't just sit there.
    const still = C.phase === 'play' && C.ball.ownerIdx === null && Math.hypot(C.ball.vx, C.ball.vy) < 0.05
    stillBallTicks = still ? stillBallTicks + 1 : 0
    if (stillBallTicks === 50) v('dead-loose-ball', `loose ball untouched for 5s at ${fmt(C.ball)}`)
  }

  function checkRestart(
    s: MatchState,
    P: Frame,
    e: Extract<MatchEvent, { type: 'restart' }>,
    half: 1 | 2,
    v: (rule: string, detail: string) => void,
  ): void {
    const taker = P.players[e.takerIdx]
    const on = s.players.map((p, i) => ({ p, i, pos: P.players[i] })).filter((x) => x.pos.onPitch)
    const opps = on.filter((x) => x.p.team !== e.team)
    const fail = (why: string): void => v(`restart-${e.restart}`, why)
    if (dist(taker, e.spot) > 1.0) fail(`taker ${dist(taker, e.spot).toFixed(2)}m from the spot`)
    switch (e.restart) {
      case 'kickoff':
        for (const x of on) if (attackX(x.pos.x, x.p.team, half) > HALFWAY_X + EPS) fail(`player ${x.i} in the opposition half`)
        for (const x of opps) if (dist(x.pos, CENTER) < CENTER_CIRCLE_RADIUS) fail(`player ${x.i} inside the centre circle`)
        break
      case 'penalty': {
        const goalX = ownGoalX((1 - e.team) as Side, half)
        for (const x of on) {
          if (x.i === e.takerIdx) continue
          if (x.p.team !== e.team && x.p.slot.role === 'GK') {
            if (Math.abs(x.pos.x - goalX) > 1) fail(`keeper ${Math.abs(x.pos.x - goalX).toFixed(2)}m off his line`)
          } else if (inBox(x.pos, goalX) || dist(x.pos, e.spot) < CENTER_CIRCLE_RADIUS) fail(`player ${x.i} encroaching`)
        }
        break
      }
      case 'freeKick':
      case 'corner':
        for (const x of opps) if (dist(x.pos, e.spot) < CENTER_CIRCLE_RADIUS - 0.2) fail(`player ${x.i} ${dist(x.pos, e.spot).toFixed(2)}m from the ball`)
        break
      case 'goalKick':
        for (const x of opps) if (inBox(x.pos, ownGoalX(e.team, half))) fail(`player ${x.i} in the box`)
        break
      case 'throwIn':
        for (const x of opps) if (dist(x.pos, e.spot) < 2 - EPS) fail(`player ${x.i} within 2m of the thrower`)
        break
    }
  }

  const tallied = tally as [number, number]
  if (tallied[0] !== state.score[0] || tallied[1] !== state.score[1]) {
    violations.push({ tick: state.tick, rule: 'score', detail: `goal events ${tallied} but score ${state.score}` })
  }
  return { state, violations, forcedRestarts, frames: opts.keepFrames ? frames : undefined }
}
