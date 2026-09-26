/**
 * Canvas drawing for the match. Everything is drawn in pitch metres (x along the pitch, y across,
 * z up) through a Camera, and the canvas is re-rendered at its displayed size for each camera:
 * a close-up is a different projection, never a scaled bitmap.
 */
import {
  BOX_DEPTH,
  BOX_HALF_WIDTH,
  CENTER,
  CENTER_CIRCLE_RADIUS,
  CROSSBAR_HEIGHT,
  GOAL_HALF_WIDTH,
  type Kit,
  type MatchEvent,
  PENALTY_SPOT_DIST,
  PITCH_LENGTH,
  PITCH_WIDTH,
  type Role,
} from '../engine/index.ts'
import { PLAYERS_AT, type Timeline } from './timeline.ts'

/** Metres of grass shown around the pitch in the wide view (room for the goals). */
const MARGIN = 3.5
const GOAL_DEPTH = 2
const SIX_YARD_DEPTH = 5.5
const SIX_YARD_HALF_WIDTH = 18.32 / 2
/** Ticks a finished pass or shot line takes to fade out. */
const FLIGHT_FADE = 8

export const PITCH_ASPECT = (PITCH_WIDTH + MARGIN * 2) / (PITCH_LENGTH + MARGIN * 2)

export interface View {
  /** CSS pixels. */
  width: number
  height: number
  dpr: number
}

export function viewFor(width: number, dpr: number): View {
  return { width, height: width * PITCH_ASPECT, dpr }
}

// ---------------------------------------------------------------------------
// Cameras

export interface Point {
  x: number
  y: number
  /** CSS pixels per metre at this point (for sizing things drawn there). */
  k: number
}

export interface Camera {
  /** Project a point on (z = 0) or above the pitch to the screen; null if behind the camera. */
  project(x: number, y: number, z?: number): Point | null
  /** Top-down cameras draw players as discs; a perspective camera draws them standing. */
  perspective: boolean
  /** Screen y of the horizon, for a perspective camera (the stands are drawn above it). */
  horizon?: number
}

/** Raised broadcast view of the whole pitch; height shown as a gentle lift. */
export function wideCamera(v: View): Camera {
  const s = v.width / (PITCH_LENGTH + MARGIN * 2)
  return {
    perspective: false,
    project: (x, y, z = 0) => ({ x: (x + MARGIN) * s, y: (y + MARGIN) * s - z * s * 0.55, k: s }),
  }
}

/** The same view, closer: centred on (cx, cy), `zoom` times the wide scale, kept on the pitch. */
export function zoomCamera(v: View, cx: number, cy: number, zoom: number): Camera {
  const s = (v.width / (PITCH_LENGTH + MARGIN * 2)) * zoom
  const halfW = v.width / 2 / s
  const halfH = v.height / 2 / s
  const x0 = Math.min(Math.max(cx, -MARGIN + halfW), PITCH_LENGTH + MARGIN - halfW)
  const y0 = Math.min(Math.max(cy, -MARGIN + halfH), PITCH_WIDTH + MARGIN - halfH)
  return {
    perspective: false,
    project: (x, y, z = 0) => ({ x: v.width / 2 + (x - x0) * s, y: v.height / 2 + (y - y0) * s - z * s * 0.55, k: s }),
  }
}

/**
 * Behind the goal at `goalX`, raised, looking up the pitch: a true perspective projection.
 * The camera sits `back` metres behind the goal line at `height`, facing the pitch.
 */
export function behindGoalCamera(v: View, goalX: number, focusY = CENTER.y): Camera {
  const back = 14
  const height = 7
  const into = goalX === 0 ? 1 : -1 // direction the camera looks along x
  // Looking along +x the viewer's right is -y; along -x it's +y.
  const right = goalX === 0 ? -1 : 1
  const f = (0.42 * v.width * back) / (GOAL_HALF_WIDTH * 2)
  const horizon = v.height * 0.1
  return {
    perspective: true,
    horizon,
    project: (x, y, z = 0) => {
      const depth = (x - goalX) * into + back
      if (depth < 1) return null
      return {
        x: v.width / 2 + (f * (y - focusY) * right) / depth,
        y: horizon + (f * (height - z)) / depth,
        k: f / depth,
      }
    },
  }
}

