import { describe, expect, it } from 'vitest';
import { consumeFixedSteps, FIXED_STEP_MS } from '../fixedStep';

function simulateOneSecond(hz: number): number {
  let accumulator = 0;
  let steps = 0;
  const frameMs = 1000 / hz;
  let elapsed = 0;
  while (elapsed < 1000 - 1e-9) {
    const delta = Math.min(frameMs, 1000 - elapsed);
    const frame = consumeFixedSteps(accumulator, delta);
    accumulator = frame.accumulatorMs;
    steps += frame.steps;
    elapsed += delta;
  }
  return steps;
}

describe('fixed timestep', () => {
  it.each([60, 90, 120, 144])('simula ~60 steps reais em um segundo a %i Hz', (hz) => {
    expect(simulateOneSecond(hz)).toBe(60);
  });

  it('limita frames suspensos para evitar avalanche de steps', () => {
    expect(consumeFixedSteps(0, 10_000).steps).toBeLessThanOrEqual(Math.ceil(250 / FIXED_STEP_MS));
  });
});
