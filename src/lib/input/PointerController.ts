import type { MatchSnapshot, ShotCommand, TeamId } from '../engine';
import { DISC_RADIUS, SHOT } from '../engine';
import type { AimState } from '../render/PitchRenderer';
import { FieldViewport } from '../render/FieldViewport';

export interface PointerControllerOptions {
  getSnapshot: () => MatchSnapshot;
  isHumanTurn: () => boolean;
  onShoot: (cmd: ShotCommand) => void;
}

interface Selection {
  pointerId: number;
  discId: number;
  team: TeamId;
  sx: number;
  sy: number;
  cx: number;
  cy: number;
}

/** Converts one captured pointer gesture into one domain shot. */
export class PointerController {
  private selection: Selection | null = null;

  constructor(
    private canvas: HTMLCanvasElement,
    private viewport: FieldViewport,
    private options: PointerControllerOptions
  ) {
    canvas.addEventListener('pointerdown', this.onDown);
    canvas.addEventListener('pointermove', this.onMove);
    canvas.addEventListener('pointerup', this.onUp);
    canvas.addEventListener('pointercancel', this.onCancel);
    canvas.addEventListener('lostpointercapture', this.onLostCapture);
  }

  destroy(): void {
    this.canvas.removeEventListener('pointerdown', this.onDown);
    this.canvas.removeEventListener('pointermove', this.onMove);
    this.canvas.removeEventListener('pointerup', this.onUp);
    this.canvas.removeEventListener('pointercancel', this.onCancel);
    this.canvas.removeEventListener('lostpointercapture', this.onLostCapture);
    this.clearSelection();
  }

  reset(_snapshot: MatchSnapshot): void {
    this.clearSelection();
  }

  getAim(): AimState | null {
    if (!this.selection) return null;
    const { sx, sy, cx, cy } = this.selection;
    return { sx, sy, cx, cy };
  }

  private toLogical(e: PointerEvent): { x: number; y: number } {
    const rect = this.canvas.getBoundingClientRect();
    return this.viewport.toWorld({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  }

  private onDown = (e: PointerEvent): void => {
    if (this.selection) return;
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
      pointerId: e.pointerId,
      discId: hit.id,
      team: hit.team,
      sx: hit.position.x,
      sy: hit.position.y,
      cx: p.x,
      cy: p.y
    };
    this.canvas.setPointerCapture(e.pointerId);
    e.preventDefault();
  };

  private onMove = (e: PointerEvent): void => {
    if (!this.selection || e.pointerId !== this.selection.pointerId) return;
    const p = this.toLogical(e);
    this.selection.cx = p.x;
    this.selection.cy = p.y;
    e.preventDefault();
  };

  private onUp = (e: PointerEvent): void => {
    const sel = this.selection;
    if (!sel || e.pointerId !== sel.pointerId) return;
    this.selection = null;
    if (this.canvas.hasPointerCapture(e.pointerId)) this.canvas.releasePointerCapture(e.pointerId);

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

  private onCancel = (e: PointerEvent): void => {
    if (!this.selection || e.pointerId !== this.selection.pointerId) return;
    this.clearSelection();
  };

  private onLostCapture = (): void => {
    // The browser already released capture; do not attempt a second release.
    this.selection = null;
  };

  private clearSelection(): void {
    const pointerId = this.selection?.pointerId;
    this.selection = null;
    if (pointerId !== undefined && this.canvas.hasPointerCapture(pointerId)) {
      this.canvas.releasePointerCapture(pointerId);
    }
  }
}
