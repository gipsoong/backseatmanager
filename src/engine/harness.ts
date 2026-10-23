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
  AERIAL_HEIGHT,
  ARRIVAL_FROM,
  OVERLAP_FROM,
  OVERLAP_TO,
  OVERLAP_WIDE,
  BACK_TO_GOAL_SPEED,
  TIGHT_MARK,
  CONTROL_RADIUS,
  CROSSBAR_HEIGHT,
  DRIBBLE_OFFSET,
  DT,
  BLOCK_NEAR,
  DUEL_REACH,
  GK_EXTRA_REACH,
  GK_HAND_REACH,
  HEADER_REACH,
  KEEPER_RELEASE_TICKS,
  KEEPER_BODY_REACH,
  MAX_BALL_SPEED,
  MAX_FREE_KICK_SHOT_DISTANCE,
  MAX_SHOT_DISTANCE,
  OVERRUN,
  SLIDE_TACKLE_DISTANCE,
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
/** Slower than this (m/s) a man on the ball is standing on it; for this long (ticks) is too long. */
const HOLD_STILL = 0.5
const HOLD_LIMIT_TICKS = 50
/** Passes straight back and forth between the same two men, in a row, that make a loop (the old keeper-centre-back one). */
const PING_PONG_LIMIT = 6

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
  // The frame before prev: how everyone was moving going into the tick being checked.
  let prev2: Frame | null = null
  let pending: PendingKick | null = null
  // The last pass still untouched: how an opponent won it is judged against it.
  let livePass: Extract<MatchEvent, { type: 'pass' }> | null = null
  // A keeper's release from his hands (kicked from inside his own box): no opponent may play it at source.
  let release: { tick: number; team: Side } | null = null
  let stillBallTicks = 0
  let heldTicks = 0
  let standingTicks = 0
  // The last pass's two men, and how many passes in a row have gone back and forth between them.
  let lastPair: { by: number; to: number } | null = null
  let pingPong = 0
  // Penalties: each kick's taker (from its restart) and every kick, in order.
  let shootoutTaker: { idx: number; team: Side } | null = null
  let shootoutKicks: { team: Side; scored: boolean }[] | null = null
  const tally: [number, number] = [0, 0]
  // Everyone who has been on the pitch, and substitutions made, by team.
  const everOn = new Set<number>()
  const subsMade: [number, number] = [0, 0]
  // Each player's top speed going into the tick being checked.
  let topSpeed: number[] = []

  const v0 = (tick: number, rule: string, detail: string): void => {
    violations.push({ tick, rule, detail })
  }
  const state = runMatch(home, away, config, (s, events) => {
    opts.tamper?.(s)
    const cur = frameOf(s)
    if (opts.keepFrames) frames.push(cur)
    if (!prev) cur.players.forEach((p, i) => p.onPitch && everOn.add(i))
    if (prev) {
      const v = (rule: string, detail: string): void => {
        violations.push({ tick: s.tick, rule, detail })
      }
      checkTick(s, prev, cur, events, v)
    }
    prev2 = prev
    prev = cur
    topSpeed = s.players.map((p) => p.maxSpeed)
  })

  function checkTick(s: MatchState, P: Frame, C: Frame, events: MatchEvent[], v: (rule: string, detail: string) => void): void {
    // Players are repositioned for a new period or the shootout, so positions can't be checked on that tick.
    const newPeriod = events.find((e) => e.type === 'halfTime' || e.type === 'extraTime' || e.type === 'shootout')
    if (newPeriod) {
      for (const e of events) if (e.type === 'goal') tally[e.team]++
      // Extra time and penalties only for a knockout tie that's level (counting a first leg).
      const c = config.knockout ? (config.knockout.carried ?? [0, 0]) : null
      const level = c !== null && tally[0] + c[0] === tally[1] + c[1]
      if ((newPeriod.type === 'shootout' || (newPeriod.type === 'extraTime' && newPeriod.period === 3)) && !level) v0(s.tick, 'knockout-level', `${newPeriod.type} with the tie at ${tally} (carried ${c})`)
      if (newPeriod.type === 'shootout') shootoutKicks = []
      pending = null
      return
    }
    const half = C.half
    const team = (i: number): Side => s.players[i].team
    const keeperInBox = (i: number, pos: Vec): boolean => s.players[i].slot.role === 'GK' && inBox(pos, ownGoalX(team(i), half))
    const reach = (i: number, pos: Vec): number =>
      keeperInBox(i, pos) ? CONTROL_RADIUS + (GK_EXTRA_REACH * s.players[i].def.attrs.diving) / 20 : CONTROL_RADIUS
    // A header: as high as he jumps (2.4 m at a jumping of 12, 1 cm a point either way).
    const reachHeight = (i: number, pos: Vec): number => (keeperInBox(i, pos) ? GK_HAND_REACH : HEADER_REACH + (s.players[i].def.attrs.jumping - 12) * 0.01)
    const UNDER_BAR = CROSSBAR_HEIGHT - 0.11
    const restartEv = events.find((e) => e.type === 'restart')

    // --- Movement: nobody teleports or outruns their top speed.
    // (Against his top speed as it was during the tick: tiring lowers it at the end of each tick.)
    s.players.forEach((_, i) => {
      if (!P.players[i].onPitch || !C.players[i].onPitch) return
      const d = dist(P.players[i], C.players[i])
      const top = topSpeed[i] ?? Infinity
      if (d > top * DT + EPS) v('speed', `player ${i} moved ${d.toFixed(3)}m in one tick (max ${(top * DT).toFixed(3)})`)
    })

    // --- Nobody comes on or goes off except by a substitution at a stoppage, or a red card.
    const subs = events.filter((e) => e.type === 'sub')
    s.players.forEach((_, i) => {
      const was = P.players[i].onPitch
      const is = C.players[i].onPitch
      if (!was && is && !subs.some((e) => e.onIdx === i)) v('sub-on', `player ${i} appeared without coming on`)
      if (was && !is && !subs.some((e) => e.offIdx === i) && !events.some((e) => e.type === 'card' && e.color === 'red' && e.idx === i)) {
        v('sub-off', `player ${i} left without being substituted or sent off`)
      }
    })
    for (const e of subs) {
      if (P.phase !== 'restart' && !restartEv) v('sub-stoppage', `substitution in open play`)
      if (!P.players[e.offIdx].onPitch) v('sub-off', `${e.offIdx} substituted but wasn't on`)
      if (everOn.has(e.onIdx)) v('sub-on', `${e.onIdx} came on but had already played`)
      if (++subsMade[e.team] > 5) v('sub-count', `team ${e.team} made a sixth substitution`)
      // He takes the place of the man coming off (and may then move one tick's worth).
      const d = dist(P.players[e.offIdx], C.players[e.onIdx])
      if (d > s.players[e.onIdx].baseSpeed * DT + EPS) v('sub-spot', `${e.onIdx} came on ${d.toFixed(2)}m from where ${e.offIdx} went off`)
      everOn.add(e.onIdx)
    }
    for (const e of events) if (e.type === 'injury' && !P.players[e.idx].onPitch && !C.players[e.idx].onPitch) v('injury', `${e.idx} injured off the pitch`)

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
      if (e.dive !== undefined && e.dive !== d > KEEPER_BODY_REACH) v('save-style', `dive=${e.dive} for a save ${d.toFixed(2)}m from the keeper`)
    }

    // --- A late run into the box starts only with a teammate on the ball in the final third, from
    // behind the ball and outside the box.
    for (const e of events) {
      if (e.type !== 'run' || e.kind !== 'late') continue
      const owner = P.ball.ownerIdx
      const bx = attackX(P.ball.x, team(e.idx), half)
      const rx = attackX(P.players[e.idx].x, team(e.idx), half)
      if (owner === null || team(owner) !== team(e.idx) || owner === e.idx) v('late-run', `late run by ${e.idx} without a teammate on the ball`)
      else if (bx < ARRIVAL_FROM - EPS) v('late-run', `late run by ${e.idx} with the ball ${bx.toFixed(1)}m up`)
      if (rx > bx + 2 + EPS || inBox(P.players[e.idx], oppGoalX(team(e.idx), half))) v('late-run', `late run by ${e.idx} from ${rx.toFixed(1)}m, ball at ${bx.toFixed(1)}m`)
    }

    // --- An overlap starts only by a full-back, with a teammate on the ball out wide on his side of
    // the pitch in their half, from behind the ball.
    for (const e of events) {
      if (e.type !== 'run' || e.kind !== 'overlap') continue
      const owner = P.ball.ownerIdx
      const bx = attackX(P.ball.x, team(e.idx), half)
      const rx = attackX(P.players[e.idx].x, team(e.idx), half)
      const wide = P.ball.y - CENTER.y
      if (s.players[e.idx].slot.role !== 'FB') v('overlap', `overlap by ${e.idx}, a ${s.players[e.idx].slot.role}`)
      if (owner === null || team(owner) !== team(e.idx) || owner === e.idx) v('overlap', `overlap by ${e.idx} without a teammate on the ball`)
      else if (bx < OVERLAP_FROM - EPS || bx > OVERLAP_TO + EPS || Math.abs(wide) < OVERLAP_WIDE - EPS) v('overlap', `overlap by ${e.idx} with the ball at ${fmt(P.ball)}`)
      else if (Math.sign(P.players[e.idx].y - CENTER.y) !== Math.sign(wide) && Math.abs(P.players[e.idx].y - CENTER.y) > 3) v('overlap', `overlap by ${e.idx} from the far side`)
      if (rx > bx + 2 + EPS) v('overlap', `overlap by ${e.idx} from ${rx.toFixed(1)}m, ball at ${bx.toFixed(1)}m`)
    }

    // --- An opponent's pass won: taken off the receiver (he was at the ball), blocked right by the
    // passer, picked up after running on past where it was aimed, or cut out on its way.
    for (const e of events) {
      if (e.type === 'pass') livePass = e
      else if (e.type === 'possession' && livePass && team(e.idx) !== team(livePass.byIdx) && e.via === 'interception') {
        const pass = livePass
        const along = (e.contact.x - pass.from.x) * (pass.target.x - pass.from.x) + (e.contact.y - pass.from.y) * (pass.target.y - pass.from.y)
        const length = dist(pass.from, pass.target)
        const expect =
          dist(C.players[pass.toIdx], e.contact) <= DUEL_REACH + EPS
            ? 'duel'
            : dist(pass.from, e.contact) <= BLOCK_NEAR + EPS
              ? 'block'
              : length > 0 && along / length > length + OVERRUN
                ? 'loose'
                : 'cut'
        if (e.won !== expect) v('pass-won', `pass to ${pass.toIdx} won by ${e.idx} as '${e.won}', positions say '${expect}'`)
        livePass = null
      } else if (e.type === 'possession' || e.type === 'deflection' || e.type === 'offside' || e.type === 'clearance' || e.type === 'shot' || e.type === 'tackle' || e.type === 'out' || e.type === 'goal' || e.type === 'foul') {
        if (e.type === 'possession' && e.won) v('pass-won', `${e.idx} 'won' a pass that wasn't an opponent's live pass`)
        livePass = null
      }
    }

    // --- Kicks and touches, in the order they happened (a header is a touch and then a kick).
    // Offside is called if and only if the first player to touch a kick was offside when it was played.
    for (const e of events) {
      if (e.type === 'tackle' || e.type === 'goal' || e.type === 'out' || e.type === 'foul') pending = null

      if (e.type === 'possession' || e.type === 'deflection' || e.type === 'offside') {
        const rel = release as { tick: number; team: Side } | null
        if (rel && team(e.idx) !== rel.team && s.tick - rel.tick < KEEPER_RELEASE_TICKS) {
          v('keeper-release', `player ${e.idx} played the keeper's release ${s.tick - rel.tick} ticks after it left his hands`)
        }
        release = null
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
      // Nobody shoots on the spin: going away from goal with a man tight goal-side of him, he has to turn first.
      if (e.type === 'shot' && !e.header && !byRestart && prev2) {
        const PP = prev2 as Frame
        const vx = (P.players[e.byIdx].x - PP.players[e.byIdx].x) / DT
        const vy = (P.players[e.byIdx].y - PP.players[e.byIdx].y) / DT
        const speed = Math.hypot(vx, vy)
        const goal = { x: oppGoalX(team(e.byIdx), half), y: CENTER.y }
        const gd = dist(P.players[e.byIdx], goal)
        const away = speed > BACK_TO_GOAL_SPEED + 0.01 && (vx * (goal.x - P.players[e.byIdx].x) + vy * (goal.y - P.players[e.byIdx].y)) / (speed * gd) < -0.18
        const mx = attackX(P.players[e.byIdx].x, team(e.byIdx), half)
        const tight = s.players.some(
          (o, i) => o.team !== team(e.byIdx) && o.slot.role !== 'GK' && P.players[i].onPitch && dist(P.players[i], P.players[e.byIdx]) < TIGHT_MARK - 0.01 && attackX(P.players[i].x, team(e.byIdx), half) > mx + 0.01,
        )
        if (away && tight) v('shot-on-the-spin', `${e.byIdx} shot going away from goal at ${speed.toFixed(1)}m/s with a man on his back`)
      }
      if (e.type === 'pass') {
        pingPong = lastPair && lastPair.by === e.toIdx && lastPair.to === e.byIdx ? pingPong + 1 : 1
        lastPair = { by: e.byIdx, to: e.toIdx }
        if (pingPong === PING_PONG_LIMIT) v('ping-pong', `${PING_PONG_LIMIT} passes in a row between ${e.byIdx} and ${e.toIdx}`)
        if (team(e.toIdx) !== team(e.byIdx) || !C.players[e.toIdx].onPitch) v('pass-receiver', `pass to ${e.toIdx}`)
        if (dist(e.from, e.target) > 65) v('pass-length', `pass of ${dist(e.from, e.target).toFixed(1)}m`)
      }

      const kicker = s.players[e.byIdx]
      const keeperInHands = !e.header && kicker.slot.role === 'GK' && inBox(P.players[e.byIdx], ownGoalX(kicker.team, half))
      release = keeperInHands ? { tick: s.tick, team: kicker.team } : null

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
        // Sliding in from beyond standing reach: only as far as his sliding takes him (30% to all of
        // the gap between standing reach and the longest slide, by sliding tackle).
        const slider = s.players[e.byIdx].def.attrs.slidingTackle
        const slideMax = SLIDE_TACKLE_DISTANCE + (TACKLE_RANGE - SLIDE_TACKLE_DISTANCE) * Math.min(1, 0.3 + (slider / 20) * 0.7)
        if (e.type === 'tackle' && d > slideMax + EPS) v('slide-range', `slide from ${d.toFixed(2)}m (his reach ${slideMax.toFixed(2)}m)`)
        if ((e.style === 'slide') !== d > SLIDE_TACKLE_DISTANCE) v('tackle-style', `${e.style} ${e.type} from ${d.toFixed(2)}m`)
        if (e.type === 'tackle' && (e.beaten !== undefined) === e.won) v('tackle-beaten', `won=${e.won} but beaten=${e.beaten}`)
        const gained = events.some((g) => g.type === 'possession' && g.idx === e.onIdx)
        if (e.type === 'foul' && e.aerial) {
          // Both going for a ball in the air: it has to be up, and within his reach this tick.
          // Struck this same tick (a header right off a kick): measure from where it was struck;
          // its height isn't in the frame yet.
          const struck = events.find((g) => g.type === 'pass' || g.type === 'clearance' || g.type === 'shot')
          const from = struck && 'from' in struck ? struck.from : P.ball
          const near = dist(from, C.players[e.onIdx])
          // Highest it gets this tick (rising at most at its vertical speed).
          const top = struck ? Infinity : P.ball.z + Math.max(0, P.ball.vz) * DT
          const travel = struck ? BALL_STEP : Math.hypot(P.ball.vx, P.ball.vy) * DT
          if (top < AERIAL_HEIGHT - EPS || near > CONTROL_RADIUS + travel + 1 + EPS) {
            v('foul-aerial', `aerial foul on ${e.onIdx} with the ball ${near.toFixed(2)}m away at ${P.ball.z.toFixed(2)}m up`)
          }
        } else if (P.ball.ownerIdx !== e.onIdx && !gained) v(`${e.type}-carrier`, `${e.onIdx} didn't have the ball`)
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
        if ((e.celebration === null) !== e.ownGoal) v('goal-celebration', `celebration ${e.celebration} for ownGoal=${e.ownGoal}`)
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
        // Exactly at a corner flag it has crossed both lines: either restart is right.
        if ((e.award === 'throwIn') !== onTouchline && !(onGoalLine && onTouchline)) v('out-award', `${e.award} for ball out at ${fmt(e.pos)}`)
        if (dist(P.ball, e.pos) > BALL_STEP + DRIBBLE_OFFSET) v('out-path', `ball was ${dist(P.ball, e.pos).toFixed(1)}m from the line`)
      }
    }

    // --- Penalties: kicks alternate, each by the player who stepped up, scored iff the ball
    // crossed the goal line between the posts and under the bar.
    if (shootoutKicks && restartEv?.type === 'restart') shootoutTaker = { idx: restartEv.takerIdx, team: restartEv.team }
    for (const e of events) {
      if (e.type === 'goal' && shootoutKicks) v('shootout-goal', 'a goal event during penalties')
      if (e.type !== 'shootoutKick') continue
      if (!shootoutKicks) {
        v('shootout-kick', 'a kick before the shootout')
        continue
      }
      const last = shootoutKicks.at(-1)
      if (last && last.team === e.team) v('shootout-order', `team ${e.team} kicked twice running`)
      if (!shootoutTaker || shootoutTaker.idx !== e.takerIdx || shootoutTaker.team !== e.team || team(e.takerIdx) !== e.team) {
        v('shootout-taker', `kick credited to ${e.takerIdx} (team ${e.team}), stepped up: ${shootoutTaker?.idx}`)
      }
      const onGoalLine = Math.abs(e.pos.x - PITCH_LENGTH) < EPS && Math.abs(e.pos.y - CENTER.y) < GOAL_HALF_WIDTH
      if (e.scored && (!onGoalLine || e.height >= UNDER_BAR)) v('shootout-goal-pos', `scored at ${fmt(e.pos)}, ${e.height.toFixed(2)}m up`)
      if (!e.scored && onGoalLine && Math.abs(e.pos.y - CENTER.y) < GOAL_HALF_WIDTH - 0.11 && e.height < UNDER_BAR) {
        v('shootout-miss-pos', `missed, but crossed at ${fmt(e.pos)} ${e.height.toFixed(2)}m up`)
      }
      if (dist(P.ball, e.pos) > BALL_STEP + DRIBBLE_OFFSET) v('shootout-path', `ball was ${dist(P.ball, e.pos).toFixed(1)}m from ${fmt(e.pos)}`)
      shootoutKicks.push({ team: e.team, scored: e.scored })
      shootoutTaker = null
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

    // --- A man waiting on the ball for a run (holding it up) gives it up or moves off within a few
    // seconds: he doesn't stand on it.
    const owner = C.ball.ownerIdx
    const standing = C.phase === 'play' && owner !== null && owner === P.ball.ownerIdx && dist(P.players[owner], C.players[owner]) < HOLD_STILL * DT
    standingTicks = standing ? standingTicks + 1 : 0
    if (standingTicks === HOLD_LIMIT_TICKS) v('hold-on', `player ${owner} has stood on the ball for ${HOLD_LIMIT_TICKS / 10}s at ${fmt(C.players[owner!])}`)

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
      case 'corner': {
        // Set up before it's taken: attackers up in the box, defenders back in it with them.
        const goalX = ownGoalX((1 - e.team) as Side, half)
        const up = on.filter((x) => x.p.team === e.team && x.i !== e.takerIdx && inBox(x.pos, goalX)).length
        const back = opps.filter((x) => x.p.slot.role !== 'GK' && inBox(x.pos, goalX)).length
        if (!e.forced && (up < 3 || back < 3)) fail(`taken with ${up} attackers and ${back} defenders in the box`)
        for (const x of opps) if (dist(x.pos, e.spot) < CENTER_CIRCLE_RADIUS - 0.2) fail(`player ${x.i} ${dist(x.pos, e.spot).toFixed(2)}m from the ball`)
        break
      }
      case 'freeKick':
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

  // A shootout ends as soon as it's decided, and not before.
  // (Set inside the tick callback, which the compiler can't see.)
  const kicks = shootoutKicks as { team: Side; scored: boolean }[] | null
  if (kicks) {
    const decidedAfter = (n: number): boolean => {
      const ks = kicks.slice(0, n)
      const goals = [0, 1].map((t) => ks.filter((k) => k.team === t && k.scored).length)
      const taken = [0, 1].map((t) => ks.filter((k) => k.team === t).length)
      if (Math.max(...taken) <= 5) return goals[0] + (5 - taken[0]) < goals[1] || goals[1] + (5 - taken[1]) < goals[0]
      return taken[0] === taken[1] && goals[0] !== goals[1]
    }
    const n = kicks.length
    if (!decidedAfter(n)) v0(state.tick, 'shootout-end', `ended undecided after ${n} kicks`)
    for (let i = 1; i < n; i++) if (decidedAfter(i)) v0(state.tick, 'shootout-end', `decided after ${i} kicks but went on to ${n}`)
  } else if (config.knockout) {
    const c = config.knockout.carried ?? [0, 0]
    if (tally[0] + c[0] === tally[1] + c[1]) v0(state.tick, 'knockout-level', 'a knockout tie ended level')
  }

  const tallied = tally as [number, number]
  if (tallied[0] !== state.score[0] || tallied[1] !== state.score[1]) {
    violations.push({ tick: state.tick, rule: 'score', detail: `goal events ${tallied} but score ${state.score}` })
  }
  return { state, violations, forcedRestarts, frames: opts.keepFrames ? frames : undefined }
}
