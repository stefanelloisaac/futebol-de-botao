import Matter from 'matter-js';
import type { MatchConfig, MatchEndResult, MatchPhase, MatchSnapshot, ShotCommand, TeamId } from '../types';
import { FIELD, GOAL_GAP, SETTLE_SPEED, SETTLE_FRAMES, GOAL_LOCK_FRAMES } from '../constants';
import { createWorld, type PhysicsWorld } from '../physics/world';

const { Body, Engine, Events } = Matter;

function other(team: TeamId): TeamId {
  return team === 'red' ? 'blue' : 'red';
}

export interface MatchEvents {
  onGoal?: (scorer: TeamId) => void;
  onTurnReady?: (team: TeamId) => void;
  onMatchEnd?: (result: MatchEndResult) => void;
  onShot?: (team: TeamId) => void;
  onCollision?: () => void;
}

/** Pure authoritative match logic; rendering and browser lifecycle stay outside engine/. */
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
  private lastTouch: TeamId | null = null;

  constructor(config: MatchConfig, events: MatchEvents = {}) {
    this.config = config;
    this.world = createWorld();
    this.events = events;
    Events.on(this.world.engine, 'collisionStart', (event) => {
      this.collisionsThisStep += event.pairs.length;
      for (const pair of event.pairs) {
        const disc = this.world.discs.find((d) => d.body === pair.bodyA || d.body === pair.bodyB);
        const ballHit = pair.bodyA === this.world.ball || pair.bodyB === this.world.ball;
        if (disc && ballHit) this.lastTouch = disc.team;
      }
    });
  }

  getEngine(): Matter.Engine {
    return this.world.engine;
  }

  applyShot(cmd: ShotCommand): boolean {
    if (this.phase !== 'aim' || cmd.team !== this.activeTeam) return false;
    const disc = this.world.discs.find((d) => d.team === cmd.team && d.id === cmd.discId);
    if (!disc) return false;
    Body.setVelocity(disc.body, cmd.velocity);
    this.phase = 'resolving';
    this.settleCount = 0;
    this.events.onShot?.(cmd.team);
    return true;
  }

  snapshot(): MatchSnapshot {
    return {
      discs: this.world.discs.map((d) => ({
        id: d.id, team: d.team, keeper: d.keeper,
        position: { x: d.body.position.x, y: d.body.position.y }, radius: d.body.circleRadius ?? 15
      })),
      ball: { position: { x: this.world.ball.position.x, y: this.world.ball.position.y }, radius: this.world.ball.circleRadius ?? 8.5 },
      scoreRed: this.scoreRed,
      scoreBlue: this.scoreBlue,
      activeTeam: this.activeTeam,
      phase: this.phase,
      winner: this.winner
    };
  }

  /** Advances one physics step. GameClient supplies the fixed 60 Hz delta. */
  update(deltaMs = 1000 / 60): void {
    if (this.phase === 'finished') return;
    this.collisionsThisStep = 0;
    Engine.update(this.world.engine, deltaMs);
    if (this.collisionsThisStep > 0) this.events.onCollision?.();

    if (this.goalLock > 0) this.goalLock--;
    if (this.goalLock === 0) {
      const scorer = this.detectGoal();
      if (scorer) {
        if (scorer === 'red') this.scoreRed++;
        else this.scoreBlue++;
        this.goalLock = GOAL_LOCK_FRAMES;
        this.lastTouch = null;
        this.events.onGoal?.(scorer);

        if (this.scoreRed >= this.config.targetGoals || this.scoreBlue >= this.config.targetGoals) {
          this.phase = 'finished';
          this.winner = scorer;
          const result: MatchEndResult = { winner: scorer, scoreRed: this.scoreRed, scoreBlue: this.scoreBlue };
          // Keep the winning ball in its final position until the renderer has
          // published the authoritative result; do not erase the final goal.
          this.events.onMatchEnd?.(result);
          return;
        }
        this.resetPositions();
        this.phase = 'aim';
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
    for (const { body } of this.world.discs) {
      const pos = this.world.home.get(body.id);
      if (pos) {
        Body.setPosition(body, pos);
        Body.setVelocity(body, { x: 0, y: 0 });
      }
    }
    Body.setPosition(this.world.ball, { x: FIELD.width / 2, y: FIELD.height / 2 });
    Body.setVelocity(this.world.ball, { x: 0, y: 0 });
  }

  /** Test-only authoritative goal injection; does not expose physics to UI. */
  forceGoalForTest(scorer: TeamId): void {
    const y = scorer === 'red' ? FIELD.margin - 1 : FIELD.height - FIELD.margin + 1;
    Body.setPosition(this.world.ball, { x: FIELD.width / 2, y });
    this.lastTouch = scorer;
  }

  private detectGoal(): TeamId | null {
    const b = this.world.ball;
    const inGoalX = Math.abs(b.position.x - FIELD.width / 2) < GOAL_GAP / 2;
    if (!inGoalX) return null;
    const isBlueGoal = b.position.y <= FIELD.margin;
    const isRedGoal = b.position.y >= FIELD.height - FIELD.margin;
    if (!isBlueGoal && !isRedGoal) return null;
    if (!this.lastTouch) return isBlueGoal ? 'red' : 'blue';
    if ((isBlueGoal && this.lastTouch === 'blue') || (isRedGoal && this.lastTouch === 'red')) {
      return other(this.lastTouch);
    }
    return this.lastTouch;
  }

  private isSettled(): boolean {
    for (const body of [...this.world.discs.map((d) => d.body), this.world.ball]) {
      if (Math.abs(body.velocity.x) > SETTLE_SPEED || Math.abs(body.velocity.y) > SETTLE_SPEED) return false;
    }
    return true;
  }
}
