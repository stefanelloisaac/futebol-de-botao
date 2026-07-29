export const FIXED_STEP_MS = 1000 / 60;
export const MAX_FRAME_MS = 250;

/** Number of stable simulation steps to run for one render-frame delta. */
export function consumeFixedSteps(accumulatorMs: number, elapsedMs: number): {
  steps: number;
  accumulatorMs: number;
} {
  let accumulator = accumulatorMs + Math.min(Math.max(0, elapsedMs), MAX_FRAME_MS);
  let steps = 0;
  // Account for the floating-point remainder accumulated by fractional refresh rates.
  while (accumulator + 1e-9 >= FIXED_STEP_MS) {
    accumulator -= FIXED_STEP_MS;
    steps++;
  }
  return { steps, accumulatorMs: accumulator };
}
