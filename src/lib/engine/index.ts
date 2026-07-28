/** Public surface of the game engine. Consumers import only from here. */
export { Match, type MatchEvents } from './match/Match';
export { computeAiShot, getAiDelay } from './ai/simpleAi';
export {
  FIELD,
  GOAL_GAP,
  DISC_RADIUS,
  BALL_RADIUS,
  SHOT,
  PHYSICS
} from './constants';
export type {
  TeamId,
  MatchPhase,
  MatchConfig,
  Difficulty,
  MatchSnapshot,
  DiscView,
  BallView,
  ShotCommand,
  Vec2
} from './types';
