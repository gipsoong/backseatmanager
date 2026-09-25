/**
 * The match loop. One tick = DT seconds. Order within a tick:
 *   1. decisions  — restart taken / ball carrier acts, using positions at the start of the tick
 *   2. movement   — every player steps towards their target (speed + acceleration capped)
 *   3. ball       — the ball moves; the first thing it meets along its path (a player, a line,
 *                   a post) resolves what happens
 *   4. challenges — defenders now within range of the carrier may tackle (or foul)
 *   5. clock      — stats, half-time, full-time
 * Outcomes (goal, save, offside, penalty vs free kick, who wins a loose ball) are always derived
 * from where the ball and players actually are at that moment.
 */
import {
  BOX_DEPTH,
  BOX_HALF_WIDTH,
  CENTER,
  GOAL_HALF_WIDTH,
  PITCH_LENGTH,
  PITCH_WIDTH,
  POST_RADIUS,
  type Vec,
  add,
  clamp,
  closestT,
  dist,
  inPenaltyArea,
  len,
  lerp,
  norm,
  oppGoalX,
  ownGoalX,
  penaltySpot,
  scale,
  sub,
  vec,
} from './geometry.ts'
import {
  AERIAL_HEIGHT,
  CONTROLLABLE_SPEED,
  CROSSBAR_HEIGHT,
  DRIBBLE_OFFSET,
  DT,
  KICKER_IMMUNITY_TICKS,
  MAX_BALL_SPEED,
  MAX_FREE_KICK_SHOT_DISTANCE,
  PLAYER_ACCEL,
  RESTART_SPOT_TOLERANCE,
  RESTART_TIMEOUT_TICKS,
  TACKLE_RANGE,
  TICKS_PER_MINUTE,
} from './constants.ts'
import { advanceBall, loft, loftTime, shotVz } from './physics.ts'
import {
  type Action,
  type MoveIntent,
  af,
  chooseAction,
  chooseTaker,
  kickoffPosition,
  maybeStartRuns,
  offsidePositions,
  passKinematics,
  pickChasers,
  playIntent,
  reachHeightOf,
  reachOf,
  restartIntent,
  takerSpot,
  wf,
  xgFrom,
} from './ai.ts'
import { restartConditionsMet } from './rules.ts'
import { Rng } from './rng.ts'
import { FORMATIONS } from './teams.ts'
import type {
  Frame,
  Kick,
  MatchConfig,
  MatchEvent,
  MatchState,
  PlayerState,
  Restart,
  RestartType,
  Side,
  TeamDef,
  TeamStats,
} from './types.ts'

const XG_CALIBRATION = 0.6

type EventBody = MatchEvent extends infer E ? (E extends MatchEvent ? Omit<E, 'tick' | 'clock'> : never) : never

const emptyStats = (): TeamStats => ({
  possessionTicks: 0,
  shots: 0,
  shotsOnTarget: 0,
  xg: 0,
  passes: 0,
  passesCompleted: 0,
  fouls: 0,
  corners: 0,
  offsides: 0,
  yellowCards: 0,
  redCards: 0,
})

export function createMatch(home: TeamDef, away: TeamDef, config: MatchConfig): MatchState {
  const rng = new Rng(config.seed)
  const teams: [TeamDef, TeamDef] = [home, away]
  const players: PlayerState[] = []
  for (const team of [0, 1] as const) {
    const slots = FORMATIONS[teams[team].formation]
    teams[team].players.forEach((def, i) => {
      players.push({
        idx: players.length,
        team,
        def,
        slot: slots[i],
        pos: vec(0, 0),
        vel: vec(0, 0),
        maxSpeed: 5.8 + (def.attrs.pace / 20) * 2.8,
        onPitch: true,
        yellowCards: 0,
        tackleReadyAt: 0,
        touchReadyAt: 0,
        runUntil: 0,
      })
    })
  }
  const halfTicks = Math.round((config.halfLengthMinutes ?? 45) * TICKS_PER_MINUTE)
  const s: MatchState = {
    teams,
    rng,
    tick: 0,
    halfStartTick: 0,
    half: 1,
    addedTicks: rng.int(0, 3) * TICKS_PER_MINUTE + rng.int(0, 59) * 10,
    halfTicks,
    players,
    ball: emptyBall(),
    score: [0, 0],
    phase: { kind: 'play' },
    stats: [emptyStats(), emptyStats()],
    events: [],
    decisionAt: 0,
    possessedSince: 0,
    dribbleTarget: null,
  }
  for (const p of players) p.pos = kickoffPosition(s, p)
  setRestart(s, 'kickoff', 0, CENTER)
  const r = (s.phase as { kind: 'restart'; restart: Restart }).restart
  s.players[r.takerIdx].pos = takerSpot(s, r)
  return s
}

function emptyBall() {
  return {
    pos: { ...CENTER },
    vel: vec(0, 0),
    z: 0,
    vz: 0,
    ownerIdx: null,
    lastTouchIdx: null,
    kick: null,
    touchedSinceKick: false,
    receivedFromIdx: null,
  }
}

