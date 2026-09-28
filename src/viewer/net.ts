/**
 * What a goal looks like after the ball crosses the line: it carries on into the goal at the pace
 * and height it went in, stretches the back of the net where it hits, then drops and settles while
 * the net springs back. The engine re-spots the ball for kick-off the moment it's a goal, so this
 * is drawn from the goal event and the ball's last recorded position before it went in.
 */
import { CROSSBAR_HEIGHT, GOAL_HALF_WIDTH, CENTER } from '../engine/index.ts'

export const GOAL_DEPTH = 2
const G = 9.81
const BALL_R = 0.11
/** Seconds the net takes to stretch to its fullest. */
const STRETCH_S = 0.22

export interface NetState {
  /** Where the ball is (pitch metres, z up). */
  ball: { x: number; y: number; z: number }
  /** How far the back of the net is pushed out, and where: 0 before the ball reaches it. */
  bulge: { goalX: number; y: number; z: number; amount: number }
}

/**
 * `entry` is where the ball crossed the line (z its height there), `before` where it was a tick
 * earlier (0.1 s), `age` seconds since it crossed.
 */
export function netAt(entry: { x: number; y: number; z: number }, before: { x: number; y: number; z: number }, age: number): NetState {
  const goalX = entry.x < 1 ? 0 : 105
  const out = goalX === 0 ? -1 : 1
  // Velocity as it went in (m/s), always into the goal.
  let vx = (entry.x - before.x) * 10
  const vy = (entry.y - before.y) * 10
  const vz = (entry.z - before.z) * 10
  if (vx * out < 3) vx = 3 * out
  const speed = Math.hypot(vx, vy)
  const lo = CENTER.y - GOAL_HALF_WIDTH + BALL_R * 2
  const hi = CENTER.y + GOAL_HALF_WIDTH - BALL_R * 2
  const heightAt = (t: number): number => Math.min(CROSSBAR_HEIGHT - BALL_R * 2, Math.max(BALL_R, entry.z + vz * t - 0.5 * G * t * t))

  // 1. Through the goal mouth to the back of the net.
  const toBack = Math.min(0.6, GOAL_DEPTH / Math.abs(vx))
  const yAt = (t: number): number => Math.min(hi, Math.max(lo, entry.y + vy * t))
  if (age < toBack) {
    return { ball: { x: entry.x + vx * age, y: yAt(age), z: heightAt(age) }, bulge: { goalX, y: yAt(age), z: heightAt(age), amount: 0 } }
  }

  // 2. The net takes it: stretched further the harder it was hit.
  const hitY = yAt(toBack)
  const hitZ = heightAt(toBack)
  const stretch = Math.min(1.2, Math.max(0.25, speed * 0.045))
  const back = goalX + out * GOAL_DEPTH
  const t = age - toBack
  if (t < STRETCH_S) {
    const push = stretch * Math.sin((Math.PI / 2) * (t / STRETCH_S))
    return { ball: { x: back + out * push, y: hitY, z: hitZ }, bulge: { goalX, y: hitY, z: hitZ, amount: push } }
  }

  // 3. It springs back, the ball drops out of it to the floor of the goal, and the net wobbles.
  const s = t - STRETCH_S
  const wobble = stretch * Math.cos(9 * s) * Math.exp(-4 * s)
  const fall = Math.max(BALL_R, hitZ - 0.5 * G * s * s)
  // Pushed back out a little by the net, then rolling to a stop.
  const settle = stretch * Math.exp(-5 * s) - 0.35 * (1 - Math.exp(-3 * s))
  return { ball: { x: back + out * settle, y: hitY, z: fall }, bulge: { goalX, y: hitY, z: hitZ, amount: wobble } }
}
