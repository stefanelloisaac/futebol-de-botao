/**
 * Core domain types for the button-football match.
 * Pure data — no DOM, no framework, no rendering concerns.
 */

export type TeamId = 'red' | 'blue';

/** The match is either waiting for a shot ('aim'), letting bodies settle ('resolving'),
 *  or finished when a team reaches the target goal count. */
export type MatchPhase = 'aim' | 'resolving' | 'finished';

export type Difficulty = 'easy' | 'medium' | 'hard';

export interface MatchConfig {
  /** Number of goals required to win the match. */
  targetGoals: number;
  /** AI difficulty (only relevant in single-player mode). */
  difficulty?: Difficulty;
}

export interface Vec2 {
  x: number;
  y: number;
}

/**
 * The network-ready unit of play: "team T flicks disc D with velocity V".
 * Designed early on purpose — this is what a client will one day send to the
 * authoritative server for online PvP.
 */
export interface ShotCommand {
  team: TeamId;
  discId: number;
  velocity: Vec2;
}

export interface DiscView {
  id: number;
  team: TeamId;
  keeper: boolean;
  position: Vec2;
  radius: number;
}

export interface BallView {
  position: Vec2;
  radius: number;
}

/** An immutable read-model of the match, produced for rendering and input. */
export interface MatchSnapshot {
  discs: DiscView[];
  ball: BallView;
  scoreRed: number;
  scoreBlue: number;
  activeTeam: TeamId;
  phase: MatchPhase;
  winner: TeamId | null;
}