export function clockString(s: MatchState): string {
  return formatClock(s.half, s.tick - s.halfStartTick, s.halfTicks)
}

/** Broadcast clock ("23'", "45+2'") for a tick count into a half. */
export function formatClock(half: 1 | 2, elapsedTicks: number, halfTicks: number): string {
  const halfMinutes = halfTicks / TICKS_PER_MINUTE
  const base = (half - 1) * halfMinutes
  if (elapsedTicks < halfTicks) return `${Math.floor(base + elapsedTicks / TICKS_PER_MINUTE) + 1}'`
  const extra = Math.floor((elapsedTicks - halfTicks) / TICKS_PER_MINUTE) + 1
  return `${base + halfMinutes}+${extra}'`
}

function emit(s: MatchState, out: MatchEvent[], e: EventBody): void {
  const ev = { ...e, tick: s.tick, clock: clockString(s) } as MatchEvent
  s.events.push(ev)
  out.push(ev)
}

// ---------------------------------------------------------------------------
// Public API

/** Advance one tick. Returns the events emitted during it. */
export function step(s: MatchState): MatchEvent[] {
  const out: MatchEvent[] = []
  if (s.phase.kind === 'fullTime') return out
  s.tick++

  // 1. decisions
  if (s.phase.kind === 'restart') tryTakeRestart(s, out)
  else if (s.ball.ownerIdx !== null && s.tick >= s.decisionAt) carrierDecides(s, out)

  // 2. movement
  if (s.phase.kind === 'play') maybeStartRuns(s)
  const chasers = s.phase.kind === 'play' ? pickChasers(s) : new Map<number, number>()
  const phase = s.phase
  for (const p of s.players) {
    if (!p.onPitch) continue
    const intent: MoveIntent = phase.kind === 'restart' ? restartIntent(s, p, phase.restart) : playIntent(s, p, chasers)
    movePlayer(p, intent)
  }

  // 3. ball
  if (s.phase.kind === 'play') updateBall(s, out)

  // 4. challenges
  if (s.phase.kind === 'play' && s.ball.ownerIdx !== null) challenges(s, out)

  // 5. clock
  if (s.phase.kind === 'play') {
    const t = s.ball.lastTouchIdx
    if (t !== null) s.stats[s.players[t].team].possessionTicks++
  }
  checkPeriodEnd(s, out)
  return out
}

/** Run a whole match headless. `onTick` sees the state after every tick. */
export function runMatch(
  home: TeamDef,
  away: TeamDef,
  config: MatchConfig,
  onTick?: (s: MatchState, events: MatchEvent[]) => void,
): MatchState {
  const s = createMatch(home, away, config)
  onTick?.(s, [])
  while (s.phase.kind !== 'fullTime') {
    const events = step(s)
    onTick?.(s, events)
  }
  return s
}

export function frameOf(s: MatchState): Frame {
  return {
    tick: s.tick,
    phase: s.phase.kind,
    half: s.half,
    ball: { x: s.ball.pos.x, y: s.ball.pos.y, z: s.ball.z, vx: s.ball.vel.x, vy: s.ball.vel.y, ownerIdx: s.ball.ownerIdx },
    players: s.players.map((p) => ({ x: p.pos.x, y: p.pos.y, onPitch: p.onPitch })),
  }
}

// ---------------------------------------------------------------------------
// Movement

function movePlayer(p: PlayerState, intent: MoveIntent): void {
  const d = sub(intent.target, p.pos)
  const L = len(d)
  const wanted = Math.min(p.maxSpeed * intent.urgency, L / 0.4)
  const desired = scale(norm(d), wanted)
  let dv = sub(desired, p.vel)
  const maxDv = PLAYER_ACCEL * DT
  if (len(dv) > maxDv) dv = scale(norm(dv), maxDv)
  p.vel = add(p.vel, dv)
  if (len(p.vel) > p.maxSpeed) p.vel = scale(norm(p.vel), p.maxSpeed)
  if (L < 0.05 && len(p.vel) < 0.3) p.vel = vec(0, 0)
  const next = add(p.pos, scale(p.vel, DT))
  p.pos = vec(clamp(next.x, 0, PITCH_LENGTH), clamp(next.y, 0, PITCH_WIDTH))
}

function facing(s: MatchState, p: PlayerState): Vec {
  if (len(p.vel) > 0.5) return norm(p.vel)
  return norm(sub(vec(oppGoalX(p.team, s.half), CENTER.y), p.pos))
}

// ---------------------------------------------------------------------------
// Decisions

function carrierDecides(s: MatchState, out: MatchEvent[]): void {
  const p = s.players[s.ball.ownerIdx!]
  const isKeeperWithBall = p.slot.role === 'GK' && inPenaltyArea(p.pos, ownGoalX(p.team, s.half))
  const action = chooseAction(s, p, {
    allowShot: true,
    allowDribble: !isKeeperWithBall,
    minPass: 4,
    maxPass: isKeeperWithBall ? 50 : 40,
  })
  execute(s, p, action, null, out)
}

