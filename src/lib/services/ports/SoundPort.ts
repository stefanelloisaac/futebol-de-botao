export interface SoundPort {
  play(name: string): void;
  startAmbient(): void;
  stopAmbient(): void;
  setMuted(muted: boolean): void;
  isMuted(): boolean;
}
