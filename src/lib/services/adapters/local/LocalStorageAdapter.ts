import type { StoragePort } from '$lib/services/ports/StoragePort';

export class LocalStorageAdapter implements StoragePort {
  get<T>(key: string): T | null {
    try {
      const raw = localStorage.getItem(key);
      if (raw === null) return null;
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  }

  set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // storage full or unavailable — silently ignore
    }
  }

  remove(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch {
      // silently ignore
    }
  }
}