function execute(s: MatchState, p: PlayerState, action: Action, restart: RestartType | null, out: MatchEvent[]): void {
  s.dribbleTarget = null
  switch (action.kind) {
    case 'hold':
      s.decisionAt = s.tick + s.rng.int(2, 4)
      return
    case 'dribble':
      s.dribbleTarget = action.target
      s.decisionAt = s.tick + s.rng.int(5, 9)
      return
    case 'pass': {
      const d = dist(s.ball.pos, action.target)
      const sigma = ((21 - p.def.attrs.passing) / 20) * d * (action.lofted ? 0.075 : 0.05)
      const err = vec(clamp(s.rng.gauss() * sigma, -d * 0.2, d * 0.2), clamp(s.rng.gauss() * sigma, -d * 0.2, d * 0.2))
      const target = add(action.target, err)
      const dt = dist(s.ball.pos, target)
      if (action.lofted) {
        // Aimed to arrive at head height for a cross into the box, chest height otherwise.
        const receiver = af(s, p.team, s.players[action.toIdx].pos)
        const cross = receiver.x > PITCH_LENGTH - 18 && Math.abs(receiver.y - CENTER.y) < 14
        const time = loftTime(dt)
        const vz = shotVz(cross ? s.rng.range(1.4, 2.1) : s.rng.range(0.6, 1.3), time)
        kick(s, p, 'pass', target, dt / time, action.toIdx, restart, { lofted: true, vz })
      } else {
        kick(s, p, 'pass', target, passKinematics(dt).speed, action.toIdx, restart)
      }
      s.stats[p.team].passes++
      emit(s, out, { type: 'pass', byIdx: p.idx, toIdx: action.toIdx, from: { ...s.ball.kick!.from }, target, lofted: action.lofted, header: false })
      return
    }
    case 'clearance': {
      const d = dist(s.ball.pos, action.target)
      const { speed, vz } = loft(d, Math.min(2.9, loftTime(d) + 0.3))
      kick(s, p, 'clearance', action.target, speed, null, restart, { lofted: true, vz })
      emit(s, out, { type: 'clearance', byIdx: p.idx, from: { ...s.ball.kick!.from }, target: action.target, header: false })
      return
    }
    case 'shot': {
      const speed = 20 + (p.def.attrs.shooting / 20) * 9 + s.rng.range(0, 2)
      shoot(s, p, action.target, speed, action.height, action.xg, restart, false, out)
      return
    }
  }
}

/** Strike at goal. `height` is where the ball will be as it reaches the goal line. */
function shoot(
  s: MatchState,
  p: PlayerState,
  target: Vec,
  speed: number,
  height: number,
  xg: number,
  restart: RestartType | null,
  header: boolean,
  out: MatchEvent[],
): void {
  const assistIdx = s.ball.receivedFromIdx
  const time = dist(s.ball.pos, target) / speed
  kick(s, p, 'shot', target, speed, null, restart, { lofted: false, vz: shotVz(height - s.ball.z, time) })
  s.ball.kick!.assistIdx = assistIdx
  const onTarget = Math.abs(target.y - CENTER.y) < GOAL_HALF_WIDTH - 0.11 && height < CROSSBAR_HEIGHT - 0.11
  // The AI's chance model ranks shots well but overstates their value; report xG calibrated to
  // how often these chances actually go in (see scripts/calibrate.ts).
  xg *= XG_CALIBRATION
  const st = s.stats[p.team]
  st.shots++
  st.xg += xg
  if (onTarget) st.shotsOnTarget++
  emit(s, out, {
    type: 'shot',
    byIdx: p.idx,
    from: { ...s.ball.kick!.from },
    target,
    height,
    onTarget,
    xg,
    penalty: restart === 'penalty',
    header,
  })
}

function kick(
  s: MatchState,
  p: PlayerState,
  kind: Kick['kind'],
  target: Vec,
  speed: number,
  targetIdx: number | null,
  restart: RestartType | null,
  flight: { lofted: boolean; vz: number } = { lofted: false, vz: 0 },
): void {
  const b = s.ball
  const exempt = restart === 'throwIn' || restart === 'corner' || restart === 'goalKick'
  b.kick = {
    kind,
    lofted: flight.lofted,
    byIdx: p.idx,
    team: p.team,
    tick: s.tick,
    from: { ...b.pos },
    target,
    targetIdx,
    offsideIdxs: exempt ? [] : offsidePositions(s, p, b.pos),
    offsideExempt: exempt,
    fromRestart: restart,
    assistIdx: null,
    missedIdxs: [],
  }
  b.vel = scale(norm(sub(target, b.pos)), Math.min(speed, MAX_BALL_SPEED))
  b.vz = flight.vz
  b.ownerIdx = null
  b.lastTouchIdx = p.idx
  b.touchedSinceKick = false
  b.receivedFromIdx = null
}

// ---------------------------------------------------------------------------
// Ball

