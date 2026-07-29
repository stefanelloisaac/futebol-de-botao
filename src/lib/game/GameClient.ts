import { Match, computeAiShot, getAiDelay, FIELD, type MatchConfig, type MatchPhase, type TeamId, type Difficulty } from '../engine';
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
  private difficulty: Difficulty;
  private _totalShots = 0;
  private resizeObserver: ResizeObserver | null = null;

  constructor(
    private canvas: HTMLCanvasElement,
    private options: GameClientOptions
  ) {
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('2D canvas context unavailable');
    this.ctx = ctx;

    this.difficulty = options.matchConfig.difficulty ?? 'medium';

    this.match = new Match(options.matchConfig, {
      onGoal: (scorer) => this.options.onGoal?.(scorer),
      onMatchEnd: (winner) => {
        this.stop();
        this.options.onMatchEnd?.(winner);
      },
      onShot: (team) => {
        this._totalShots++;
        this.options.onShot?.(team);
      },
      onCollision: () => this.options.onCollision?.()
    });

    this.pointer = new PointerController(canvas, {
      getSnapshot: () => this.match.snapshot(),
      isHumanTurn: () => this.isHumanTurn(),
      onShoot: (cmd) => this.match.applyShot(cmd)
    });

    // Set up responsive resize
    this.resize();
    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(this.canvas.parentElement ?? this.canvas);
  }

  get totalShots(): number {
    return this._totalShots;
  }

  /** Resize canvas buffer to match CSS-displayed size × DPR. */
  private resize(): void {
    const rect = this.canvas.getBoundingClientRect();
    const w = rect.width;
    const h = rect.height;
    if (w <= 0 || h <= 0) return;

    const dpr = Math.max(1, Math.min(window.devicePixelRatio || 1, 2.5));
    const bw = Math.round(w * dpr);
    const bh = Math.round(h * dpr);
    if (this.canvas.width !== bw || this.canvas.height !== bh) {
      this.canvas.width = bw;
      this.canvas.height = bh;
    }
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
    this._totalShots = 0;
    this.difficulty = this.options.matchConfig.difficulty ?? 'medium';
    this.match = new Match(this.options.matchConfig, {
      onGoal: (scorer) => this.options.onGoal?.(scorer),
      onMatchEnd: (winner) => {
        this.stop();
        this.options.onMatchEnd?.(winner);
      },
      onShot: (team) => {
        this._totalShots++;
        this.options.onShot?.(team);
      },
      onCollision: () => this.options.onCollision?.()
    });
    this.pointer.reset(this.match.snapshot());
    this.lastState = '';
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
    this.resizeObserver?.disconnect();
    this.resizeObserver = null;
    this.pointer.destroy();
  }

  /** @internal exposed for testing */
  getMatch(): Match {
    return this.match;
  }

  private tick(): void {
    if (!this.running) return;

    this.match.update();

    // Render
    const state = this.match.snapshot();
    const aim = this.pointer.getAim();
    this.ctx.save();
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    const cssW = this.canvas.clientWidth;
    const cssH = this.canvas.clientHeight;
    const dpr = Math.max(1, Math.min(window.devicePixelRatio || 1, 2.5));
    const scale = Math.min(cssW / FIELD.width, cssH / FIELD.height);
    const ox = (cssW - FIELD.width * scale) / 2;
    const oy = (cssH - FIELD.height * scale) / 2;
    this.ctx.setTransform(dpr * scale, 0, 0, dpr * scale, dpr * ox, dpr * oy);
    this.renderer.draw(this.ctx, state, aim);
    this.ctx.restore();

    // Feed state to UI
    const key = `${state.scoreRed}|${state.scoreBlue}|${state.phase}|${state.activeTeam}`;
    if (key !== this.lastState) {
      this.lastState = key;
      this.options.onState?.({
        scoreRed: state.scoreRed,
        scoreBlue: state.scoreBlue,
        activeTeam: state.activeTeam,
        phase: state.phase,
        winner: state.winner
      });
    }

    // AI turn
    if (this.isAiTurn()) {
      this.scheduleAi();
    }

    this.rafId = requestAnimationFrame(() => this.tick());
  }

  private isAiTurn(): boolean {
    const snap = this.match.snapshot();
    return (
      snap.phase === 'aim' &&
      this.options.getMode() === 'single' &&
      snap.activeTeam === 'blue'
    );
  }

  private scheduleAi(): void {
    if (this.aiScheduled) return;
    this.aiScheduled = true;
    const delay = getAiDelay(this.difficulty);
    setTimeout(() => {
      if (!this.running) return;
      const snap = this.match.snapshot();
      if (snap.phase !== 'aim') {
        this.aiScheduled = false;
        return;
      }
      const shot = computeAiShot(snap, 'blue', this.difficulty);
      if (shot) {
        this.match.applyShot(shot);
        this.options.onShot?.(shot.team);
      }
      this.aiScheduled = false;
    }, delay);
  }
}
