import type { Profile, ProfileService } from '$lib/services/ports/ProfileService';
import type { StoragePort } from '$lib/services/ports/StoragePort';

const PROFILE_KEY = 'fdb_profile';

function defaultProfile(): Profile {
  return {
    id: crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    name: 'Jogador',
    createdAt: Date.now(),
    preferences: {}
  };
}

export class LocalProfileService implements ProfileService {
  private storage: StoragePort;

  constructor(storage: StoragePort) {
    this.storage = storage;
  }

  private load(): Profile {
    const existing = this.storage.get<Profile>(PROFILE_KEY);
    if (existing) return existing;
    const profile = defaultProfile();
    this.storage.set(PROFILE_KEY, profile);
    return profile;
  }

  private save(profile: Profile): void {
    this.storage.set(PROFILE_KEY, profile);
  }

  getProfile(): Profile {
    return this.load();
  }

  updateName(name: string): void {
    const profile = this.load();
    profile.name = name;
    this.save(profile);
  }
}
