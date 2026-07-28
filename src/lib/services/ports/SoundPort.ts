export type SoundId =
  | 'shot'
  | 'collision'
  | 'goal'
  | 'whistle_start'
  | 'whistle_end'
  | 'ambient';

export interface SoundPort {
  /** Play a one-shot sound effect. */
  play(id: SoundId): void;
  /** Start looping ambient sound. Safe to call repeatedly. */
  startAmbient(): void;
  /** Stop the ambient loop. */
  stopAmbient(): void;
  /** Master toggle – when muted, no sound plays. */
  setMuted(muted: boolean): void;
  /** Tear down audio context, release resources. */
  destroy(): void;
}
