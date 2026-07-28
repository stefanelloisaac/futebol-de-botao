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

const { Body, Engine, Events } = Matter;

export interface MatchEvents {
  /** Fired when a team scores. `scorer` is the team that earned the point. */
  onGoal?: (scorer: TeamId) => void;
  /** Fired when control passes to a team and it may shoot. */
  onTurnReady?: (team: TeamId) => void;
  /** Fired when a team reaches the target goal count and wins the match. */
  onMatchEnd?: (winner: TeamId) => void;
  /** Fired when a disc is shot (slingshot released). */
  onShot?: (team: TeamId) => void;
  /** Fired on any disc-disc or disc-ball collision. */
  onCollision?: () => void;
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
  private collisionsThisStep = 0;

  constructor(config: MatchConfig, events: MatchEvents = {}) {
    this.config = config;
    this.world = createWorld();
    this.events = events;

    // Listen for collisions
    Events.on(this.world.engine, 'collisionStart', () => {
      this.collisionsThisStep++;
    });
  }

  /** Expose the physics engine for external use (e.g., collision detection). */
  getEngine(): Matter.Engine {
    return this.world.engine;
  }

  /** Applies a shot to a disc and enters the resolving phase. Ignored when not aiming or match is finished. */
  applyShot(cmd: ShotCommand): void {
    if (this.phase === 'finished' || this.phase !== 'aim' || cmd.team !== this.activeTeam) return;
    const disc = this.world.discs.find((d) => d.team === cmd.team && d.id === cmd.discId);
    if (!disc) return;
    Body.setVelocity(disc.body, cmd.velocity);
    this.phase = 'resolving';
    this.settleCount = 0;

    this.events.onShot?.(cmd.team);
  }

  snapshot(): MatchSnapshot {
    return {
      discs: this.world.discs.map((d) => ({
        id: d.id,
        team: d.team,
        keeper: d.keeper,
        position: { x: d.body.position.x, y: d.body.position.y },
        radius: d.body.circleRadius ?? 15
      })),
      ball: {
        position: { x: this.world.ball.position.x, y: this.world.ball.position.y },
        radius: this.world.ball.circleRadius ?? 8.5
      },
      scoreRed: this.scoreRed,
      scoreBlue: this.scoreBlue,
      activeTeam: this.activeTeam,
      phase: this.phase,
      winner: this.winner
    };
  }

  /** Advance the physics one tick, handle goal detection, and turn management. */
  update(): void {
    if (this.phase === 'finished') return;

    // Fire collision events
    if (this.collisionsThisStep > 0) {
      this.events.onCollision?.();
      this.collisionsThisStep = 0;
    }

    Engine.update(this.world.engine, 1000 / 60);

    if (this.goalLock > 0) {
      this.goalLock--;
    }

    // Goal detection
    if (this.goalLock === 0) {
      const by = this.detectGoal();
      if (by) {
        if (by === 'red') this.scoreRed++;
        else this.scoreBlue++;
        this.goalLock = GOAL_LOCK_FRAMES;
        this.events.onGoal?.(by);

        if (this.scoreRed >= this.config.targetGoals || this.scoreBlue >= this.config.targetGoals) {
          this.phase = 'finished';
          this.winner = by;
          this.resetPositions();
          this.events.onMatchEnd?.(by);
          return;
        }

        this.resetPositions();
        this.phase = 'aim';
        // After goal, active team stays the same (standard table football rule)
        return;
      }
    }

    if (this.phase === 'resolving') {
      if (this.isSettled()) {
        this.settleCount++;
        if (this.settleCount >= SETTLE_FRAMES) {
          this.activeTeam = other(this.activeTeam);
          this.phase = 'aim';
          this.events.onTurnReady?.(this.activeTeam);
        }
      } else {
        this.settleCount = 0;
      }
    }
  }

  private resetPositions(): void {
    for (const { body, id } of this.world.discs) {
      const pos = this.world.home.get(body.id);
      if (pos) {
        Body.setPosition(body, pos);
        Body.setVelocity(body, { x: 0, y: 0 });
      }
    }
    Body.setPosition(this.world.ball, {
      x: FIELD.width / 2,
      y: FIELD.height / 2
    });
    Body.setVelocity(this.world.ball, { x: 0, y: 0 });
  }

  private detectGoal(): TeamId | null {
    const b = this.world.ball;
    // Red's goal is at the top (y = margin), Blue's at the bottom (y = height - margin)
    const inGoalX = Math.abs(b.position.x - FIELD.width / 2) < GOAL_GAP / 2;

    if (inGoalX && b.position.y <= FIELD.margin) {
      return 'blue'; // ball entered top goal → blue conceded, red scores
    }
    if (inGoalX && b.position.y >= FIELD.height - FIELD.margin) {
      return 'red'; // ball entered bottom goal → red conceded, blue scores
    }
    return null;
  }

  private isSettled(): boolean {
    const bodies = [
      ...this.world.discs.map((d) => d.body),
      this.world.ball
    ];
    for (const body of bodies) {
      const { x, y } = body.velocity;
      if (Math.abs(x) > SETTLE_SPEED || Math.abs(y) > SETTLE_SPEED) {
        return false;
      }
    }
    return true;
  }
}
