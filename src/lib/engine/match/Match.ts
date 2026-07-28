import Matter from 'matter-js';
import type { MatchConfig, MatchPhase, MatchSnapshot, ShotCommand, TeamId } from '../types';
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
  /** Fired when a team reaches the target goal count and wins the match. */
  onMatchEnd?: (winner: TeamId) => void;
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
  private config: MatchConfig;

  scoreRed = 0;
  scoreBlue = 0;
  activeTeam: TeamId = 'red';
  phase: MatchPhase = 'aim';
  winner: TeamId | null = null;

  private settleCount = 0;
  private goalLock = 0;

  constructor(config: MatchConfig, events: MatchEvents = {}) {
    this.config = config;
    this.world = createWorld();
    this.events = events;
  }

  /** Applies a shot to a disc and enters the resolving phase. Ignored when not aiming or match is finished. */
  applyShot(cmd: ShotCommand): void {
    if (this.phase === 'finished' || this.phase !== 'aim' || cmd.team !== this.activeTeam) return;
    const disc = this.world.discs.find((d) => d.team === cmd.team && d.id === cmd.discId);
    if (!disc) return;
    Body.setVelocity(disc.body, cmd.velocity);
    this.phase = 'resolving';
    this.settleCount = 0;
  }

  /** Advances the simulation by one fixed step and runs the rules. No-op when finished. */
  step(deltaMs: number): void {
    if (this.phase === 'finished') return;

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
      phase: this.phase,
      winner: this.winner
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

  /** Full restart: zeroes scores, resets winner, re-uses config. */
  restart(): void {
    this.scoreRed = 0;
    this.scoreBlue = 0;
    this.winner = null;
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

    // Check win condition — if the scoring team reached target goals, match is over
    const scorerScore = scorer === 'red' ? this.scoreRed : this.scoreBlue;
    if (scorerScore >= this.config.targetGoals) {
      this.winner = scorer;
      this.phase = 'finished';
      this.events.onMatchEnd?.(scorer);
      return; // Don't reset — match is finished
    }

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
