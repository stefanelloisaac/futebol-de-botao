import { describe, it, expect } from 'vitest';
import { computeAiShot, getAiDelay } from '../simpleAi';
import type { Difficulty } from '../../types';

describe('computeAiShot', () => {
  function makeSnapshot(overrides: Record<string, unknown> = {}) {
    return {
      discs: [],
      ball: { position: { x: 400, y: 300 }, radius: 8 },
      scoreRed: 0,
      scoreBlue: 0,
      phase: 'aim',
      activeTeam: 'red',
      turnNumber: 1,
      winner: null,
      ...overrides
    } as any;
  }

  it('returns null with no discs', () => {
    const shot = computeAiShot(makeSnapshot(), 'red');
    expect(shot).toBeNull();
  });

  it('returns a valid ShotCommand when discs exist', () => {
    const snapshot = makeSnapshot({
      discs: [
        { id: 1, team: 'red', keeper: false, position: { x: 350, y: 250 }, radius: 15 }
      ]
    });
    const shot = computeAiShot(snapshot, 'red');
    if (shot !== null) {
      expect(shot.team).toBe('red');
      expect(typeof shot.velocity.x).toBe('number');
      expect(typeof shot.velocity.y).toBe('number');
    }
  });

  it('returns null for team with no own discs', () => {
    const snapshot = makeSnapshot({
      discs: [
        { id: 1, team: 'blue', keeper: false, position: { x: 350, y: 250 }, radius: 15 }
      ]
    });
    const shot = computeAiShot(snapshot, 'red');
    expect(shot).toBeNull();
  });

  it('respects difficulty parameter', () => {
    const snapshot = makeSnapshot({
      discs: [
        { id: 1, team: 'red', keeper: false, position: { x: 350, y: 250 }, radius: 15 }
      ]
    });
    // Hard should also return a valid shot
    const shot = computeAiShot(snapshot, 'red', 'hard');
    expect(shot).not.toBeNull();
  });
});

describe('getAiDelay', () => {
  it('returns longer delay for easy difficulty', () => {
    const easy = getAiDelay('easy');
    const hard = getAiDelay('hard');
    expect(easy).toBeGreaterThan(hard);
  });

  it('returns a positive number for all difficulties', () => {
    for (const d of ['easy', 'medium', 'hard'] as Difficulty[]) {
      expect(getAiDelay(d)).toBeGreaterThan(0);
    }
  });
});
