import { describe, expect, it, vi } from 'vitest';
import { createMatchContext, shouldSubmitDaily } from '../appState';

function submitMatchResult(
  context: ReturnType<typeof createMatchContext>,
  submitResult: (result: { scoreRed: number; scoreBlue: number; won: boolean }) => void
): void {
  if (shouldSubmitDaily(context)) {
    submitResult({ scoreRed: 3, scoreBlue: 1, won: true });
  }
}

describe('match context', () => {
  it('não confunde partida normal hard com desafio diário', () => {
    const normalHard = createMatchContext('single', { targetGoals: 3, difficulty: 'hard' }, 'normal');
    expect(normalHard.config.difficulty).toBe('hard');
    expect(shouldSubmitDaily(normalHard)).toBe(false);
  });

  it('identifica explicitamente a origem daily', () => {
    expect(shouldSubmitDaily(createMatchContext('single', { targetGoals: 1 }, 'daily'))).toBe(true);
  });

  it('partida normal hard não submete resultado diário', () => {
    const submitResult = vi.fn();
    submitMatchResult(
      createMatchContext('single', { targetGoals: 3, difficulty: 'hard' }, 'normal'),
      submitResult
    );
    expect(submitResult).not.toHaveBeenCalled();
  });

  it('partida daily submete resultado exatamente uma vez', () => {
    const submitResult = vi.fn();
    submitMatchResult(createMatchContext('single', { targetGoals: 1 }, 'daily'), submitResult);
    expect(submitResult).toHaveBeenCalledTimes(1);
    expect(submitResult).toHaveBeenCalledWith({ scoreRed: 3, scoreBlue: 1, won: true });
  });
});
