import {
  Match, computeAiShot, getAiDelay, FIELD,
  type Difficulty, type MatchConfig, type MatchEndResult, type MatchPhase, type TeamId
} from '../engine';
import { PointerController } from '../input/PointerController';
import { FieldViewport } from '../render/FieldViewport';
import { PitchRenderer } from '../render/PitchRenderer';
import { consumeFixedSteps } from './fixedStep';

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
  onMatchEnd?: (result: MatchEndResult) => void;
  onShot?: (team: TeamId) => void;
  onCollision?: () => void;
}

/** Browser adapter for the pure engine: fixed physics, viewport and lifecycle. */
export class GameClient {
  private ctx: CanvasRenderingContext2D;
  private match: Match;
  private readonly renderer = new PitchRenderer();
  private readonly viewport = new FieldViewport(FIELD);
  private pointer: PointerController;
  private rafId: number | null = null;
  private aiTimeoutId: ReturnType<typeof setTimeout> | null = null;
  private aiScheduled = false;
  private matchGeneration = 0;
  private lastState = '';
  private running = false;
  private paused = false;
  private difficulty: Difficulty;
  private _totalShots = 0;
  private resizeObserver: ResizeObserver | null = null;
  private lastFrameMs: number | null = null;
  private accumulatorMs = 0;

  constructor(private canvas: HTMLCanvasElement, private options: GameClientOptions) {
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('2D canvas context unavailable');
    this.ctx = ctx;
    this.difficulty = options.matchConfig.difficulty ?? 'medium';
    this.match = this.createMatch();
    this.pointer = new PointerController(canvas, this.viewport, {
      getSnapshot: () => this.match.snapshot(),
      isHumanTurn: () => this.isHumanTurn(),
      onShoot: (cmd) => { this.match.applyShot(cmd); }
    });
    this.resize();
    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(this.canvas.parentElement ?? this.canvas);
  }

  get totalShots(): number {
    return this._totalShots;
  }

  private createMatch(): Match {
    let match!: Match;
    match = new Match(this.options.matchConfig, {
      onGoal: (scorer) => this.options.onGoal?.(scorer),
      onMatchEnd: (result) => {
        // Publish the result from the match that ended, never from a later restart.
        this.publishState(match.snapshot());
        this.stop();
        this.options.onMatchEnd?.(result);
      },
      onShot: (team) => {
        this._totalShots++;
        this.options.onShot?.(team);
      },
      onCollision: () => this.options.onCollision?.()
    });
    return match;
  }

  /** Resize backing buffer and shared viewport atomically from CSS dimensions. */
  private resize(): void {
    const rect = this.canvas.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;
    const dpr = Math.max(1, Math.min(window.devicePixelRatio || 1, 2.5));
    // The current product policy is portrait/fill. FieldViewport owns the
    // extensible camera API, so landscape can later be opted in without
    // altering Matter coordinates or pointer math.
    this.viewport.resize(rect.width, rect.height, dpr, 'portrait', 'fill');
    if (this.canvas.width !== this.viewport.backingWidth || this.canvas.height !== this.viewport.backingHeight) {
      this.canvas.width = this.viewport.backingWidth;
      this.canvas.height = this.viewport.backingHeight;
    }
  }

  private isHumanTurn(): boolean {
    const snap = this.match.snapshot();
    return snap.phase === 'aim' && (this.options.getMode() === 'local' || snap.activeTeam === 'red');
  }

  start(): void {
    if (this.running) return;
    this.running = true;
    this.paused = false;
    this.resetClock();
    this.requestFrame();
  }

  stop(): void {
    this.running = false;
    this.paused = false;
    if (this.rafId !== null) cancelAnimationFrame(this.rafId);
    this.rafId = null;
    this.cancelAi();
    this.resetClock();
  }

  restart(): void {
    this.stop();
    this._totalShots = 0;
    this.difficulty = this.options.matchConfig.difficulty ?? 'medium';
    this.matchGeneration++;
    this.match = this.createMatch();
    this.pointer.reset(this.match.snapshot());
    this.lastState = '';
    this.start();
  }

  pause(): void {
    if (!this.running) return;
    this.running = false;
    this.paused = true;
    if (this.rafId !== null) cancelAnimationFrame(this.rafId);
    this.rafId = null;
    this.cancelAi();
    this.resetClock();
  }

  resume(): void {
    if (this.running || !this.paused) return;
    this.running = true;
    this.paused = false;
    this.resetClock();
    this.requestFrame();
  }

  destroy(): void {
    this.stop();
    this.resizeObserver?.disconnect();
    this.resizeObserver = null;
    this.pointer.destroy();
  }

  /** @internal exposed for engine integration tests. */
  getMatch(): Match {
    return this.match;
  }

  private resetClock(): void {
    this.lastFrameMs = null;
    this.accumulatorMs = 0;
  }

  private requestFrame(): void {
    if (this.running && this.rafId === null) this.rafId = requestAnimationFrame(this.tick);
  }

  private tick = (now: number): void => {
    this.rafId = null;
    if (!this.running) return;

    // A troca de monitor/zoom pode mudar DPR sem disparar ResizeObserver.
    const currentDpr = Math.max(1, Math.min(window.devicePixelRatio || 1, 2.5));
    if (currentDpr !== this.viewport.dpr) this.resize();

    if (this.lastFrameMs === null) this.lastFrameMs = now;
    const frame = consumeFixedSteps(this.accumulatorMs, now - this.lastFrameMs);
    this.lastFrameMs = now;
    this.accumulatorMs = frame.accumulatorMs;

    for (let step = 0; step < frame.steps && this.running; step++) {
      this.match.update();
    }
    this.render();
    const state = this.match.snapshot();
    this.publishState(state);
    if (this.running && this.isAiTurn()) this.scheduleAi();
    this.requestFrame();
  };

  private render(): void {
    const state = this.match.snapshot();
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.save();
    this.viewport.applyWorldTransform(this.ctx);
    this.renderer.draw(this.ctx, state, this.pointer.getAim());
    this.ctx.restore();
  }

  private publishState(state: ReturnType<Match['snapshot']>): void {
    const key = `${state.scoreRed}|${state.scoreBlue}|${state.phase}|${state.activeTeam}|${state.winner ?? ''}`;
    if (key === this.lastState) return;
    this.lastState = key;
    this.options.onState?.({
      scoreRed: state.scoreRed, scoreBlue: state.scoreBlue, activeTeam: state.activeTeam,
      phase: state.phase, winner: state.winner
    });
  }

  private isAiTurn(): boolean {
    const snap = this.match.snapshot();
    return snap.phase === 'aim' && this.options.getMode() === 'single' && snap.activeTeam === 'blue';
  }

  private scheduleAi(): void {
    if (this.aiScheduled) return;
    this.aiScheduled = true;
    const matchAtSchedule = this.match;
    const generation = this.matchGeneration;
    this.aiTimeoutId = setTimeout(() => {
      this.aiTimeoutId = null;
      this.aiScheduled = false;
      if (!this.running || this.match !== matchAtSchedule || generation !== this.matchGeneration || !this.isAiTurn()) return;
      const shot = computeAiShot(this.match.snapshot(), 'blue', this.difficulty);
      if (shot) this.match.applyShot(shot);
    }, getAiDelay(this.difficulty));
  }

  private cancelAi(): void {
    if (this.aiTimeoutId !== null) clearTimeout(this.aiTimeoutId);
    this.aiTimeoutId = null;
    this.aiScheduled = false;
  }
}