// ---------------------------------------------------------------------------
// Pitch

const GRASS_A = '#3d6d47'
const GRASS_B = '#437650'
const GRASS_EDGE = '#37623f'
const STANDS = '#1b2a20'
const LINE = 'rgba(255,255,255,0.82)'

/** Stroke a polyline of pitch points (skipping any behind the camera). */
function polyline(ctx: CanvasRenderingContext2D, cam: Camera, pts: [number, number, number?][]): void {
  ctx.beginPath()
  let started = false
  for (const [x, y, z] of pts) {
    const p = cam.project(x, y, z ?? 0)
    if (!p) {
      started = false
      continue
    }
    if (started) ctx.lineTo(p.x, p.y)
    else ctx.moveTo(p.x, p.y)
    started = true
  }
  ctx.stroke()
}

function arcPoints(cx: number, cy: number, r: number, from: number, to: number, n = 40): [number, number][] {
  const out: [number, number][] = []
  for (let i = 0; i <= n; i++) {
    const a = from + ((to - from) * i) / n
    out.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r])
  }
  return out
}

function fillQuad(ctx: CanvasRenderingContext2D, cam: Camera, pts: [number, number][], colour: string): void {
  const ps = pts.map(([x, y]) => cam.project(x, y, 0))
  if (ps.some((p) => !p)) return
  ctx.beginPath()
  ps.forEach((p, i) => (i ? ctx.lineTo(p!.x, p!.y) : ctx.moveTo(p!.x, p!.y)))
  ctx.closePath()
  ctx.fillStyle = colour
  ctx.fill()
}

function drawPitch(ctx: CanvasRenderingContext2D, v: View, cam: Camera): void {
  ctx.fillStyle = GRASS_EDGE
  ctx.fillRect(0, 0, v.width, v.height)
  if (cam.perspective && cam.horizon !== undefined) {
    ctx.fillStyle = STANDS
    ctx.fillRect(0, 0, v.width, cam.horizon + 2)
  }
  // Mowing stripes, 12 across the length.
  const band = PITCH_LENGTH / 12
  for (let i = 0; i < 12; i++) {
    const x0 = i * band
    fillQuad(ctx, cam, [[x0, 0], [x0 + band + 0.05, 0], [x0 + band + 0.05, PITCH_WIDTH], [x0, PITCH_WIDTH]], i % 2 ? GRASS_A : GRASS_B)
  }

  const k = cam.project(CENTER.x, CENTER.y)?.k ?? 1
  ctx.strokeStyle = LINE
  ctx.lineWidth = Math.max(1, Math.min(3, 0.12 * k))
  const rect = (x: number, y: number, w: number, h: number): void =>
    polyline(ctx, cam, [[x, y], [x + w, y], [x + w, y + h], [x, y + h], [x, y]])
  const spot = (x: number, y: number): void => {
    const p = cam.project(x, y)
    if (!p) return
    ctx.beginPath()
    ctx.arc(p.x, p.y, Math.max(1.5, 0.2 * p.k), 0, Math.PI * 2)
    ctx.fillStyle = LINE
    ctx.fill()
  }

  rect(0, 0, PITCH_LENGTH, PITCH_WIDTH)
  polyline(ctx, cam, [[CENTER.x, 0], [CENTER.x, PITCH_WIDTH]])
  polyline(ctx, cam, arcPoints(CENTER.x, CENTER.y, CENTER_CIRCLE_RADIUS, 0, Math.PI * 2, 64))
  spot(CENTER.x, CENTER.y)
  for (const goalX of [0, PITCH_LENGTH]) {
    const dir = goalX === 0 ? 1 : -1
    rect(goalX === 0 ? 0 : PITCH_LENGTH - BOX_DEPTH, CENTER.y - BOX_HALF_WIDTH, BOX_DEPTH, BOX_HALF_WIDTH * 2)
    rect(goalX === 0 ? 0 : PITCH_LENGTH - SIX_YARD_DEPTH, CENTER.y - SIX_YARD_HALF_WIDTH, SIX_YARD_DEPTH, SIX_YARD_HALF_WIDTH * 2)
    const spotX = goalX + dir * PENALTY_SPOT_DIST
    spot(spotX, CENTER.y)
    // The arc: the part of the 9.15m circle round the spot that lies outside the box.
    const a = Math.acos((BOX_DEPTH - PENALTY_SPOT_DIST) / CENTER_CIRCLE_RADIUS)
    polyline(ctx, cam, dir === 1 ? arcPoints(spotX, CENTER.y, CENTER_CIRCLE_RADIUS, -a, a) : arcPoints(spotX, CENTER.y, CENTER_CIRCLE_RADIUS, Math.PI - a, Math.PI + a))
  }
  for (const [x, y, from] of [
    [0, 0, 0],
    [PITCH_LENGTH, 0, Math.PI / 2],
    [PITCH_LENGTH, PITCH_WIDTH, Math.PI],
    [0, PITCH_WIDTH, Math.PI * 1.5],
  ]) {
    polyline(ctx, cam, arcPoints(x, y, 1, from, from + Math.PI / 2, 10))
  }
}

