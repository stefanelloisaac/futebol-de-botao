import type { MatchSnapshot, DiscView } from '../engine';
import { FIELD, GOAL_GAP, DISC_RADIUS, BALL_RADIUS } from '../engine';
import { THEME, TEAM_COLORS } from './theme';
import { createFeltTexture } from './textures';

/** The slingshot indicator, in logical field coordinates. */
export interface AimState {
	/** Disc centre (anchor). */
	sx: number;
	sy: number;
	/** Current pointer position. */
	cx: number;
	cy: number;
}

const { width: W, height: H, margin: M } = FIELD;
const PW = W - 2 * M;
const PH = H - 2 * M;
const PX0 = M;
const PY0 = M;
const GX0 = W / 2 - GOAL_GAP / 2;
const GX1 = W / 2 + GOAL_GAP / 2;
const TAU = Math.PI * 2;

/** Renders the match onto a 2D canvas context. Pure presentation, no game logic. */
export class PitchRenderer {
	private felt = createFeltTexture();

	draw(ctx: CanvasRenderingContext2D, snapshot: MatchSnapshot, aim: AimState | null): void {
		ctx.clearRect(0, 0, W, H);
		this.drawWood(ctx);
		this.drawFelt(ctx);
		this.drawLines(ctx);
		this.drawGoals(ctx);
		for (const disc of snapshot.discs) this.drawDisc(ctx, disc, snapshot);
		this.drawBall(ctx, snapshot);
		if (aim) this.drawAim(ctx, aim);
	}

