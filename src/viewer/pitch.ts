/**
 * Canvas drawing for the match. Layout-based: everything is drawn in pitch metres through one
 * scale, and the canvas is re-rendered at its displayed size (times devicePixelRatio), never
 * scaled as a bitmap.
 */
import {
  BOX_DEPTH,
  BOX_HALF_WIDTH,
  CENTER,
  CENTER_CIRCLE_RADIUS,
  GOAL_HALF_WIDTH,
  type Kit,
  type MatchState,
  PENALTY_SPOT_DIST,
  PITCH_LENGTH,
  PITCH_WIDTH,
  type Role,
} from '../engine/index.ts'
import type { MatchEvent } from '../engine/index.ts'
import { PLAYERS_AT, type Timeline } from './timeline.ts'

/** Metres of grass shown around the pitch (room for the goals). */
const MARGIN = 3.5
const GOAL_DEPTH = 2
const SIX_YARD_DEPTH = 5.5
const SIX_YARD_HALF_WIDTH = 18.32 / 2

export const PITCH_ASPECT = (PITCH_WIDTH + MARGIN * 2) / (PITCH_LENGTH + MARGIN * 2)

export interface View {
  /** CSS pixels. */
  width: number
  height: number
  dpr: number
  /** CSS pixels per metre. */
  scale: number
}

export function viewFor(width: number, dpr: number): View {
  const scale = width / (PITCH_LENGTH + MARGIN * 2)
  return { width, height: width * PITCH_ASPECT, dpr, scale }
}

const px = (v: View, x: number): number => (x + MARGIN) * v.scale
const py = (v: View, y: number): number => (y + MARGIN) * v.scale
/** Screen y for something `z` metres up: a gentle lift, like a raised broadcast camera. */
const HEIGHT_LIFT = 0.55
const pyz = (v: View, y: number, z: number): number => py(v, y) - z * v.scale * HEIGHT_LIFT
/** Ticks a finished pass or shot line takes to fade out. */
const FLIGHT_FADE = 8

const GRASS_A = '#3d6d47'
const GRASS_B = '#437650'
const GRASS_EDGE = '#37623f'
const LINE = 'rgba(255,255,255,0.82)'

/** Draw the static pitch. Call once per size and cache the result. */
export function drawPitch(ctx: CanvasRenderingContext2D, v: View): void {
  ctx.setTransform(v.dpr, 0, 0, v.dpr, 0, 0)
  ctx.fillStyle = GRASS_EDGE
  ctx.fillRect(0, 0, v.width, v.height)
  // Mowing stripes, 12 across the length.
  const band = PITCH_LENGTH / 12
  for (let i = 0; i < 12; i++) {
    ctx.fillStyle = i % 2 ? GRASS_A : GRASS_B
    ctx.fillRect(px(v, i * band), py(v, 0), band * v.scale + 0.5, PITCH_WIDTH * v.scale)
  }

  ctx.strokeStyle = LINE
  ctx.lineWidth = Math.max(1, 0.12 * v.scale)
  const rect = (x: number, y: number, w: number, h: number): void => {
    ctx.strokeRect(px(v, x), py(v, y), w * v.scale, h * v.scale)
  }
  const circle = (x: number, y: number, r: number, from = 0, to = Math.PI * 2): void => {
    ctx.beginPath()
    ctx.arc(px(v, x), py(v, y), r * v.scale, from, to)
    ctx.stroke()
  }
  const spot = (x: number, y: number): void => {
    ctx.beginPath()
    ctx.arc(px(v, x), py(v, y), Math.max(1.5, 0.2 * v.scale), 0, Math.PI * 2)
    ctx.fillStyle = LINE
    ctx.fill()
  }

  rect(0, 0, PITCH_LENGTH, PITCH_WIDTH)
  ctx.beginPath()
  ctx.moveTo(px(v, CENTER.x), py(v, 0))
  ctx.lineTo(px(v, CENTER.x), py(v, PITCH_WIDTH))
  ctx.stroke()
  circle(CENTER.x, CENTER.y, CENTER_CIRCLE_RADIUS)
  spot(CENTER.x, CENTER.y)

  for (const goalX of [0, PITCH_LENGTH]) {
    const dir = goalX === 0 ? 1 : -1
    const boxX = goalX === 0 ? 0 : PITCH_LENGTH - BOX_DEPTH
    rect(boxX, CENTER.y - BOX_HALF_WIDTH, BOX_DEPTH, BOX_HALF_WIDTH * 2)
    const sixX = goalX === 0 ? 0 : PITCH_LENGTH - SIX_YARD_DEPTH
    rect(sixX, CENTER.y - SIX_YARD_HALF_WIDTH, SIX_YARD_DEPTH, SIX_YARD_HALF_WIDTH * 2)
    const spotX = goalX + dir * PENALTY_SPOT_DIST
    spot(spotX, CENTER.y)
    // The arc: the part of the 9.15m circle round the spot that lies outside the box.
    const a = Math.acos((BOX_DEPTH - PENALTY_SPOT_DIST) / CENTER_CIRCLE_RADIUS)
    if (dir === 1) circle(spotX, CENTER.y, CENTER_CIRCLE_RADIUS, -a, a)
    else circle(spotX, CENTER.y, CENTER_CIRCLE_RADIUS, Math.PI - a, Math.PI + a)
  }
  for (const [x, y, from] of [
    [0, 0, 0],
    [PITCH_LENGTH, 0, Math.PI / 2],
    [PITCH_LENGTH, PITCH_WIDTH, Math.PI],
    [0, PITCH_WIDTH, Math.PI * 1.5],
  ]) {
    circle(x, y, 1, from, from + Math.PI / 2)
  }
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
}

