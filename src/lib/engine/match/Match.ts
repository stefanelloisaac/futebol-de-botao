import Matter from 'matter-js';
import type { MatchPhase, MatchSnapshot, ShotCommand, TeamId } from '../types';
import {
	FIELD,
	GOAL_GAP,
	SETTLE_SPEED,
	SETTLE_FRAMES,
	GOAL_LOCK_FRAMES
} from '../constants';
import { createWorld, type PhysicsWorld } from '../physics/world';

const { Body, Engine } = Matter;

export interface MatchEvents {
	/** Fired when a team scores. `scorer` is the team that earned the point. */
	onGoal?: (scorer: TeamId) => void;
	/** Fired when control passes to a team and it may shoot. */
	onTurnReady?: (team: TeamId) => void;
}

function other(team: TeamId): TeamId {
	return team === 'red' ? 'blue' : 'red';
}

/**
 * The authoritative match logic. Deliberately free of rendering and input so it
 * can run in the browser, on mobile, and one day on the server unchanged.
 */
export class Match {
	private world: PhysicsWorld;
	private events: MatchEvents;

	scoreRed = 0;
	scoreBlue = 0;
	activeTeam: TeamId = 'red';
	phase: MatchPhase = 'aim';

	private settleCount = 0;
	private goalLock = 0;

	constructor(events: MatchEvents = {}) {
		this.world = createWorld();
		this.events = events;
	}

	/** Applies a shot to a disc and enters the resolving phase. Ignored when not aiming. */
	applyShot(cmd: ShotCommand): void {
		if (this.phase !== 'aim' || cmd.team !== this.activeTeam) return;
		const disc = this.world.discs.find((d) => d.team === cmd.team && d.id === cmd.discId);
		if (!disc) return;
		Body.setVelocity(disc.body, cmd.velocity);
		this.phase = 'resolving';
		this.settleCount = 0;
	}

	/** Advances the simulation by one fixed step and runs the rules. */
	step(deltaMs: number): void {
		Engine.update(this.world.engine, deltaMs);

		if (this.goalLock > 0) this.goalLock--;
		this.dampMicroDrift();
		this.detectGoal();

		if (this.phase === 'resolving') {
			this.settleCount = this.maxSpeed() < SETTLE_SPEED ? this.settleCount + 1 : 0;
			if (this.settleCount > SETTLE_FRAMES && this.goalLock === 0) {
				this.activeTeam = other(this.activeTeam);
				this.phase = 'aim';
				this.events.onTurnReady?.(this.activeTeam);
			}
		}
	}

	snapshot(): MatchSnapshot {
		return {
			discs: this.world.discs.map((d) => ({
				id: d.id,
				team: d.team,
				keeper: d.keeper,
				position: { x: d.body.position.x, y: d.body.position.y },
				radius: d.body.circleRadius ?? 0
			})),
			ball: {
				position: { x: this.world.ball.position.x, y: this.world.ball.position.y },
				radius: this.world.ball.circleRadius ?? 0
			},
			scoreRed: this.scoreRed,
			scoreBlue: this.scoreBlue,
			activeTeam: this.activeTeam,
			phase: this.phase
		};
	}

	/** Resets bodies to kickoff and gives the next shot to `kickoff` (default: current). */
	reset(kickoff: TeamId = this.activeTeam): void {
		for (const d of this.world.discs) this.resetBody(d.body);
		this.resetBody(this.world.ball);
		this.activeTeam = kickoff;
		this.phase = 'aim';
		this.settleCount = 0;
		this.goalLock = 0;
	}

	restart(): void {
		this.scoreRed = 0;
		this.scoreBlue = 0;
		this.reset('red');
	}

	private resetBody(body: Matter.Body): void {
		const home = this.world.home.get(body.id);
		if (!home) return;
		Body.setPosition(body, home);
		Body.setVelocity(body, { x: 0, y: 0 });
		Body.setAngularVelocity(body, 0);
	}

	private detectGoal(): void {
		if (this.goalLock > 0) return;
		const { x, y } = this.world.ball.position;
		const inGap = x > FIELD.width / 2 - GOAL_GAP / 2 && x < FIELD.width / 2 + GOAL_GAP / 2;
		if (!inGap) return;

		if (y < FIELD.margin) this.scoreGoal('red');
		else if (y > FIELD.height - FIELD.margin) this.scoreGoal('blue');
	}

	private scoreGoal(scorer: TeamId): void {
		if (scorer === 'red') this.scoreRed++;
		else this.scoreBlue++;
		this.goalLock = GOAL_LOCK_FRAMES;
		this.events.onGoal?.(scorer);
		// The team that conceded kicks off next.
		this.reset(other(scorer));
	}

	private dampMicroDrift(): void {
		for (const d of this.world.discs) {
			if (d.body.speed < 0.12) Body.setVelocity(d.body, { x: 0, y: 0 });
		}
		if (this.world.ball.speed < 0.12) Body.setVelocity(this.world.ball, { x: 0, y: 0 });
	}

	private maxSpeed(): number {
		let m = this.world.ball.speed;
		for (const d of this.world.discs) m = Math.max(m, d.body.speed);
		return m;
	}
}