function updateBall(s: MatchState, out: MatchEvent[]): void {
  const b = s.ball
  if (b.ownerIdx !== null) {
    const owner = s.players[b.ownerIdx]
    const from = b.pos
    const to = add(owner.pos, scale(facing(s, owner), DRIBBLE_OFFSET))
    b.vel = owner.vel
    if (!crossesLine(s, from, to, () => 0, out)) b.pos = to
    return
  }

  const from = b.pos
  const next = advanceBall(b)
  const to = next.pos
  const speed = len(b.vel)
  const z0 = b.z
  // Height along this tick's path (linear within the tick; the parabola is exact at tick ends).
  const heightAt = (t: number): number => Math.max(0, z0 + (next.rawZ - z0) * t)

  // Walk along the ball's path this tick: each player it passes, low enough to reach, gets a
  // chance to touch it, in the order it reaches them, until someone does or it leaves the pitch.
  const lineT = lineCrossingT(from, to)
  for (const c of touchCandidates(s, from, to, heightAt)) {
    if (lineT !== null && c.t > lineT) break
    if (resolveTouch(s, c.p, lerp(from, to, c.t), heightAt(c.t), speed, out)) return
  }
  if (crossesLine(s, from, to, heightAt, out)) return

  b.pos = next.pos
  b.vel = next.vel
  b.z = next.z
  b.vz = next.vz
}

function touchCandidates(s: MatchState, from: Vec, to: Vec, heightAt: (t: number) => number): { p: PlayerState; t: number }[] {
  const b = s.ball
  const out: { p: PlayerState; t: number; d: number }[] = []
  for (const p of s.players) {
    if (!p.onPitch || s.tick < p.touchReadyAt) continue
    if (b.kick && !b.touchedSinceKick) {
      if (b.kick.byIdx === p.idx && s.tick - b.kick.tick < KICKER_IMMUNITY_TICKS) continue
      if (b.kick.missedIdxs.includes(p.idx)) continue
    }
    const t = closestT(from, to, p.pos)
    const d = dist(p.pos, lerp(from, to, t))
    if (d <= reachOf(s, p) && heightAt(t) <= reachHeightOf(s, p)) out.push({ p, t, d })
  }
  return out.sort((x, y) => x.t - y.t || x.d - y.d)
}

/** Returns false if the player didn't get a touch and the ball carries on. */
function resolveTouch(s: MatchState, p: PlayerState, contact: Vec, height: number, speed: number, out: MatchEvent[]): boolean {
  const b = s.ball
  const k = b.kick
  const rng = s.rng

  // Offside: judged from positions when the ball was played, called when the player gets involved.
  if (k && !b.touchedSinceKick && !k.offsideExempt && k.team === p.team && k.offsideIdxs.includes(p.idx)) {
    emit(s, out, { type: 'offside', idx: p.idx, kickTick: k.tick, pos: { ...p.pos } })
    s.stats[p.team].offsides++
    const spot = vec(clamp(p.pos.x, 0.5, PITCH_LENGTH - 0.5), clamp(p.pos.y, 0.5, PITCH_WIDTH - 0.5))
    setRestart(s, 'freeKick', (1 - p.team) as Side, spot)
    return true
  }

  const isKeeper = p.slot.role === 'GK' && reachOf(s, p) > 1.01
  const miss = (): false => {
    if (k) k.missedIdxs.push(p.idx)
    return false
  }
  const deflect = (kind: 'block' | 'parry' | 'miscontrol', keep: number): true => {
    // A block takes the pace off but the ball keeps going roughly the same way (often behind);
    // a miscontrol pops up anywhere.
    const along = kind === 'block' ? 0.8 : -0.5
    const dir = norm(add(scale(norm(b.vel), along), vec(rng.gauss() * 0.7, rng.gauss() * 0.7)))
    b.pos = contact
    b.vel = scale(dir, speed * keep)
    b.z = height
    b.vz = rng.range(0, 3)
    b.lastTouchIdx = p.idx
    b.touchedSinceKick = true
    emit(s, out, { type: 'deflection', idx: p.idx, contact: { ...contact }, height, kind })
    return true
  }

  const attrs = p.def.attrs
  const fromOpponent = k !== null && k.team !== p.team && !b.touchedSinceKick

  // A keeper coming for a cross: catch it or punch it clear.
  if (isKeeper && height > AERIAL_HEIGHT && fromOpponent && k?.kind !== 'shot' && speed < CONTROLLABLE_SPEED) {
    const pClaim = clamp(0.75 + (attrs.keeping - 12) * 0.02, 0.4, 0.95)
    if (!rng.chance(pClaim)) return miss()
    if (rng.chance(0.7)) {
      takePossession(s, p, contact, height, 'save', out)
      return true
    }
    return deflect('parry', 0.6)
  }

  if (isKeeper && (speed >= CONTROLLABLE_SPEED || k?.kind === 'shot') && fromOpponent) {
    const reach = reachOf(s, p)
    const off = dist(p.pos, contact) / reach
    const pSave = clamp(0.97 - off * off * 0.55 - Math.max(0, speed - 24) / 25 + (attrs.keeping - 12) * 0.02, 0.05, 0.97)
    if (!rng.chance(pSave)) return miss()
    if (speed < 21 && rng.chance(0.3 + attrs.keeping / 40)) {
      takePossession(s, p, contact, height, 'save', out)
      return true
    }
    // Palmed wide of the post rather than back into the six-yard box.
    const side = contact.y < CENTER.y ? -1 : 1
    const outward = contact.x < PITCH_LENGTH / 2 ? -1 : 1
    b.pos = contact
    b.vel = vec(outward * rng.range(2, 6), side * rng.range(4, 9))
    b.z = height
    b.vz = rng.range(1, 4)
    b.lastTouchIdx = p.idx
    b.touchedSinceKick = true
    emit(s, out, { type: 'deflection', idx: p.idx, contact: { ...contact }, height, kind: 'parry' })
    return true
  }

  if (speed >= CONTROLLABLE_SPEED) {
    if (!rng.chance(0.55)) return miss()
    return deflect('block', 0.4)
  }

  // A defender in his own box under an opponent's cross gets rid of it, sometimes behind for a corner.
  const ownBox = inPenaltyArea(p.pos, ownGoalX(p.team, s.half))
  if (ownBox && fromOpponent && k?.lofted && p.slot.role !== 'GK' && rng.chance(0.3)) {
    const goalX = ownGoalX(p.team, s.half)
    const wide = contact.y < CENTER.y ? -1 : 1
    b.pos = contact
    b.vel = vec((goalX === 0 ? -1 : 1) * rng.range(4, 9), wide * rng.range(2, 7))
    b.z = height
    b.vz = rng.range(1, 4)
    b.lastTouchIdx = p.idx
    b.touchedSinceKick = true
    emit(s, out, { type: 'deflection', idx: p.idx, contact: { ...contact }, height, kind: height > AERIAL_HEIGHT ? 'header' : 'block' })
    return true
  }

  if (height > AERIAL_HEIGHT) return header(s, p, contact, height, out)

  // A pass arriving at normal pace is almost always controlled; a hard ball less so.
  const pControl = clamp(0.985 + (attrs.dribbling - 10) * 0.003 - Math.max(0, speed - 8) * 0.02, 0.5, 0.995)
  if (rng.chance(pControl)) {
    takePossession(s, p, contact, height, k && k.team !== p.team && !b.touchedSinceKick ? 'interception' : 'control', out)
    return true
  }
  return deflect('miscontrol', 0.3)
}

