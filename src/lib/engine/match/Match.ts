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

function other(team: TeamId): TeamId {
  return team === 'red' ? 'blue' : 'red';
}

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
  /** Last team whose disc touched the ball. Null = no disc touched it yet (direct shot). */
  private lastTouch: TeamId | null = null;

  constructor(config: MatchConfig, events: MatchEvents = {}) {
    this.config = config;
    this.world = createWorld();
    this.events = events;

    // Listen for collisions + track last touch for goal attribution
    Events.on(this.world.engine, 'collisionStart', (event) => {
      this.collisionsThisStep++;
      for (const pair of event.pairs) {
        const disc = this.world.discs.find(
          (d) => d.body === pair.bodyA || d.body === pair.bodyB
        );
        const ballHit =
          pair.bodyA === this.world.ball || pair.bodyB === this.world.ball;
        if (disc && ballHit) {
          this.lastTouch = disc.team;
        }
      }
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
      const scorer = this.detectGoal();
      if (scorer) {
        if (scorer === 'red') this.scoreRed++;
        else this.scoreBlue++;
        this.goalLock = GOAL_LOCK_FRAMES;
        this.lastTouch = null; // reset last touch for the next play
        this.events.onGoal?.(scorer);

        if (this.scoreRed >= this.config.targetGoals || this.scoreBlue >= this.config.targetGoals) {
          this.phase = 'finished';
          this.winner = scorer;
          this.resetPositions();
          this.events.onMatchEnd?.(scorer);
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
    const inGoalX = Math.abs(b.position.x - FIELD.width / 2) < GOAL_GAP / 2;
    if (!inGoalX) return null;

    const isBlueGoal = b.position.y <= FIELD.margin; // Top = goal do Blue
    const isRedGoal = b.position.y >= FIELD.height - FIELD.margin; // Fundo = goal do Red

    if (!isBlueGoal && !isRedGoal) return null;

    // Determine scorer based on last touch
    let scorer: TeamId;
    if (this.lastTouch) {
      scorer = this.lastTouch;
      // Own goal: se o time que tocou por último é o dono do gol, inverte
      if ((isBlueGoal && this.lastTouch === 'blue') || (isRedGoal && this.lastTouch === 'red')) {
        scorer = other(this.lastTouch);
      }
    } else {
      // Sem last touch (chute direto sem desvio) → time atacante que marcou
      scorer = isBlueGoal ? 'red' : 'blue';
    }

    return scorer;
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