/** Goals as frames with depth: posts, crossbar, and a net that bulges where a goal went in. */
function drawGoals(ctx: CanvasRenderingContext2D, cam: Camera, ripple: DrawOptions['ripple']): void {
  for (const goalX of [0, PITCH_LENGTH]) {
    const out = goalX === 0 ? -1 : 1
    const hit = ripple && Math.abs(ripple.x - goalX) < 1 ? ripple : null
    const bulge = (y: number, z: number): number =>
      hit ? 0.9 * Math.exp(-((y - hit.y) ** 2 + (z - 1) ** 2) / 4) * Math.sin(Math.PI * (1 - hit.age)) * (1 - hit.age) : 0
    const lo = CENTER.y - GOAL_HALF_WIDTH
    const hi = CENTER.y + GOAL_HALF_WIDTH
    const back = (y: number, z: number): [number, number, number] => [goalX + out * (GOAL_DEPTH + bulge(y, z)), y, z]
    ctx.strokeStyle = 'rgba(255,255,255,0.3)'
    ctx.lineWidth = 1
    // Net: the back panel in a grid, plus the roof.
    for (let z = 0; z <= CROSSBAR_HEIGHT + 0.01; z += CROSSBAR_HEIGHT / 4) {
      const row: [number, number, number][] = []
      for (let y = lo; y <= hi + 0.01; y += 0.4) row.push(back(y, z))
      polyline(ctx, cam, row)
    }
    for (let y = lo; y <= hi + 0.01; y += GOAL_HALF_WIDTH / 3) {
      polyline(ctx, cam, [back(y, 0), back(y, CROSSBAR_HEIGHT), [goalX, y, CROSSBAR_HEIGHT]])
    }
    // Frame.
    const k = cam.project(goalX, CENTER.y)?.k ?? 1
    ctx.strokeStyle = 'rgba(255,255,255,0.95)'
    ctx.lineWidth = Math.max(1.5, Math.min(4, 0.15 * k))
    polyline(ctx, cam, [[goalX, lo, 0], [goalX, lo, CROSSBAR_HEIGHT], [goalX, hi, CROSSBAR_HEIGHT], [goalX, hi, 0]])
    ctx.lineWidth = 1
    ctx.strokeStyle = 'rgba(255,255,255,0.5)'
    polyline(ctx, cam, [[goalX, lo, 0], back(lo, 0), back(hi, 0), [goalX, hi, 0]])
  }
}

// ---------------------------------------------------------------------------
// Frame

/** A short movement that says what a player just did: slid in, or dived. */
export interface Animation {
  kind: 'slide' | 'dive'
  idx: number
  /** Where the body stretches towards (pitch metres, z for a dive's height). */
  toward: { x: number; y: number; z: number }
  /** 0 at the moment it happens, 1 when it's over. */
  age: number
}

export interface DrawOptions {
  kits: [Kit, Kit]
  keeperKits: [Kit, Kit]
  showRoles: boolean
  /** A goal just scored: where the ball hit the net and how long ago (0..1 of the ripple). */
  ripple: { x: number; y: number; age: number } | null
  /** After a goal the engine re-spots the ball for kick-off; keep showing it in the net until then. */
  ballInNet: { x: number; y: number } | null
  /** The kick in the air (or just finished), and when its flight ended. */
  flight: { kick: Extract<MatchEvent, { type: 'pass' | 'shot' | 'clearance' }>; end: number | null } | null
  animations: Animation[]
  /** Runs being made: from the runner, towards where he'll actually be when it ends. */
  runs: { idx: number; to: { x: number; y: number }; progress: number }[]
}

