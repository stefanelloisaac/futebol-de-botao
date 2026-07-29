/**
 * Core domain types for the button-football match.
 * Pure data — no DOM, no framework, no rendering concerns.
 */

export type TeamId = 'red' | 'blue';
export type MatchPhase = 'aim' | 'resolving' | 'finished';
export type Difficulty = 'easy' | 'medium' | 'hard';

export interface MatchConfig {
  targetGoals: number;
  difficulty?: Difficulty;
}

export interface Vec2 {
  x: number;
  y: number;
}

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

/** Authoritative payload emitted when a match reaches its target score. */
export interface MatchEndResult {
  winner: TeamId;
  scoreRed: number;
  scoreBlue: number;
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
