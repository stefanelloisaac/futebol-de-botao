import type { SettingsService } from '$lib/services/ports/SettingsService';
import type { StoragePort } from '$lib/services/ports/StoragePort';
import type { TeamId } from '$lib/engine';

const KEYS = {
  soundEnabled: 'settings:sound',
  vibrationEnabled: 'settings:vibration',
  teamNameRed: 'settings:teamName:red',
  teamNameBlue: 'settings:teamName:blue',
  targetGoals: 'settings:targetGoals'
};

export class LocalSettingsService implements SettingsService {
  constructor(private storage: StoragePort) {}

  getSoundEnabled(): boolean {
    return this.storage.get<boolean>(KEYS.soundEnabled) ?? true;
  }
  setSoundEnabled(v: boolean): void {
    this.storage.set(KEYS.soundEnabled, v);
  }

  getVibrationEnabled(): boolean {
    return this.storage.get<boolean>(KEYS.vibrationEnabled) ?? true;
  }
  setVibrationEnabled(v: boolean): void {
    this.storage.set(KEYS.vibrationEnabled, v);
  }

  getTeamName(team: TeamId): string {
    const key = team === 'red' ? KEYS.teamNameRed : KEYS.teamNameBlue;
    return this.storage.get<string>(key) ?? (team === 'red' ? 'Vermelho' : 'Azul');
  }
  setTeamName(team: TeamId, name: string): void {
    const key = team === 'red' ? KEYS.teamNameRed : KEYS.teamNameBlue;
    this.storage.set(key, name);
  }

  getTargetGoals(): number {
    return this.storage.get<number>(KEYS.targetGoals) ?? 3;
  }
  setTargetGoals(n: number): void {
    this.storage.set(KEYS.targetGoals, n);
  }
}