	private roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number): void {
		ctx.beginPath();
		ctx.moveTo(x + r, y);
		ctx.arcTo(x + w, y, x + w, y + h, r);
		ctx.arcTo(x + w, y + h, x, y + h, r);
		ctx.arcTo(x, y + h, x, y, r);
		ctx.arcTo(x, y, x + w, y, r);
		ctx.closePath();
	}

	private drawWood(ctx: CanvasRenderingContext2D): void {
		const g = ctx.createLinearGradient(0, 0, 0, H);
		g.addColorStop(0, THEME.woodLight);
		g.addColorStop(0.5, THEME.wood);
		g.addColorStop(1, THEME.woodDark);
		ctx.fillStyle = g;
		this.roundRect(ctx, 0, 0, W, H, 14);
		ctx.fill();

		ctx.save();
		ctx.globalAlpha = 0.14;
		ctx.strokeStyle = '#3a2413';
		ctx.lineWidth = 1;
		for (let i = 0; i < 26; i++) {
			const y = Math.random() * H;
			ctx.beginPath();
			ctx.moveTo(0, y);
			ctx.bezierCurveTo(W * 0.3, y + (Math.random() * 8 - 4), W * 0.7, y + (Math.random() * 8 - 4), W, y);
			ctx.stroke();
		}
		ctx.restore();

		ctx.strokeStyle = 'rgba(0,0,0,.4)';
		ctx.lineWidth = 2;
		this.roundRect(ctx, M - 4, M - 4, PW + 8, PH + 8, 6);
		ctx.stroke();
	}

	private drawFelt(ctx: CanvasRenderingContext2D): void {
		ctx.save();
		this.roundRect(ctx, PX0, PY0, PW, PH, 4);
		ctx.clip();
		ctx.drawImage(this.felt, PX0, PY0, PW, PH);
		const v = ctx.createRadialGradient(W / 2, H / 2, H * 0.18, W / 2, H / 2, H * 0.62);
		v.addColorStop(0, 'rgba(0,0,0,0)');
		v.addColorStop(1, 'rgba(0,0,0,.34)');
		ctx.fillStyle = v;
		ctx.fillRect(PX0, PY0, PW, PH);
		ctx.restore();
	}

	/** Hand-painted look: a faint offset ghost stroke under the main line. */
	private paintLine(ctx: CanvasRenderingContext2D, fn: () => void): void {
		ctx.lineCap = 'round';
		ctx.strokeStyle = 'rgba(239,228,201,.25)';
		ctx.lineWidth = 4.5;
		ctx.save();
		ctx.translate(0.8, 0.8);
		fn();
		ctx.restore();
		ctx.strokeStyle = 'rgba(239,228,201,.9)';
		ctx.lineWidth = 2.6;
		fn();
	}

	private drawLines(ctx: CanvasRenderingContext2D): void {
		const midY = H / 2;
		this.paintLine(ctx, () => {
			ctx.beginPath();
			ctx.moveTo(PX0 + 6, midY);
			ctx.lineTo(PX0 + PW - 6, midY);
			ctx.stroke();
		});
		this.paintLine(ctx, () => {
			ctx.beginPath();
			ctx.arc(W / 2, midY, 54, 0, TAU);
			ctx.stroke();
		});
		ctx.save();
		ctx.fillStyle = 'rgba(239,228,201,.85)';
		ctx.beginPath();
		ctx.arc(W / 2, midY, 4, 0, TAU);
		ctx.fill();
		ctx.restore();

		const bw = 150;
		const bh = 64;
		this.paintLine(ctx, () => ctx.strokeRect(W / 2 - bw / 2, PY0 + 2, bw, bh));
		this.paintLine(ctx, () => ctx.strokeRect(W / 2 - bw / 2, PY0 + PH - 2 - bh, bw, bh));
		const sw = 92;
		const sh = 30;
		this.paintLine(ctx, () => ctx.strokeRect(W / 2 - sw / 2, PY0 + 2, sw, sh));
		this.paintLine(ctx, () => ctx.strokeRect(W / 2 - sw / 2, PY0 + PH - 2 - sh, sw, sh));

		const cr = 12;
		this.paintLine(ctx, () => {
			ctx.beginPath();
			ctx.arc(PX0, PY0, cr, 0, Math.PI / 2);
			ctx.stroke();
		});
		this.paintLine(ctx, () => {
			ctx.beginPath();
			ctx.arc(PX0 + PW, PY0, cr, Math.PI / 2, Math.PI);
			ctx.stroke();
		});
		this.paintLine(ctx, () => {
			ctx.beginPath();
			ctx.arc(PX0, PY0 + PH, cr, -Math.PI / 2, 0);
			ctx.stroke();
		});
		this.paintLine(ctx, () => {
			ctx.beginPath();
			ctx.arc(PX0 + PW, PY0 + PH, cr, Math.PI, -Math.PI / 2);
			ctx.stroke();
		});
	}

	private drawGoals(ctx: CanvasRenderingContext2D): void {
		for (const gy of [PY0, PY0 + PH]) {
			ctx.save();
			ctx.strokeStyle = 'rgba(239,228,201,.28)';
			ctx.lineWidth = 1;
			for (let x = GX0; x <= GX1; x += 9) {
				ctx.beginPath();
				ctx.moveTo(x, gy);
				ctx.lineTo(x, gy === PY0 ? gy - 14 : gy + 14);
				ctx.stroke();
			}
			ctx.restore();

			ctx.fillStyle = THEME.line;
			ctx.fillRect(GX0 - 3, gy - 3, 6, 6);
			ctx.fillRect(GX1 - 3, gy - 3, 6, 6);
			ctx.strokeStyle = 'rgba(0,0,0,.5)';
			ctx.lineWidth = 1;
			ctx.strokeRect(GX0 - 3, gy - 3, 6, 6);
			ctx.strokeRect(GX1 - 3, gy - 3, 6, 6);
		}
	}

	private drawDisc(ctx: CanvasRenderingContext2D, disc: DiscView, snapshot: MatchSnapshot): void {
		const { x, y } = disc.position;
		const r = DISC_RADIUS;
		const [lt, mid, dk] = TEAM_COLORS[disc.team];

		if (snapshot.phase === 'aim' && disc.team === snapshot.activeTeam) {
			ctx.save();
			ctx.beginPath();
			ctx.arc(x, y, r + 4, 0, TAU);
			ctx.strokeStyle = 'rgba(217,164,65,.9)';
			ctx.lineWidth = 2.5;
			ctx.stroke();
			ctx.restore();
		}

		ctx.save();
		ctx.shadowColor = 'rgba(15,25,12,.5)';
		ctx.shadowBlur = 7;
		ctx.shadowOffsetY = 3;
		ctx.beginPath();
		ctx.arc(x, y, r, 0, TAU);
		ctx.fillStyle = mid;
		ctx.fill();
		ctx.restore();

		const g = ctx.createRadialGradient(x - r * 0.4, y - r * 0.45, r * 0.2, x, y, r);
		g.addColorStop(0, lt);
		g.addColorStop(0.55, mid);
		g.addColorStop(1, dk);
		ctx.beginPath();
		ctx.arc(x, y, r, 0, TAU);
		ctx.fillStyle = g;
		ctx.fill();
		ctx.lineWidth = 1.6;
		ctx.strokeStyle = 'rgba(0,0,0,.45)';
		ctx.stroke();

		ctx.save();
		ctx.beginPath();
		ctx.ellipse(x - r * 0.32, y - r * 0.4, r * 0.4, r * 0.22, -0.6, 0, TAU);
		ctx.fillStyle = 'rgba(255,255,255,.5)';
		ctx.fill();
		ctx.restore();

		ctx.fillStyle = 'rgba(245,238,220,.95)';
		ctx.font = '700 12px Oswald, sans-serif';
		ctx.textAlign = 'center';
		ctx.textBaseline = 'middle';
		ctx.fillText(disc.keeper ? '★' : String(disc.id), x, y + 0.5);
	}

	private drawBall(ctx: CanvasRenderingContext2D, snapshot: MatchSnapshot): void {
		const { x, y } = snapshot.ball.position;
		const r = BALL_RADIUS;

		ctx.save();
		ctx.shadowColor = 'rgba(15,25,12,.5)';
		ctx.shadowBlur = 6;
		ctx.shadowOffsetY = 2;
		ctx.beginPath();
		ctx.arc(x, y, r, 0, TAU);
		ctx.fillStyle = THEME.cream;
		ctx.fill();
		ctx.restore();
		ctx.lineWidth = 1;
		ctx.strokeStyle = 'rgba(0,0,0,.35)';
		ctx.stroke();

		ctx.fillStyle = 'rgba(40,35,27,.9)';
		ctx.beginPath();
		ctx.arc(x, y, 2.4, 0, TAU);
		ctx.fill();
		for (let i = 0; i < 5; i++) {
			const a = (i / 5) * TAU - 0.5;
			ctx.beginPath();
			ctx.arc(x + Math.cos(a) * r * 0.62, y + Math.sin(a) * r * 0.62, 1.3, 0, TAU);
			ctx.fill();
		}
		ctx.beginPath();
		ctx.arc(x - r * 0.3, y - r * 0.35, r * 0.28, 0, TAU);
		ctx.fillStyle = 'rgba(255,255,255,.6)';
		ctx.fill();
	}

	private drawAim(ctx: CanvasRenderingContext2D, aim: AimState): void {
		const { sx, sy, cx, cy } = aim;
		const dx = sx - cx;
		const dy = sy - cy;
		const pull = Math.hypot(dx, dy);
		if (pull < 4) return;
		const shoot = Math.min(pull, 130) / 130;

		ctx.save();
		ctx.setLineDash([5, 5]);
		ctx.lineWidth = 2;
		ctx.strokeStyle = 'rgba(0,0,0,.35)';
		ctx.beginPath();
		ctx.moveTo(sx, sy);
		ctx.lineTo(cx, cy);
		ctx.stroke();
		ctx.setLineDash([]);

		const angle = Math.atan2(dy, dx);
		const arrowLen = 30 + shoot * 70;
		const ex = sx + Math.cos(angle) * arrowLen;
		const ey = sy + Math.sin(angle) * arrowLen;
		ctx.strokeStyle = `rgba(217,164,65,${0.6 + shoot * 0.4})`;
		ctx.lineWidth = 3;
		ctx.beginPath();
		ctx.moveTo(sx, sy);
		ctx.lineTo(ex, ey);
		ctx.stroke();
		ctx.fillStyle = ctx.strokeStyle;
		ctx.beginPath();
		ctx.moveTo(ex, ey);
		ctx.lineTo(ex - Math.cos(angle - 0.4) * 9, ey - Math.sin(angle - 0.4) * 9);
		ctx.lineTo(ex - Math.cos(angle + 0.4) * 9, ey - Math.sin(angle + 0.4) * 9);
		ctx.closePath();
		ctx.fill();

		const pips = Math.round(shoot * 5);
		for (let i = 0; i < 5; i++) {
			ctx.fillStyle = i < pips ? THEME.mustard : 'rgba(0,0,0,.25)';
			ctx.beginPath();
			ctx.arc(sx - 14 + i * 7, sy - (DISC_RADIUS + 10), 2.4, 0, TAU);
			ctx.fill();
		}
		ctx.restore();
	}
}
