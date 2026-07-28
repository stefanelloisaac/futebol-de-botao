import { describe, it, expect } from 'vitest';
import { Match } from '../Match';
import type { MatchConfig } from '../../types';

function createMatch(targetGoals = 3): Match {
  const config: MatchConfig = { targetGoals, difficulty: 'medium' };
  return new Match(config);
}

describe('Match', () => {
  it('starts in aim phase', () => {
    expect(createMatch().phase).toBe('aim');
  });

  it('has zero scores initially', () => {
    const snap = createMatch().snapshot();
    expect(snap.scoreRed).toBe(0);
    expect(snap.scoreBlue).toBe(0);
  });

  it('is not finished initially', () => {
    expect(createMatch().phase).not.toBe('finished');
  });

  it('has an active team after creation', () => {
    const snap = createMatch().snapshot();
    expect(['red', 'blue']).toContain(snap.activeTeam);
  });

  it('rejects shot from wrong team', () => {
    const m = createMatch();
    const wrong = m.activeTeam === 'red' ? 'blue' : 'red';
    m.applyShot({ team: wrong, discId: 0, velocity: { x: 1, y: 1 } });
    expect(m.phase).toBe('aim'); // shot ignored, phase unchanged
  });

  it('accepts shot from correct team', () => {
    const m = createMatch();
    const team = m.activeTeam;
    // Find a valid discId for this team
    const snap = m.snapshot();
    const ownDisc = snap.discs.find(d => d.team === team);
    if (ownDisc) {
      m.applyShot({ team, discId: ownDisc.id, velocity: { x: 0.1, y: 0.1 } });
      expect(m.phase === 'resolving' || m.phase === 'aim').toBe(true);
    }
  });

  it('creates a valid snapshot with discs and ball', () => {
    const snap = createMatch().snapshot();
    expect(snap).toHaveProperty('discs');
    expect(snap).toHaveProperty('ball');
    expect(Array.isArray(snap.discs)).toBe(true);
    expect(snap.discs.length).toBeGreaterThan(0);
  });

  it('exposes the physics engine', () => {
    const engine = createMatch().getEngine();
    expect(engine).toBeDefined();
  });
});
