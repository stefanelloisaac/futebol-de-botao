import type { MatchSnapshot, ShotCommand, TeamId } from '../engine';
import { FIELD, DISC_RADIUS, SHOT } from '../engine';
import type { AimState } from '../render/PitchRenderer';

export interface PointerControllerOptions {
	getSnapshot: () => MatchSnapshot;
	/** False while the AI controls the active team, so pointer input is ignored. */
	isHumanTurn: () => boolean;
	onShoot: (cmd: ShotCommand) => void;
}

interface Selection {
	discId: number;
	team: TeamId;
	sx: number;
	sy: number;
	cx: number;
	cy: number;
}

/**
 * Translates pointer/touch gestures into shots. Pull a disc back and release,
 * slingshot-style. The same code path serves mouse and touch via pointer events.
 */
export class PointerController {
	private selection: Selection | null = null;

	constructor(
		private canvas: HTMLCanvasElement,
		private options: PointerControllerOptions
	) {
		canvas.addEventListener('pointerdown', this.onDown);
		window.addEventListener('pointermove', this.onMove);
		window.addEventListener('pointerup', this.onUp);
	}

	destroy(): void {
		this.canvas.removeEventListener('pointerdown', this.onDown);
		window.removeEventListener('pointermove', this.onMove);
		window.removeEventListener('pointerup', this.onUp);
	}

	getAim(): AimState | null {
		if (!this.selection) return null;
		const { sx, sy, cx, cy } = this.selection;
		return { sx, sy, cx, cy };
	}

	private toLogical(e: PointerEvent): { x: number; y: number } {
		const rect = this.canvas.getBoundingClientRect();
		return {
			x: (e.clientX - rect.left) * (FIELD.width / rect.width),
			y: (e.clientY - rect.top) * (FIELD.height / rect.height)
		};
	}

	private onDown = (e: PointerEvent): void => {
		const snapshot = this.options.getSnapshot();
		if (snapshot.phase !== 'aim' || !this.options.isHumanTurn()) return;

		const p = this.toLogical(e);
		let hit: MatchSnapshot['discs'][number] | null = null;
		let best = Infinity;
		for (const disc of snapshot.discs) {
			if (disc.team !== snapshot.activeTeam) continue;
			const dist = Math.hypot(disc.position.x - p.x, disc.position.y - p.y);
			if (dist < DISC_RADIUS + 8 && dist < best) {
				best = dist;
				hit = disc;
			}
		}
		if (!hit) return;

		this.selection = {
			discId: hit.id,
			team: hit.team,
			sx: hit.position.x,
			sy: hit.position.y,
			cx: p.x,
			cy: p.y
		};
		e.preventDefault();
	};

	private onMove = (e: PointerEvent): void => {
		if (!this.selection) return;
		const p = this.toLogical(e);
		this.selection.cx = p.x;
		this.selection.cy = p.y;
		e.preventDefault();
	};

	private onUp = (e: PointerEvent): void => {
		const sel = this.selection;
		if (!sel) return;
		this.selection = null;

		const pullX = sel.sx - sel.cx;
		const pullY = sel.sy - sel.cy;
		const pull = Math.hypot(pullX, pullY);
		if (pull <= SHOT.minPull) return;

		let vx = pullX * SHOT.power;
		let vy = pullY * SHOT.power;
		const speed = Math.hypot(vx, vy);
		if (speed > SHOT.maxSpeed) {
			vx = (vx / speed) * SHOT.maxSpeed;
			vy = (vy / speed) * SHOT.maxSpeed;
		}

		this.options.onShoot({ team: sel.team, discId: sel.discId, velocity: { x: vx, y: vy } });
		e.preventDefault();
	};
}
