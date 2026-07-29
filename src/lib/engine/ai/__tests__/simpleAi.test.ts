import { describe, expect, it } from 'vitest';
import { computeAiShot } from '../simpleAi';
import type { MatchSnapshot } from '../../types';

const snapshot: MatchSnapshot = {
  discs: [
    { id: 1, team: 'blue', keeper: false, position: { x: 200, y: 340 }, radius: 15 },
    { id: 2, team: 'blue', keeper: false, position: { x: 200, y: 346 }, radius: 15 },
    { id: 3, team: 'blue', keeper: false, position: { x: 200, y: 480 }, radius: 15 }
  ],
  ball: { position: { x: 200, y: 330 }, radius: 8.5 },
  scoreRed: 0,
  scoreBlue: 0,
  activeTeam: 'blue',
  phase: 'aim',
  winner: null
};

describe('computeAiShot', () => {
  it('escolhe o disco mais próximo quando não há blunder', () => {
    const shot = computeAiShot(snapshot, 'blue', 'hard', () => 0.5);
    expect(shot?.discId).toBe(1);
  });

  it('só escolhe alternativa válida durante blunder forçado', () => {
    // Primeiro RNG força blunder; segundo escolhe a única alternativa <= 1.8x.
    const values = [0, 0.9, 0.5, 0.5];
    const shot = computeAiShot(snapshot, 'blue', 'easy', () => values.shift() ?? 0.5);
    expect(shot?.discId).toBe(2);
  });

  it('não troca o melhor por candidato além do limite de blunder', () => {
    const shot = computeAiShot(snapshot, 'blue', 'easy', () => 0);
    // O disco 3 está a 15x a distância do mais próximo e nunca pode ser candidato.
    expect(shot?.discId).not.toBe(3);
  });
});