/** A quiet dashed arrow along a run, fading as it plays out. */
function drawRun(ctx: CanvasRenderingContext2D, cam: Camera, from: [number, number], to: { x: number; y: number }, progress: number): void {
  const a = cam.project(from[0], from[1])
  const b = cam.project(to.x, to.y)
  if (!a || !b) return
  const len = Math.hypot(b.x - a.x, b.y - a.y)
  if (len < 12) return
  const alpha = 0.75 * (1 - progress * progress)
  const ux = (b.x - a.x) / len
  const uy = (b.y - a.y) / len
  ctx.save()
  ctx.strokeStyle = `rgba(255,255,255,${alpha})`
  ctx.fillStyle = `rgba(255,255,255,${alpha})`
  ctx.lineWidth = 1.5
  ctx.setLineDash([4, 4])
  ctx.beginPath()
  ctx.moveTo(a.x + ux * 10, a.y + uy * 10)
  ctx.lineTo(b.x - ux * 6, b.y - uy * 6)
  ctx.stroke()
  ctx.setLineDash([])
  ctx.beginPath()
  ctx.moveTo(b.x, b.y)
  ctx.lineTo(b.x - ux * 8 - uy * 4, b.y - uy * 8 + ux * 4)
  ctx.lineTo(b.x - ux * 8 + uy * 4, b.y - uy * 8 - ux * 4)
  ctx.closePath()
  ctx.fill()
  ctx.restore()
}

/** Trace a kick's actual path from the recorded frames: brighter where the ball has been. */
function drawFlight(ctx: CanvasRenderingContext2D, cam: Camera, timeline: Timeline, playhead: number, opts: DrawOptions): void {
  const f = opts.flight
  if (!f || playhead < f.kick.tick) return
  const end = Math.min(f.end ?? timeline.lastTick, timeline.lastTick)
  const fade = playhead > end ? 1 - (playhead - end) / FLIGHT_FADE : 1
  if (fade <= 0 || end <= f.kick.tick) return
  const k = f.kick
  const shot = k.type === 'shot'
  const lofted = k.type === 'clearance' || (k.type === 'pass' && k.lofted)
  const path = (from: number, to: number): [number, number, number][] => {
    const pts: [number, number, number][] = []
    for (let t = from; t <= to; t++) {
      const fr = timeline.frame(t)
      pts.push([fr[0], fr[1], fr[2]])
    }
    return pts
  }
  ctx.save()
  ctx.lineCap = 'round'
  ctx.lineWidth = shot ? 2 : 1.5
  ctx.setLineDash(shot ? [] : lofted ? [1, 5] : [5, 5])
  const colour = shot ? '255,238,200' : '255,255,255'
  const now = Math.min(Math.floor(playhead), end)
  ctx.strokeStyle = `rgba(${colour},${0.22 * fade})`
  polyline(ctx, cam, path(now, end))
  ctx.strokeStyle = `rgba(${colour},${(shot ? 0.85 : 0.6) * fade})`
  polyline(ctx, cam, path(k.tick, now))
  ctx.restore()
}