/** Trace a kick's actual path from the recorded frames: brighter where the ball has been. */
function drawFlight(ctx: CanvasRenderingContext2D, v: View, timeline: Timeline, playhead: number, opts: DrawOptions): void {
  const f = opts.flight
  if (!f || playhead < f.kick.tick) return
  const end = Math.min(f.end ?? timeline.lastTick, timeline.lastTick)
  const fade = playhead > end ? 1 - (playhead - end) / FLIGHT_FADE : 1
  if (fade <= 0 || end <= f.kick.tick) return
  const k = f.kick
  const shot = k.type === 'shot'
  const lofted = k.type === 'clearance' || (k.type === 'pass' && k.lofted)
  const path = (from: number, to: number): void => {
    ctx.beginPath()
    for (let t = from; t <= to; t++) {
      const fr = timeline.frame(t)
      const x = px(v, fr[0])
      const y = pyz(v, fr[1], fr[2])
      if (t === from) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    }
    ctx.stroke()
  }
  ctx.save()
  ctx.lineCap = 'round'
  ctx.lineWidth = shot ? 2 : 1.5
  ctx.setLineDash(shot ? [] : lofted ? [1, 5] : [5, 5])
  const colour = shot ? '255,238,200' : '255,255,255'
  const now = Math.min(Math.floor(playhead), end)
  ctx.strokeStyle = `rgba(${colour},${0.22 * fade})`
  path(now, end)
  ctx.strokeStyle = `rgba(${colour},${(shot ? 0.85 : 0.6) * fade})`
  path(k.tick, now)
  ctx.restore()
}

/** Draw both goals' nets; the scoring one bulges where the ball went in. */
function drawNets(ctx: CanvasRenderingContext2D, v: View, ripple: DrawOptions['ripple']): void {
  ctx.lineWidth = 1
  for (const goalX of [0, PITCH_LENGTH]) {
    const out = goalX === 0 ? -1 : 1
    const hit = ripple && Math.abs(ripple.x - goalX) < 1 ? ripple : null
    const bulge = (y: number): number =>
      hit ? 0.9 * Math.exp(-((y - hit.y) ** 2) / 4) * Math.sin(Math.PI * (1 - hit.age)) * (1 - hit.age) : 0
    ctx.strokeStyle = 'rgba(255,255,255,0.35)'
    // Mesh: lines parallel to the goal line...
    for (let d = 0.5; d <= GOAL_DEPTH + 0.01; d += 0.5) {
      ctx.beginPath()
      for (let y = CENTER.y - GOAL_HALF_WIDTH; y <= CENTER.y + GOAL_HALF_WIDTH + 0.01; y += 0.25) {
        const x = goalX + out * (d + bulge(y) * (d / GOAL_DEPTH))
        if (y === CENTER.y - GOAL_HALF_WIDTH) ctx.moveTo(px(v, x), py(v, y))
        else ctx.lineTo(px(v, x), py(v, y))
      }
      ctx.stroke()
    }
    // ...and across it.
    for (let y = CENTER.y - GOAL_HALF_WIDTH; y <= CENTER.y + GOAL_HALF_WIDTH + 0.01; y += 0.61) {
      ctx.beginPath()
      ctx.moveTo(px(v, goalX), py(v, y))
      ctx.lineTo(px(v, goalX + out * (GOAL_DEPTH + bulge(y))), py(v, y))
      ctx.stroke()
    }
    // Frame and posts.
    ctx.strokeStyle = 'rgba(255,255,255,0.95)'
    ctx.lineWidth = Math.max(1.5, 0.15 * v.scale)
    ctx.beginPath()
    ctx.moveTo(px(v, goalX), py(v, CENTER.y - GOAL_HALF_WIDTH))
    ctx.lineTo(px(v, goalX + out * GOAL_DEPTH), py(v, CENTER.y - GOAL_HALF_WIDTH))
    ctx.lineTo(px(v, goalX + out * GOAL_DEPTH), py(v, CENTER.y + GOAL_HALF_WIDTH))
    ctx.lineTo(px(v, goalX), py(v, CENTER.y + GOAL_HALF_WIDTH))
    ctx.stroke()
    ctx.lineWidth = 1
  }
}

