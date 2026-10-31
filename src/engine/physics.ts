/**
 * Ball flight. One function steps the ball by one tick; the match loop moves the ball with it and
 * the AI predicts with it, so a prediction is always exactly what the loop will do.
 */
import { type Vec, add, len, scale } from './geometry.ts'
import { BALL_FRICTION, BOUNCE, DT, GRAVITY, MIN_BOUNCE_SPEED } from './constants.ts'

export interface BallMotion {
  pos: Vec
  vel: Vec
  z: number
  vz: number
}

export const isAirborne = (b: { z: number; vz: number }): boolean => b.z > 0 || b.vz > 0

/**
 * One tick of flight. Returns the new motion plus `rawZ`, the height before any bounce
 * (can be negative), for interpolating height along the tick's path.
 */
export function advanceBall(b: BallMotion): BallMotion & { rawZ: number } {
  const pos = add(b.pos, scale(b.vel, DT))
  if (isAirborne(b)) {
    // Exact for constant gravity, so heights at tick boundaries match the closed-form parabola.
    const rawZ = b.z + b.vz * DT - 0.5 * GRAVITY * DT * DT
    let vz = b.vz - GRAVITY * DT
    let vel = b.vel
    let z = rawZ
    if (z <= 0) {
      z = 0
      if (-vz > MIN_BOUNCE_SPEED) {
        vz = -vz * BOUNCE
        vel = scale(vel, 0.8)
      } else vz = 0
    }
    return { pos, vel, z, vz, rawZ }
  }
  const sp = len(b.vel)
  const vel = sp > 0 ? scale(b.vel, Math.max(0, sp - BALL_FRICTION * DT) / sp) : b.vel
  return { pos, vel, z: 0, vz: 0, rawZ: 0 }
}

/** Launch for a lofted ball that lands `d` metres away after `time` seconds. */
export function loft(d: number, time: number): { speed: number; vz: number } {
  return { speed: d / time, vz: (GRAVITY * time) / 2 }
}

/** Flight time we'd choose for a lofted ball over distance d. */
export const loftTime = (d: number): number => Math.min(2.6, Math.max(1.0, 0.6 + d / 25))

/** Vertical launch speed for a shot to be at height h when it has travelled for `time` seconds. */
export const shotVz = (h: number, time: number): number => (h + 0.5 * GRAVITY * time * time) / time