/** Draw the match at a fractional tick, interpolating between recorded ticks. */
export function drawFrame(
  ctx: CanvasRenderingContext2D,
  v: View,
  cam: Camera,
  timeline: Timeline,
  playhead: number,
  opts: DrawOptions,
): void {
  ctx.setTransform(v.dpr, 0, 0, v.dpr, 0, 0)
  drawPitch(ctx, v, cam)

  const t0 = Math.floor(playhead)
  const a = timeline.frame(t0)
  const b = timeline.frame(Math.min(t0 + 1, timeline.lastTick))
  const f = playhead - t0
  // (x, y) at i, i + 1 interpolated between the two ticks; no sliding across a jump (a restart spot).
  const mix = (i: number, maxJump: number): [number, number] => {
    const ax = a[i]
    const ay = a[i + 1]
    const bx = b[i]
    const by = b[i + 1]
    if (Number.isNaN(bx) || Math.hypot(bx - ax, by - ay) > maxJump) return [ax, ay]
    return [ax + (bx - ax) * f, ay + (by - ay) * f]
  }

  let [bx, by] = mix(0, 4)
  let bz = Number.isNaN(b[2]) ? a[2] : a[2] + (b[2] - a[2]) * f
  if (opts.ballInNet) {
    bx = opts.ballInNet.x + (opts.ballInNet.x < 1 ? -1.2 : 1.2)
    by = opts.ballInNet.y
    bz = 0.3
  }

  // Far things first, so nearer players and the ball overlap them in the perspective view.
  const players = timeline.state.players
    .map((p, i) => ({ p, i, at: mix(PLAYERS_AT + i * 2, 3) }))
    .filter(({ at }) => !Number.isNaN(at[0]))
  const depthOf = (x: number, y: number): number => cam.project(x, y)?.k ?? 0
  players.sort((u, w) => depthOf(u.at[0], u.at[1]) - depthOf(w.at[0], w.at[1]))

  drawGoals(ctx, cam, opts.ripple)
  drawFlight(ctx, cam, timeline, playhead, opts)
  if (!cam.perspective) {
    for (const r of opts.runs) {
      const runner = players.find((pl) => pl.i === r.idx)
      if (runner) drawRun(ctx, cam, runner.at, r.to, r.progress)
    }
  }
  const ballDepth = depthOf(bx, by)
  let ballDrawn = false
  for (const { p, i, at } of players) {
    if (!ballDrawn && depthOf(at[0], at[1]) > ballDepth) {
      drawBall(ctx, cam, bx, by, bz)
      ballDrawn = true
    }
    const kit = p.slot.role === 'GK' ? opts.keeperKits[p.team] : opts.kits[p.team]
    const anim = opts.animations.find((an) => an.idx === i)
    drawPlayer(ctx, cam, at[0], at[1], kit, p.def.shirt, anim, opts.showRoles ? p.slot.role : null)
  }
  if (!ballDrawn) drawBall(ctx, cam, bx, by, bz)
}

const easeOut = (x: number): number => 1 - (1 - x) ** 3