/**
 * An outfield player meets a ball in the air. What he does with it depends on where he is and
 * whose ball it was: an attacker meeting a cross near goal heads for goal, a defender heads an
 * opponent's ball clear, anyone else brings it down.
 */
function header(s: MatchState, p: PlayerState, contact: Vec, height: number, out: MatchEvent[]): boolean {
  const b = s.ball
  const rng = s.rng
  const k = b.kick
  if (!rng.chance(0.8)) {
    if (k) k.missedIdxs.push(p.idx)
    return false // mistimed: it goes over or past him
  }
  const a = af(s, p.team, contact)
  const toGoal = dist(a, vec(PITCH_LENGTH, CENTER.y))
  const fromTeammate = k !== null && !b.touchedSinceKick && k.team === p.team
  const cross = fromTeammate && k.lofted
  const clear = a.x < 45 && !fromTeammate
  if (!(cross && toGoal < 17) && !clear) {
    // Bring it down with the head or chest: now it's at his feet.
    takePossession(s, p, contact, height, fromTeammate ? 'control' : 'interception', out)
    return true
  }

  emit(s, out, { type: 'deflection', idx: p.idx, contact: { ...contact }, height, kind: 'header' })
  b.pos = { ...contact }
  b.z = height
  b.lastTouchIdx = p.idx
  b.touchedSinceKick = true
  b.receivedFromIdx = cross ? k.byIdx : null

  if (cross) {
    const attrs = p.def.attrs
    const sigma = ((26 - attrs.shooting) / 20) * (1.5 + toGoal * 0.2)
    const aimY = CENTER.y + rng.range(-3, 3) + rng.gauss() * sigma
    const target = wf(s, p.team, vec(PITCH_LENGTH, aimY))
    const aimH = Math.max(0.05, rng.range(0.1, 1.6) + rng.gauss() * sigma * 0.4)
    shoot(s, p, target, 12 + (attrs.shooting / 20) * 5, aimH, xgFrom(a) * 0.5, null, true, out)
    return true
  }
  const target = wf(s, p.team, vec(a.x + rng.range(18, 28), a.y + rng.range(-12, 12)))
  const d = dist(contact, target)
  const time = 1.3
  kick(s, p, 'clearance', target, d / time, null, null, { lofted: true, vz: shotVz(-height, time) })
  emit(s, out, { type: 'clearance', byIdx: p.idx, from: { ...contact }, target, header: true })
  return true
}

