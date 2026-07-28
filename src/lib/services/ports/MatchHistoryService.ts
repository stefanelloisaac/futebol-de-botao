import type { TeamId } from '$lib/engine';
import type { GameMode } from '$lib/game/GameClient';
import type { MatchConfig } from '$lib/engine';

export interface MatchRecord {
  id: string;
  mode: GameMode;
  config: MatchConfig;
  scoreRed: number;
  scoreBlue: number;
  winner: TeamId | null;
  playedAt: number;
}

export interface MatchHistoryService {
  getAll(): MatchRecord[];
  add(record: Omit<MatchRecord, 'id' | 'playedAt'>): void;
  clear(): void;
}