function drawPlayer(
  ctx: CanvasRenderingContext2D,
  cam: Camera,
  x: number,
  y: number,
  kit: Kit,
  shirt: number,
  anim: Animation | undefined,
  role: Role | null,
): void {
  const base = cam.project(x, y)
  if (!base) return
  // How far the body is stretched out (towards a tackle or a dive), rising then settling back.
  const stretch = anim ? Math.sin(Math.PI * Math.min(1, anim.age * 1.2)) : 0
  let lean: { x: number; y: number } | null = null
  if (anim && stretch > 0.02) {
    const dx = anim.toward.x - x
    const dy = anim.toward.y - y
    const d = Math.hypot(dx, dy) || 1
    const reach = Math.min(anim.kind === 'dive' ? 2 : 1.4, d) * easeOut(stretch)
    const zUp = anim.kind === 'dive' ? Math.min(anim.toward.z, 1.5) * stretch : 0
    lean = cam.project(x + (dx / d) * reach, y + (dy / d) * reach, cam.perspective ? zUp + 0.4 : zUp)
  }

  if (cam.perspective) {
    // Standing figure: a rounded bar from the feet to head height, leaning when he slides or dives.
    const head = cam.project(x, y, 1.8)
    if (!head) return
    const w = Math.max(2, 0.55 * base.k)
    ctx.lineCap = 'round'
    ctx.strokeStyle = 'rgba(0,0,0,0.25)'
    ctx.lineWidth = w
    ctx.beginPath()
    ctx.moveTo(base.x, base.y)
    ctx.lineTo(base.x + w * 1.2, base.y + w * 0.3)
    ctx.stroke()
    ctx.strokeStyle = kit.shirt
    ctx.lineWidth = w
    ctx.beginPath()
    ctx.moveTo(base.x, base.y - w / 2)
    ctx.lineTo(lean ? lean.x : head.x, lean ? lean.y : head.y)
    ctx.stroke()
    return
  }

  const r = Math.max(6, 1.3 * base.k)
  // Soft shadow, then (if he's stretching) the body towards the ball, then the shirt.
  ctx.beginPath()
  ctx.ellipse(base.x + r * 0.2, base.y + r * 0.35, r * 0.95, r * 0.6, 0, 0, Math.PI * 2)
  ctx.fillStyle = 'rgba(0,0,0,0.18)'
  ctx.fill()
  if (lean) {
    ctx.lineCap = 'round'
    ctx.strokeStyle = 'rgba(0,0,0,0.35)'
    ctx.lineWidth = r * 1.7 + 2
    ctx.beginPath()
    ctx.moveTo(base.x, base.y)
    ctx.lineTo(lean.x, lean.y)
    ctx.stroke()
    ctx.strokeStyle = kit.shirt
    ctx.lineWidth = r * 1.7
    ctx.stroke()
  }
  ctx.beginPath()
  ctx.arc(base.x, base.y, r, 0, Math.PI * 2)
  ctx.fillStyle = kit.shirt
  ctx.fill()
  ctx.lineWidth = 1
  ctx.strokeStyle = 'rgba(0,0,0,0.35)'
  ctx.stroke()
  const fontSize = Math.max(8, Math.round(r * 1.05))
  if (r >= 7) {
    ctx.fillStyle = kit.number
    ctx.font = `600 ${fontSize}px "Barlow Condensed", "Arial Narrow", sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(String(shirt), base.x, base.y + 0.5)
  }
  if (role) drawRole(ctx, role, base.x, base.y + r + 2, fontSize)
}

function drawBall(ctx: CanvasRenderingContext2D, cam: Camera, x: number, y: number, z: number): void {
  const ground = cam.project(x, y, 0)
  const up = cam.project(x, y, cam.perspective ? z + 0.11 : z)
  if (!ground || !up) return
  // Shadow on the grass, shrinking and fading as the ball climbs; the ball itself drawn at height.
  const br = cam.perspective ? Math.max(2.5, 0.3 * ground.k) : Math.max(4, 0.62 * ground.k) * (1 + Math.min(z, 8) * 0.05)
  const shadowK = 1 / (1 + z * 0.25)
  ctx.beginPath()
  ctx.ellipse(ground.x + (cam.perspective ? 0 : br * 0.3), ground.y + (cam.perspective ? 0 : br * 0.35), br * shadowK, br * 0.6 * shadowK, 0, 0, Math.PI * 2)
  ctx.fillStyle = `rgba(0,0,0,${0.32 * shadowK})`
  ctx.fill()
  ctx.beginPath()
  ctx.arc(up.x, up.y, br, 0, Math.PI * 2)
  ctx.fillStyle = '#fbfbf7'
  ctx.fill()
  ctx.lineWidth = 1
  ctx.strokeStyle = 'rgba(20,20,20,0.75)'
  ctx.stroke()
}

function drawRole(ctx: CanvasRenderingContext2D, role: Role, x: number, y: number, size: number): void {
  ctx.font = `600 ${Math.max(8, size - 2)}px "Barlow Condensed", "Arial Narrow", sans-serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'top'
  ctx.fillStyle = 'rgba(0,0,0,0.45)'
  ctx.fillText(role, x + 0.5, y + 0.5)
  ctx.fillStyle = 'rgba(255,255,255,0.92)'
  ctx.fillText(role, x, y)
}

// ---------------------------------------------------------------------------
// Kits

const KEEPER_KITS: [Kit, Kit] = [
  { shirt: '#b8d24c', number: '#1b1f1c', family: 'lime' },
  { shirt: '#d9a3df', number: '#2a1630', family: 'pink' },
]

/** Kits for a fixture: the away side changes to a plain kit if the colours clash. */
export function fixtureKits(home: Kit, away: Kit): { kits: [Kit, Kit]; keeperKits: [Kit, Kit] } {
  let awayKit = away
  if (away.family === home.family) {
    awayKit =
      home.family === 'white'
        ? { shirt: '#232527', number: '#f2f2ee', family: 'black' }
        : { shirt: '#f2f2ee', number: '#1b1f1c', family: 'white' }
  }
  return { kits: [home, awayKit], keeperKits: KEEPER_KITS }
}