function takePossession(
  s: MatchState,
  p: PlayerState,
  contact: Vec,
  height: number,
  via: 'control' | 'interception' | 'save' | 'restart',
  out: MatchEvent[],
): void {
  const b = s.ball
  const k = b.kick
  if (k && !b.touchedSinceKick && k.kind === 'pass' && k.team === p.team) {
    s.stats[p.team].passesCompleted++
  }
  b.receivedFromIdx = k && !b.touchedSinceKick && k.kind === 'pass' && k.team === p.team && k.byIdx !== p.idx ? k.byIdx : null
  b.ownerIdx = p.idx
  b.lastTouchIdx = p.idx
  b.touchedSinceKick = true
  s.possessedSince = s.tick
  const at = add(p.pos, scale(facing(s, p), DRIBBLE_OFFSET))
  b.pos = vec(clamp(at.x, 0, PITCH_LENGTH), clamp(at.y, 0, PITCH_WIDTH))
  b.vel = { ...p.vel }
  b.z = 0
  b.vz = 0
  s.dribbleTarget = null
  s.decisionAt = s.tick + (via === 'save' ? s.rng.int(15, 30) : s.rng.int(8, 15))
  // A moment to settle: nobody can tackle in the same instant the ball arrives.
  for (const o of s.players) if (o.team !== p.team) o.tackleReadyAt = Math.max(o.tackleReadyAt, s.tick + 6)
  emit(s, out, { type: 'possession', idx: p.idx, contact: { ...contact }, height, via })
}

/** Segment parameter where the ball first leaves the field of play, if it does. */
function lineCrossingT(from: Vec, to: Vec): number | null {
  let best: number | null = null
  const consider = (raw: number): void => {
    const t = clamp(raw, 0, 1)
    if (best === null || t < best) best = t
  }
  if (to.x < 0) consider(from.x / (from.x - to.x))
  if (to.x > PITCH_LENGTH) consider((PITCH_LENGTH - from.x) / (to.x - from.x))
  if (to.y < 0) consider(from.y / (from.y - to.y))
  if (to.y > PITCH_WIDTH) consider((PITCH_WIDTH - from.y) / (to.y - from.y))
  return best
}

/** If the ball leaves the pitch between from and to, resolve it (goal, woodwork, out). */
function crossesLine(s: MatchState, from: Vec, to: Vec, heightAt: (t: number) => number, out: MatchEvent[]): boolean {
  const t = lineCrossingT(from, to)
  if (t === null) return false
  const b = s.ball
  const p = lerp(from, to, t)
  const height = heightAt(t)
  const lastTeam: Side = b.lastTouchIdx === null ? 0 : s.players[b.lastTouchIdx].team

  const onGoalLine = Math.abs(p.x) < 1e-6 || Math.abs(p.x - PITCH_LENGTH) < 1e-6
  if (onGoalLine) {
    const goalX = p.x < 1 ? 0 : PITCH_LENGTH
    const offCentre = Math.abs(p.y - CENTER.y)
    const defending: Side = ownGoalX(0, s.half) === goalX ? 0 : 1
    const underBar = height < CROSSBAR_HEIGHT - 0.11
    const betweenPosts = offCentre < GOAL_HALF_WIDTH - 0.11
    if (betweenPosts && underBar) {
      scoreGoal(s, (1 - defending) as Side, p, height, out)
      return true
    }
    const hitsPost = Math.abs(offCentre - GOAL_HALF_WIDTH) < POST_RADIUS + 0.11 && height < CROSSBAR_HEIGHT
    const hitsBar = offCentre < GOAL_HALF_WIDTH && Math.abs(height - CROSSBAR_HEIGHT) < 0.12
    if ((hitsPost || hitsBar) && b.ownerIdx === null) {
      emit(s, out, { type: 'woodwork', byIdx: b.lastTouchIdx, pos: { ...p }, height })
      b.pos = vec(goalX === 0 ? 0.3 : PITCH_LENGTH - 0.3, p.y)
      b.vel = vec(-b.vel.x * 0.5, b.vel.y * 0.5 + s.rng.gauss() * 3)
      b.z = Math.min(height, CROSSBAR_HEIGHT - 0.2)
      b.vz = hitsBar ? -Math.abs(b.vz) * 0.3 : b.vz * 0.5
      // The woodwork isn't a touch: offside still applies to the rebound, but everyone gets another go at it.
      if (b.kick) b.kick.missedIdxs = []
      return true
    }
    if (lastTeam === defending) {
      const spot = vec(goalX === 0 ? 0.3 : PITCH_LENGTH - 0.3, p.y < CENTER.y ? 0.3 : PITCH_WIDTH - 0.3)
      emit(s, out, { type: 'out', award: 'corner', team: (1 - defending) as Side, pos: { ...p }, height })
      s.stats[1 - defending].corners++
      setRestart(s, 'corner', (1 - defending) as Side, spot)
    } else {
      const spot = vec(goalX === 0 ? 5.5 : PITCH_LENGTH - 5.5, CENTER.y + (p.y < CENTER.y ? -5 : 5))
      emit(s, out, { type: 'out', award: 'goalKick', team: defending, pos: { ...p }, height })
      setRestart(s, 'goalKick', defending, spot)
    }
    return true
  }

  const spot = vec(clamp(p.x, 1, PITCH_LENGTH - 1), p.y < 1 ? 0.2 : PITCH_WIDTH - 0.2)
  const team = (1 - lastTeam) as Side
  emit(s, out, { type: 'out', award: 'throwIn', team, pos: { ...p }, height })
  setRestart(s, 'throwIn', team, spot)
  return true
}

