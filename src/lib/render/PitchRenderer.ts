import type { MatchSnapshot, DiscView } from '../engine';
import { FIELD, GOAL_GAP, DISC_RADIUS, BALL_RADIUS } from '../engine';
import { THEME, TEAM_COLORS } from './theme';
import { createFeltTexture } from './textures';

/** The slingshot indicator, in logical field coordinates. */
export interface AimState {
  sx: number;
  sy: number;
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

/** Renders only in logical field coordinates; FieldViewport owns projection/DPR. */
export class PitchRenderer {
  private felt = createFeltTexture();
  private readonly woodGrain = Array.from({ length: 26 }, (_, i) => ({
    y: ((i * 97) % 997) / 997 * H,
    c1: (((i * 71) % 997) / 997 - 0.5) * 8,
    c2: (((i * 53) % 997) / 997 - 0.5) * 8
  }));

  draw(ctx: CanvasRenderingContext2D, snapshot: MatchSnapshot, aim: AimState | null): void {
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
    for (const grain of this.woodGrain) {
      ctx.beginPath();
      ctx.moveTo(0, grain.y);
      ctx.bezierCurveTo(W * 0.3, grain.y + grain.c1, W * 0.7, grain.y + grain.c2, W, grain.y);
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
    ctx.save();
    ctx.strokeStyle = 'rgba(30,25,15,.22)';
    ctx.lineWidth = 2.7;
    ctx.translate(0.7, 0.7);
    fn();
    ctx.stroke();
    ctx.restore();
    ctx.strokeStyle = THEME.line;
    ctx.lineWidth = 1.4;
    fn();
    ctx.stroke();
  }

  private drawLines(ctx: CanvasRenderingContext2D): void {
    ctx.lineCap = 'round';
    this.paintLine(ctx, () => {
      ctx.beginPath();
      ctx.moveTo(PX0, H / 2);
      ctx.lineTo(PX0 + PW, H / 2);
    });
    this.paintLine(ctx, () => {
      ctx.beginPath();
      ctx.arc(W / 2, H / 2, 58, 0, TAU);
    });
    ctx.fillStyle = THEME.line;
    ctx.beginPath();
    ctx.arc(W / 2, H / 2, 2.5, 0, TAU);
    ctx.fill();
    for (const y of [PY0, PY0 + PH - 92]) {
      this.paintLine(ctx, () => {
        ctx.strokeRect(W / 2 - 78, y, 156, 92);
      });
      this.paintLine(ctx, () => {
        ctx.strokeRect(W / 2 - 38, y, 76, 39);
      });
    }
  }

  private drawGoals(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    ctx.strokeStyle = 'rgba(242,231,207,.75)';
    ctx.lineWidth = 2;
    for (const y of [M - 2, H - M + 2]) {
      ctx.beginPath();
      ctx.moveTo(GX0, y);
      ctx.lineTo(GX1, y);
      ctx.stroke();
      for (let x = GX0; x <= GX1; x += 15) {
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x, y + (y < H / 2 ? -18 : 18));
        ctx.stroke();
      }
    }
    ctx.restore();
  }

  private drawDisc(ctx: CanvasRenderingContext2D, disc: DiscView, snapshot: MatchSnapshot): void {
    const { x, y } = disc.position;
    const [light, main, dark] = TEAM_COLORS[disc.team];
    const active = snapshot.phase === 'aim' && snapshot.activeTeam === disc.team;
    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = 'rgba(0,0,0,.3)';
    ctx.beginPath();
    ctx.ellipse(2, 3, DISC_RADIUS * 0.95, DISC_RADIUS * 0.58, 0, 0, TAU);
    ctx.fill();
    const g = ctx.createRadialGradient(-5, -6, 1, 0, 0, DISC_RADIUS);
    g.addColorStop(0, '#fff');
    g.addColorStop(0.08, light);
    g.addColorStop(0.72, main);
    g.addColorStop(1, dark);
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(0, 0, disc.radius || DISC_RADIUS, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = '#22170e';
    ctx.lineWidth = 1.4;
    ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,.38)';
    ctx.beginPath();
    ctx.arc(-5, -5, 3, 0, TAU);
    ctx.fill();
    if (disc.keeper) {
      ctx.fillStyle = THEME.mustard;
      ctx.beginPath();
      ctx.arc(0, 0, 4, 0, TAU);
      ctx.fill();
    }
    if (active) {
      ctx.strokeStyle = THEME.mustard;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, disc.radius + 4, 0, TAU);
      ctx.stroke();
    }
    ctx.restore();
  }

  private drawBall(ctx: CanvasRenderingContext2D, snapshot: MatchSnapshot): void {
    const { x, y } = snapshot.ball.position;
    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = 'rgba(0,0,0,.28)';
    ctx.beginPath();
    ctx.ellipse(1.5, 2.2, BALL_RADIUS, BALL_RADIUS * 0.55, 0, 0, TAU);
    ctx.fill();
    const g = ctx.createRadialGradient(-3, -3, 1, 0, 0, BALL_RADIUS);
    g.addColorStop(0, '#fffdf1');
    g.addColorStop(0.65, '#e8dcc0');
    g.addColorStop(1, '#9c8d72');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(0, 0, snapshot.ball.radius || BALL_RADIUS, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = '#493d2d';
    ctx.lineWidth = 0.8;
    ctx.stroke();
    ctx.restore();
  }

  private drawAim(ctx: CanvasRenderingContext2D, aim: AimState): void {
    ctx.save();
    ctx.setLineDash([5, 4]);
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = 'rgba(242,231,207,.9)';
    ctx.beginPath();
    ctx.moveTo(aim.sx, aim.sy);
    ctx.lineTo(aim.cx, aim.cy);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = THEME.mustard;
    ctx.beginPath();
    ctx.arc(aim.cx, aim.cy, 3, 0, TAU);
    ctx.fill();
    ctx.restore();
  }
}
