export interface Profile {
  id: string;
  name: string;
  createdAt: number;
  preferences: Record<string, string>;
}

export interface ProfileService {
  getProfile(): Profile;
  updateName(name: string): void;
}
