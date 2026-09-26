/** Simulation tuning constants. Distances in metres, times in seconds. */

export const DT = 0.1
export const TICKS_PER_SECOND = 10
export const TICKS_PER_MINUTE = 600

/** Ball carried at this distance in front of the owner. */
export const DRIBBLE_OFFSET = 0.6
/** A player within this distance of the ball's path can touch it. */
export const CONTROL_RADIUS = 1.0
/** Extra reach a goalkeeper gets inside his own box (diving). Scaled by keeping. */
export const GK_EXTRA_REACH = 2.2
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

export const GRAVITY = 9.81
export const CROSSBAR_HEIGHT = 2.44
/** Highest ball a player can play: an outfield header, a keeper's hands inside his box. */
export const HEADER_REACH = 2.4
export const GK_HAND_REACH = 2.8
/** Above this the ball is played with the head or chest rather than the feet. */
export const AERIAL_HEIGHT = 1.0
/** After a mistimed header, a player can't play the ball again for this long. */
export const HEADER_RECOVERY_TICKS = 4
/** Fraction of vertical speed kept on a bounce; slower than this and it just rolls. */
export const BOUNCE = 0.45
export const MIN_BOUNCE_SPEED = 1.5

/** Ticks after a keeper releases the ball from his hands during which no opponent may play it. */
export const KEEPER_RELEASE_TICKS = 4
/** How far opponents stay from a keeper holding the ball. */
export const KEEPER_STAND_OFF = 8

/** How close a player behind the ball must be to block it as it's struck away from him. */
export const CHARGE_DOWN_REACH = 0.6
/** Chance a player right on the ball as it's struck gets something on it. */
export const CHARGE_DOWN_CHANCE = 0.35

/** A keeper reaching the ball further from his body than this has had to dive for it. */
export const KEEPER_BODY_REACH = 1.0
/** A tackle from further away than this is a slide. */
export const SLIDE_TACKLE_DISTANCE = 1.15
/** Ticks the goal-scoring team spends celebrating before heading back for kick-off. */
export const CELEBRATION_TICKS = 70