function scoreGoal(s: MatchState, team: Side, pos: Vec, height: number, out: MatchEvent[]): void {
  const b = s.ball
  const k = b.kick
  let scorerIdx: number
  let assistIdx: number | null = null
  let ownGoal = false
  if (k && k.kind === 'shot' && k.team === team) {
    scorerIdx = k.byIdx
    assistIdx = k.assistIdx
  } else if (b.lastTouchIdx !== null && s.players[b.lastTouchIdx].team === team) {
    scorerIdx = b.lastTouchIdx
  } else {
    scorerIdx = b.lastTouchIdx ?? 0
    ownGoal = true
  }
  s.score[team]++
  emit(s, out, { type: 'goal', team, scorerIdx, assistIdx, ownGoal, pos: { ...pos }, height })
  setRestart(s, 'kickoff', (1 - team) as Side, CENTER)
}

// ---------------------------------------------------------------------------
// Challenges

function challenges(s: MatchState, out: MatchEvent[]): void {
  const c = s.players[s.ball.ownerIdx!]
  const rng = s.rng
  if (c.slot.role === 'GK' && inPenaltyArea(c.pos, ownGoalX(c.team, s.half))) return // ball in hands
  let tackler: PlayerState | null = null
  for (const o of s.players) {
    if (!o.onPitch || o.team === c.team || s.tick < o.tackleReadyAt) continue
    const d = dist(o.pos, c.pos)
    if (d > TACKLE_RANGE) continue
    if (!tackler || d < dist(tackler.pos, c.pos)) tackler = o
  }
  if (!tackler || !rng.chance(0.06)) return

  const o = tackler
  const oa = o.def.attrs
  const ca = c.def.attrs
  const inOwnBox = inPenaltyArea(c.pos, ownGoalX(o.team, s.half))
  // Players go in more carefully in their own box, and once they've been booked.
  const care = (inOwnBox ? 0.25 : 1) * (o.yellowCards > 0 ? 0.5 : 1)
  const pFoul = clamp(0.03 + o.def.traits.temper * 0.045 + ((ca.dribbling - oa.tackling) / 20) * 0.05, 0.015, 0.12) * care
  if (rng.chance(pFoul)) {
    const pos = { ...c.pos }
    const award = inOwnBox ? 'penalty' : 'freeKick'
    s.stats[o.team].fouls++
    emit(s, out, { type: 'foul', byIdx: o.idx, onIdx: c.idx, pos, award })
    const cardRoll = rng.next()
    if (cardRoll < 0.002) sendOff(s, o, out)
    else if (cardRoll < (0.08 + o.def.traits.temper * 0.12) * (o.yellowCards > 0 ? 0.6 : 1)) {
      o.yellowCards++
      s.stats[o.team].yellowCards++
      emit(s, out, { type: 'card', idx: o.idx, color: 'yellow' })
      if (o.yellowCards >= 2) sendOff(s, o, out)
    }
    const spot = award === 'penalty' ? penaltySpot(ownGoalX(o.team, s.half)) : pos
    setRestart(s, award, c.team, spot)
    return
  }

  const skill = o.slot.role === 'GK' ? oa.keeping + 3 : oa.tackling
  const won = rng.chance(clamp(0.5 + (skill - ca.dribbling) * 0.03, 0.2, 0.85))
  emit(s, out, { type: 'tackle', byIdx: o.idx, onIdx: c.idx, pos: { ...c.pos }, won })
  if (won) {
    const b = s.ball
    const dir = norm(add(sub(vec(oppGoalX(o.team, s.half), CENTER.y), b.pos), scale(vec(rng.gauss(), rng.gauss()), 20)))
    b.ownerIdx = null
    b.kick = null
    b.touchedSinceKick = true
    b.lastTouchIdx = o.idx
    b.receivedFromIdx = null
    b.vel = scale(dir, rng.range(3, 6))
    s.dribbleTarget = null
    o.tackleReadyAt = s.tick + 10
    c.touchReadyAt = s.tick + 8
  } else {
    o.tackleReadyAt = s.tick + 20
  }
}

function sendOff(s: MatchState, p: PlayerState, out: MatchEvent[]): void {
  s.stats[p.team].redCards++
  emit(s, out, { type: 'card', idx: p.idx, color: 'red' })
  p.onPitch = false
  p.vel = vec(0, 0)
}

// ---------------------------------------------------------------------------
// Restarts

