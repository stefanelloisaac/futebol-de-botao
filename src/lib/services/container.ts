import type { SettingsService } from '$lib/services/ports/SettingsService';
import type { StoragePort } from '$lib/services/ports/StoragePort';
import { LocalStorageAdapter } from '$lib/services/adapters/local/LocalStorageAdapter';
import { LocalSettingsService } from '$lib/services/adapters/local/LocalSettingsService';

let _storage: StoragePort | null = null;
let _settings: SettingsService | null = null;

function ensureStorage(): StoragePort {
  if (!_storage) {
    _storage = new LocalStorageAdapter();
  }
  return _storage;
}

export const container = {
  get settings(): SettingsService {
    if (!_settings) {
      _settings = new LocalSettingsService(ensureStorage());
    }
    return _settings;
  }
};
