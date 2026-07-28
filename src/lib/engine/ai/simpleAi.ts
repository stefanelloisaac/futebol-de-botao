import type { MatchSnapshot, ShotCommand, TeamId, Vec2 } from '../types';
import { FIELD, DISC_RADIUS, BALL_RADIUS } from '../constants';

function sub(a: Vec2, b: Vec2): Vec2 {
	return { x: a.x - b.x, y: a.y - b.y };
}
function len(v: Vec2): number {
	return Math.hypot(v.x, v.y);
}
function normalise(v: Vec2): Vec2 {
	const l = len(v) || 1;
	return { x: v.x / l, y: v.y / l };
}

/** The goal a team attacks (red shoots up, blue shoots down). */
function targetGoal(team: TeamId): Vec2 {
	return team === 'red'
		? { x: FIELD.width / 2, y: FIELD.margin }
		: { x: FIELD.width / 2, y: FIELD.height - FIELD.margin };
}

/**
 * Picks the disc nearest the ball and flicks it so the ball is pushed toward the
 * opponent goal, with a little randomness so it feels human.
 */
export function computeAiShot(snapshot: MatchSnapshot, team: TeamId): ShotCommand | null {
	const own = snapshot.discs.filter((d) => d.team === team);
	if (own.length === 0) return null;

	const ball = snapshot.ball.position;
	let shooter = own[0];
	let best = Infinity;
	for (const d of own) {
		const dist = len(sub(d.position, ball));
		if (dist < best) {
			best = dist;
			shooter = d;
		}
	}

	const desired = normalise(sub(targetGoal(team), ball));
	const contact: Vec2 = {
		x: ball.x - desired.x * (DISC_RADIUS + BALL_RADIUS),
		y: ball.y - desired.y * (DISC_RADIUS + BALL_RADIUS)
	};
	const aim = normalise(sub(contact, shooter.position));
	const angle = Math.atan2(aim.y, aim.x) + (Math.random() - 0.5) * 0.28;
	const power = 15 + Math.random() * 7;

	return {
		team,
		discId: shooter.id,
		velocity: { x: Math.cos(angle) * power, y: Math.sin(angle) * power }
	};
}
