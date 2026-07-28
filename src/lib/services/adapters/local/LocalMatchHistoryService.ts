import type { MatchRecord, MatchHistoryService } from '$lib/services/ports/MatchHistoryService';
import type { StoragePort } from '$lib/services/ports/StoragePort';

const HISTORY_KEY = 'fdb_match_history';
const MAX_RECORDS = 100;

export class LocalMatchHistoryService implements MatchHistoryService {
  private storage: StoragePort;

  constructor(storage: StoragePort) {
    this.storage = storage;
  }

  getAll(): MatchRecord[] {
    return this.storage.get<MatchRecord[]>(HISTORY_KEY) ?? [];
  }

  add(record: Omit<MatchRecord, 'id' | 'playedAt'>): void {
    const all = this.getAll();
    const entry: MatchRecord = {
      ...record,
      id: crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      playedAt: Date.now()
    };
    all.unshift(entry);
    if (all.length > MAX_RECORDS) {
      all.length = MAX_RECORDS;
    }
    this.storage.set(HISTORY_KEY, all);
  }

  clear(): void {
    this.storage.set(HISTORY_KEY, []);
  }
}
