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

  /** Resize canvas to fill its container while maintaining 400:660 aspect ratio. */
  private resize(): void {
    const parent = this.canvas.parentElement;
    if (!parent) return;

    const containerW = parent.clientWidth;
    const containerH = parent.clientHeight;
    if (containerW <= 0 || containerH <= 0) return;

    const aspect = FIELD.width / FIELD.height; // 400/660 ≈ 0.606
    let w: number, h: number;

    if (containerW / containerH < aspect) {
      // Container is taller than the aspect → fit by width
      w = containerW;
      h = w / aspect;
    } else {
      // Container is wider than the aspect → fit by height
      h = containerH;
      w = h * aspect;
    }

    const dpr = Math.max(1, Math.min(window.devicePixelRatio || 1, 2.5));
    this.canvas.width = Math.round(w * dpr);
    this.canvas.height = Math.round(h * dpr);
    this.canvas.style.width = `${Math.round(w)}px`;
    this.canvas.style.height = `${Math.round(h)}px`;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
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
    this.renderer.draw(this.ctx, state, aim);

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
