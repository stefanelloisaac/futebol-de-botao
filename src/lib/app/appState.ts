import type { Difficulty, MatchConfig, TeamId } from '$lib/engine';

export type MatchSource = 'normal' | 'daily';

export interface MatchContext {
  mode: 'single' | 'local';
  config: MatchConfig;
  source: MatchSource;
}

export interface MatchResult {
  scoreRed: number;
  scoreBlue: number;
  winner: TeamId;
}

/** Pure helpers used by the reactive app state and tested without Svelte/DOM. */
export function createMatchContext(
  mode: MatchContext['mode'],
  config: MatchConfig = { targetGoals: 3 },
  source: MatchSource = 'normal'
): MatchContext {
  return { mode, config: { ...config }, source };
}

export function shouldSubmitDaily(context: MatchContext): boolean {
  return context.source === 'daily';
}

export function normalConfig(difficulty?: Difficulty): MatchConfig {
  return difficulty ? { targetGoals: 3, difficulty } : { targetGoals: 3 };
}
