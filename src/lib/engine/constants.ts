/**
 * Single source of truth for field geometry and physics tuning.
 * The renderer and input layers derive all their coordinates from these.
 */

/** Logical field dimensions (portrait). Rendering scales this to the screen. */
export const FIELD = {
	width: 400,
	height: 660,
	/** Wooden frame thickness around the play area. */
	margin: 22
} as const;

export const GOAL_GAP = 150;
export const DISC_RADIUS = 15;
export const BALL_RADIUS = 8.5;

/** Matter.js body tuning. `frictionAir` simulates the drag of the felt. */
export const PHYSICS = {
	discFrictionAir: 0.052,
	ballFrictionAir: 0.028,
	discRestitution: 0.5,
	ballRestitution: 0.6,
	wallRestitution: 0.55,
	discDensity: 0.0016,
	ballDensity: 0.0009
} as const;

/** Slingshot: velocity = pull * power, capped at maxSpeed. minPull ignores tiny drags. */
export const SHOT = {
	power: 0.19,
	maxSpeed: 24,
	minPull: 6
} as const;

/** Below this speed everything is considered at rest and the turn can switch. */
export const SETTLE_SPEED = 0.14;

/** Frames of continuous stillness required before ending a turn. */
export const SETTLE_FRAMES = 10;

/** Frames of goal lock-out after a goal, to avoid double-counting. */
export const GOAL_LOCK_FRAMES = 90;
