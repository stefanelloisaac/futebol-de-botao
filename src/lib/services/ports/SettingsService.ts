import type { TeamId } from '$lib/engine';

export interface SettingsService {
  getSoundEnabled(): boolean;
  setSoundEnabled(v: boolean): void;
  getVibrationEnabled(): boolean;
  setVibrationEnabled(v: boolean): void;
  getTeamName(team: TeamId): string;
  setTeamName(team: TeamId, name: string): void;
  getTargetGoals(): number;
  setTargetGoals(n: number): void;
}