function setRestart(s: MatchState, type: RestartType, team: Side, spot: Vec): void {
  const taker = chooseTaker(s, type, team, spot)
  s.phase = { kind: 'restart', restart: { type, team, spot: { ...spot }, takerIdx: taker.idx, since: s.tick } }
  const b = s.ball
  b.pos = { ...spot }
  b.vel = vec(0, 0)
  b.z = 0
  b.vz = 0
  b.ownerIdx = null
  b.kick = null
  b.touchedSinceKick = false
  b.receivedFromIdx = null
  s.dribbleTarget = null
  for (const p of s.players) p.runUntil = 0
}

function tryTakeRestart(s: MatchState, out: MatchEvent[]): void {
  if (s.phase.kind !== 'restart') return
  const r = s.phase.restart
  const taker = s.players[r.takerIdx]
  const minWait = r.type === 'kickoff' || r.type === 'penalty' ? 20 : 8
  if (s.tick - r.since < minWait) return
  const atSpot = dist(taker.pos, takerSpot(s, r)) <= RESTART_SPOT_TOLERANCE
  const ready = atSpot && restartConditionsMet(s, r)
  const forced = s.tick - r.since >= RESTART_TIMEOUT_TICKS
  if (!ready && !forced) return
  if (!taker.onPitch) return

  s.phase = { kind: 'play' }
  emit(s, out, { type: 'restart', restart: r.type, team: r.team, takerIdx: taker.idx, spot: { ...r.spot }, forced: !ready })
  s.ball.ownerIdx = taker.idx
  s.ball.lastTouchIdx = taker.idx

  let action: Action
  if (r.type === 'corner') {
    // Whipped into the box, towards whoever has the most space there.
    const inBox = s.players.filter((q) => {
      if (!q.onPitch || q.team !== r.team || q.idx === taker.idx) return false
      const a = af(s, r.team, q.pos)
      return a.x > PITCH_LENGTH - BOX_DEPTH && Math.abs(a.y - CENTER.y) < BOX_HALF_WIDTH
    })
    const space = (q: PlayerState): number =>
      Math.min(...s.players.filter((o) => o.onPitch && o.team !== r.team).map((o) => dist(o.pos, q.pos)))
    const target = inBox.length ? inBox.reduce((x, y) => (space(y) > space(x) ? y : x)) : null
    action = target
      ? { kind: 'pass', toIdx: target.idx, target: { ...target.pos }, lofted: true }
      : chooseAction(s, taker, { allowShot: false, allowDribble: false, minPass: 5, maxPass: 45 })
  } else if (r.type === 'penalty') {
    action = chooseAction(s, taker, { allowShot: true, allowDribble: false, minPass: 999, maxPass: 0, maxShotDistance: 12 })
  } else {
    const a = af(s, r.team, r.spot)
    action = chooseAction(s, taker, {
      allowShot: r.type === 'freeKick',
      allowDribble: false,
      minPass: r.type === 'kickoff' ? 3 : 5,
      maxPass: r.type === 'throwIn' ? 22 : 45,
      maxShotDistance: MAX_FREE_KICK_SHOT_DISTANCE,
      passFilter:
        r.type === 'kickoff'
          ? (q) => af(s, r.team, q.pos).x < a.x
          : undefined,
    })
  }
  if (action.kind === 'hold' || action.kind === 'dribble') {
    // Nothing good on: play it to the nearest teammate.
    const mates = s.players.filter((q) => q.onPitch && q.team === r.team && q.idx !== taker.idx)
    const q = mates.reduce((x, y) => (dist(y.pos, taker.pos) < dist(x.pos, taker.pos) ? y : x))
    action = { kind: 'pass', toIdx: q.idx, target: { ...q.pos }, lofted: false }
  }
  execute(s, taker, action, r.type, out)
}

// ---------------------------------------------------------------------------
// Clock

function checkPeriodEnd(s: MatchState, out: MatchEvent[]): void {
  const elapsed = s.tick - s.halfStartTick
  if (elapsed < s.halfTicks + s.addedTicks) return
  // Don't blow up while a shot is on its way or a penalty is being set up.
  const k = s.ball.kick
  if (s.phase.kind === 'play' && s.ball.ownerIdx === null && k?.kind === 'shot' && !s.ball.touchedSinceKick) return
  if (s.phase.kind === 'restart' && s.phase.restart.type === 'penalty') return

  if (s.half === 2) {
    s.phase = { kind: 'fullTime' }
    emit(s, out, { type: 'fullTime' })
    return
  }
  emit(s, out, { type: 'halfTime' })
  s.half = 2
  s.halfStartTick = s.tick
  s.addedTicks = s.rng.int(1, 5) * TICKS_PER_MINUTE + s.rng.int(0, 59) * 10
  s.ball = emptyBall()
  // Teams come back out for the second half already in kick-off positions.
  for (const p of s.players) {
    p.vel = vec(0, 0)
    p.tackleReadyAt = 0
    if (p.onPitch) p.pos = kickoffPosition(s, p)
  }
  setRestart(s, 'kickoff', 1, CENTER)
  const r = (s.phase as { kind: 'restart'; restart: Restart }).restart
  s.players[r.takerIdx].pos = takerSpot(s, r)
}

