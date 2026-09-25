/** Simulation tuning constants. Distances in metres, times in seconds. */

export const DT = 0.1
export const TICKS_PER_SECOND = 10
export const TICKS_PER_MINUTE = 600

/** Ball carried at this distance in front of the owner. */
export const DRIBBLE_OFFSET = 0.6
/** A player within this distance of the ball's path can touch it. */
export const CONTROL_RADIUS = 1.0
/** Extra reach a goalkeeper gets inside his own box (diving). Scaled by keeping. */
export const GK_EXTRA_REACH = 1.6
/** Ball slower than this can be controlled; faster must be blocked/saved. */
export const CONTROLLABLE_SPEED = 20
export const BALL_FRICTION = 3.0
export const PASS_ARRIVAL_SPEED = 7
export const MAX_BALL_SPEED = 35

export const PLAYER_ACCEL = 6
export const TACKLE_RANGE = 1.6
export const MAX_SHOT_DISTANCE = 30
export const MAX_FREE_KICK_SHOT_DISTANCE = 32
export const GK_REACTION_TICKS = 2
/** A kicker can't touch his own kick for this long. */
export const KICKER_IMMUNITY_TICKS = 3

export const RESTART_SPOT_TOLERANCE = 0.6
/** If a restart's positional conditions aren't met by then, it's taken anyway (and flagged). */
export const RESTART_TIMEOUT_TICKS = 300
