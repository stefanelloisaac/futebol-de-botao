import Matter from 'matter-js';
import type { TeamId, Vec2 } from '../types';
import { FIELD, GOAL_GAP, DISC_RADIUS, BALL_RADIUS, PHYSICS } from '../constants';

const { Engine, Bodies, Composite } = Matter;

export interface DiscBody {
	body: Matter.Body;
	id: number;
	team: TeamId;
	keeper: boolean;
}

export interface PhysicsWorld {
	engine: Matter.Engine;
	discs: DiscBody[];
	ball: Matter.Body;
	/** Kickoff positions, keyed by Matter body id, for resetting. */
	home: Map<number, Vec2>;
}

type Slot = readonly [x: number, y: number, keeper?: boolean];

/** Disc formations per team (keeper marked with `true`). */
const FORMATIONS: Record<TeamId, readonly Slot[]> = {
	red: [
		[FIELD.width / 2, FIELD.height - FIELD.margin - 30, true],
		[FIELD.width / 2 - 78, FIELD.height * 0.72],
		[FIELD.width / 2 + 78, FIELD.height * 0.72],
		[FIELD.width / 2, FIELD.height * 0.6]
	],
	blue: [
		[FIELD.width / 2, FIELD.margin + 30, true],
		[FIELD.width / 2 - 78, FIELD.height * 0.28],
		[FIELD.width / 2 + 78, FIELD.height * 0.28],
		[FIELD.width / 2, FIELD.height * 0.4]
	]
};

function makeWall(x: number, y: number, w: number, h: number): Matter.Body {
	return Bodies.rectangle(x, y, w, h, {
		isStatic: true,
		restitution: PHYSICS.wallRestitution,
		friction: 0
	});
}

function makeDisc(x: number, y: number): Matter.Body {
	return Bodies.circle(x, y, DISC_RADIUS, {
		restitution: PHYSICS.discRestitution,
		friction: 0,
		frictionAir: PHYSICS.discFrictionAir,
		density: PHYSICS.discDensity
	});
}

function makeTeam(team: TeamId): DiscBody[] {
	return FORMATIONS[team].map((slot, i) => ({
		body: makeDisc(slot[0], slot[1]),
		id: i + 1,
		team,
		keeper: slot[2] === true
	}));
}

/** Boundary walls with gaps for the goals, plus a back-of-net wall behind each goal. */
function makeWalls(): Matter.Body[] {
	const { width: W, height: H, margin: M } = FIELD;
	const px1 = W - M; // right inner edge
	const gx0 = W / 2 - GOAL_GAP / 2;
	const gx1 = W / 2 + GOAL_GAP / 2;
	return [
		makeWall(M / 2, H / 2, M, H), // left
		makeWall(W - M / 2, H / 2, M, H), // right
		makeWall((M + gx0) / 2, M / 2, gx0 - M, M), // top-left
		makeWall((gx1 + px1) / 2, M / 2, px1 - gx1, M), // top-right
		makeWall((M + gx0) / 2, H - M / 2, gx0 - M, M), // bottom-left
		makeWall((gx1 + px1) / 2, H - M / 2, px1 - gx1, M), // bottom-right
		makeWall(W / 2, 6, GOAL_GAP + 8, 8), // top back-of-net
		makeWall(W / 2, H - 6, GOAL_GAP + 8, 8) // bottom back-of-net
	];
}

/** Creates a fresh physics world with a top-down table (no gravity). */
export function createWorld(): PhysicsWorld {
	const engine = Engine.create();
	engine.gravity.x = 0;
	engine.gravity.y = 0;

	const discs = [...makeTeam('red'), ...makeTeam('blue')];
	const ball = Bodies.circle(FIELD.width / 2, FIELD.height / 2, BALL_RADIUS, {
		restitution: PHYSICS.ballRestitution,
		friction: 0,
		frictionAir: PHYSICS.ballFrictionAir,
		density: PHYSICS.ballDensity
	});

	Composite.add(engine.world, [...makeWalls(), ...discs.map((d) => d.body), ball]);

	const home = new Map<number, Vec2>();
	for (const d of discs) home.set(d.body.id, { x: d.body.position.x, y: d.body.position.y });
	home.set(ball.id, { x: ball.position.x, y: ball.position.y });

	return { engine, discs, ball, home };
}
