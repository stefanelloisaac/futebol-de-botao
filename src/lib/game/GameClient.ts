import { Match, computeAiShot, FIELD, type MatchPhase, type TeamId } from '../engine';
import { PitchRenderer } from '../render/PitchRenderer';
import { PointerController } from '../input/PointerController';

export type GameMode = 'single' | 'local';

export interface GameState {
	scoreRed: number;
	scoreBlue: number;
	activeTeam: TeamId;
	phase: MatchPhase;
}

export interface GameClientOptions {
	getMode: () => GameMode;
	onState?: (state: GameState) => void;
	onGoal?: (scorer: TeamId) => void;
}

const AI_DELAY_MS = 650;
const STEP_MS = 1000 / 60;

/** Runs a single local match: fixed-step simulation, rendering and input wiring. */
export class GameClient {
	private ctx: CanvasRenderingContext2D;
	private match: Match;
	private renderer = new PitchRenderer();
	private pointer: PointerController;

	private rafId = 0;
	private aiScheduled = false;
	private lastState = '';

	constructor(
		private canvas: HTMLCanvasElement,
		private options: GameClientOptions
	) {
		const dpr = Math.max(1, Math.min(window.devicePixelRatio || 1, 2.5));
		canvas.width = FIELD.width * dpr;
		canvas.height = FIELD.height * dpr;
		const ctx = canvas.getContext('2d');
		if (!ctx) throw new Error('2D canvas context unavailable');
		this.ctx = ctx;
		this.ctx.scale(dpr, dpr);

		this.match = new Match({ onGoal: (scorer) => this.options.onGoal?.(scorer) });

		this.pointer = new PointerController(canvas, {
			getSnapshot: () => this.match.snapshot(),
			isHumanTurn: () => this.isHumanTurn(),
			onShoot: (cmd) => this.match.applyShot(cmd)
		});
	}

	start(): void {
		const tick = (): void => {
			this.match.step(STEP_MS);
			this.maybeScheduleAi();
			this.renderer.draw(this.ctx, this.match.snapshot(), this.pointer.getAim());
			this.emitState();
			this.rafId = requestAnimationFrame(tick);
		};
		this.rafId = requestAnimationFrame(tick);
	}

	stop(): void {
		cancelAnimationFrame(this.rafId);
		this.pointer.destroy();
	}

	restart(): void {
		this.match.restart();
	}

	private isHumanTurn(): boolean {
		return !(this.options.getMode() === 'single' && this.match.activeTeam === 'blue');
	}

	private maybeScheduleAi(): void {
		if (this.aiScheduled) return;
		if (this.options.getMode() !== 'single') return;
		if (this.match.phase !== 'aim' || this.match.activeTeam !== 'blue') return;

		this.aiScheduled = true;
		window.setTimeout(() => {
			this.aiScheduled = false;
			if (this.options.getMode() !== 'single') return;
			if (this.match.phase !== 'aim' || this.match.activeTeam !== 'blue') return;
			const cmd = computeAiShot(this.match.snapshot(), 'blue');
			if (cmd) this.match.applyShot(cmd);
		}, AI_DELAY_MS);
	}

	private emitState(): void {
		const state: GameState = {
			scoreRed: this.match.scoreRed,
			scoreBlue: this.match.scoreBlue,
			activeTeam: this.match.activeTeam,
			phase: this.match.phase
		};
		const key = `${state.scoreRed}-${state.scoreBlue}-${state.activeTeam}-${state.phase}`;
		if (key !== this.lastState) {
			this.lastState = key;
			this.options.onState?.(state);
		}
	}
}