/** Draw the match at a fractional tick, interpolating between recorded ticks. */
export function drawFrame(
  ctx: CanvasRenderingContext2D,
  v: View,
  pitch: HTMLCanvasElement,
  timeline: Timeline,
  playhead: number,
  opts: DrawOptions,
): void {
  ctx.setTransform(1, 0, 0, 1, 0, 0)
  ctx.drawImage(pitch, 0, 0)
  ctx.setTransform(v.dpr, 0, 0, v.dpr, 0, 0)
  drawNets(ctx, v, opts.ripple)
  drawFlight(ctx, v, timeline, playhead, opts)

  const t0 = Math.floor(playhead)
  const a = timeline.frame(t0)
  const b = timeline.frame(Math.min(t0 + 1, timeline.lastTick))
  const f = playhead - t0
  // Don't slide across a jump (half-time repositioning, a restart spot).
  const mix = (i: number, maxJump: number): [number, number] => {
    // (x, y) at i, i + 1 interpolated between the two ticks.
    const ax = a[i]
    const ay = a[i + 1]
    const bx = b[i]
    const by = b[i + 1]
    if (Number.isNaN(bx) || Math.hypot(bx - ax, by - ay) > maxJump) return [ax, ay]
    return [ax + (bx - ax) * f, ay + (by - ay) * f]
  }

  const match: MatchState = timeline.state
  const r = Math.max(6, 1.3 * v.scale)
  const fontSize = Math.max(8, Math.round(r * 1.05))

  match.players.forEach((p, i) => {
    const o = PLAYERS_AT + i * 2
    if (Number.isNaN(a[o])) return
    const [x, y] = mix(o, 3)
    const kit = p.slot.role === 'GK' ? opts.keeperKits[p.team] : opts.kits[p.team]
    const cx = px(v, x)
    const cy = py(v, y)
    // Soft shadow, then the shirt.
    ctx.beginPath()
    ctx.ellipse(cx + r * 0.2, cy + r * 0.35, r * 0.95, r * 0.6, 0, 0, Math.PI * 2)
    ctx.fillStyle = 'rgba(0,0,0,0.18)'
    ctx.fill()
    ctx.beginPath()
    ctx.arc(cx, cy, r, 0, Math.PI * 2)
    ctx.fillStyle = kit.shirt
    ctx.fill()
    ctx.lineWidth = 1
    ctx.strokeStyle = 'rgba(0,0,0,0.35)'
    ctx.stroke()
    if (r >= 7) {
      ctx.fillStyle = kit.number
      ctx.font = `600 ${fontSize}px "Barlow Condensed", "Arial Narrow", sans-serif`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(String(p.def.shirt), cx, cy + 0.5)
    }
    if (opts.showRoles) drawRole(ctx, p.slot.role, cx, cy + r + 2, fontSize)
  })

  let [bx, by] = mix(0, 4)
  let bz = Number.isNaN(b[2]) ? a[2] : a[2] + (b[2] - a[2]) * f
  if (opts.ballInNet) {
    bx = opts.ballInNet.x + (opts.ballInNet.x < 1 ? -1.2 : 1.2)
    by = opts.ballInNet.y
    bz = 0
  }
  // Shadow on the grass, shrinking and fading as the ball climbs; the ball itself drawn lifted.
  const br = Math.max(4, 0.62 * v.scale) * (1 + Math.min(bz, 8) * 0.05)
  const shadowK = 1 / (1 + bz * 0.25)
  ctx.beginPath()
  ctx.ellipse(px(v, bx) + br * 0.3, py(v, by) + br * 0.35, br * shadowK, br * 0.65 * shadowK, 0, 0, Math.PI * 2)
  ctx.fillStyle = `rgba(0,0,0,${0.32 * shadowK})`
  ctx.fill()
  ctx.beginPath()
  ctx.arc(px(v, bx), pyz(v, by, bz), br, 0, Math.PI * 2)
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
