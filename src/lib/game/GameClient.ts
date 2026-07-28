import { Match, computeAiShot, FIELD, type MatchConfig, type MatchPhase, type TeamId } from '../engine';
import { PitchRenderer } from '../render/PitchRenderer';
import { PointerController } from '../input/PointerController';

export type GameMode = 'single' | 'local';

export interface GameState {
  scoreRed: number;
  scoreBlue: number;
  activeTeam: TeamId;
  phase: MatchPhase;
  winner: TeamId | null;
}

export interface GameClientOptions {
  getMode: () => GameMode;
  matchConfig: MatchConfig;
  onState?: (state: GameState) => void;
  onGoal?: (scorer: TeamId) => void;
  onMatchEnd?: (winner: TeamId) => void;
  onShot?: (team: TeamId) => void;
  onCollision?: () => void;
}

const AI_DELAY_MS = 650;
const STEP_MS = 1000 / 60;

export class GameClient {
  private ctx: CanvasRenderingContext2D;
  private match: Match;
  private renderer = new PitchRenderer();
  private pointer: PointerController;

  private rafId = 0;
  private aiScheduled = false;
  private lastState = '';
  private running = false;

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

    this.match = new Match(options.matchConfig, {
      onGoal: (scorer) => this.options.onGoal?.(scorer),
      onMatchEnd: (winner) => {
        this.stop();
        this.options.onMatchEnd?.(winner);
      },
      onShot: (team) => this.options.onShot?.(team),
      onCollision: () => this.options.onCollision?.()
    });

    this.pointer = new PointerController(canvas, {
      getSnapshot: () => this.match.snapshot(),
      isHumanTurn: () => this.isHumanTurn(),
      onShoot: (cmd) => this.match.applyShot(cmd)
    });
  }

  private isHumanTurn(): boolean {
    const snap = this.match.snapshot();
    if (snap.phase !== 'aim') return false;
    if (this.options.getMode() === 'local') return true;
    return snap.activeTeam === 'red';
  }

  start(): void {
    this.running = true;
    this.tick();
  }

  stop(): void {
    this.running = false;
    cancelAnimationFrame(this.rafId);
    this.aiScheduled = false;
  }

  restart(): void {
    this.stop();
    this.match = new Match(this.options.matchConfig, {
      onGoal: (scorer) => this.options.onGoal?.(scorer),
      onMatchEnd: (winner) => {
        this.stop();
        this.options.onMatchEnd?.(winner);
      },
      onShot: (team) => this.options.onShot?.(team),
      onCollision: () => this.options.onCollision?.()
    });
    this.pointer = new PointerController(this.canvas, {
      getSnapshot: () => this.match.snapshot(),
      isHumanTurn: () => this.isHumanTurn(),
      onShoot: (cmd) => this.match.applyShot(cmd)
    });
    this.start();
  }

  pause(): void {
    this.running = false;
    cancelAnimationFrame(this.rafId);
    this.aiScheduled = false;
  }

  resume(): void {
    this.running = true;
    this.tick();
  }

  destroy(): void {
    this.stop();
    this.pointer.destroy();
  }

  private tick = (): void => {
    if (!this.running) return;

    this.match.update();
    this.emitState();
    this.scheduleAi();

    const snap = this.match.snapshot();
    const aim = this.pointer.getAim();
    this.renderer.draw(this.ctx, snap, aim);

    this.rafId = requestAnimationFrame(this.tick);
  };

  private emitState(): void {
    const snap = this.match.snapshot();
    const key = `${snap.scoreRed}|${snap.scoreBlue}|${snap.activeTeam}|${snap.phase}|${snap.winner}`;
    if (key !== this.lastState) {
      this.lastState = key;
      this.options.onState?.({
        scoreRed: snap.scoreRed,
        scoreBlue: snap.scoreBlue,
        activeTeam: snap.activeTeam,
        phase: snap.phase,
        winner: snap.winner
      });
    }
  }

  private scheduleAi(): void {
    if (this.aiScheduled) return;
    const snap = this.match.snapshot();
    if (this.options.getMode() !== 'single') return;
    if (snap.phase !== 'aim' || snap.activeTeam !== 'blue') return;

    this.aiScheduled = true;
    setTimeout(() => {
      if (!this.running) return;
      this.aiScheduled = false;
      if (this.match.snapshot().phase !== 'aim') return;

      const shot = computeAiShot(this.match.snapshot(), 'blue');
      if (shot) {
        this.match.applyShot(shot);
      }
    }, AI_DELAY_MS);
  }
}
