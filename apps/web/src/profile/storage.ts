import { petProfileSchema } from '@petmatch/core';
import type { PetProfile } from '@petmatch/core';

/** Versioned, so a future profile shape can use a new key instead of misreading old data. */
export const PROFILE_STORAGE_KEY = 'petmatch.profile.v1';

/** Returns the saved profile, or null if there is none or it is unreadable, invalid or blocked. */
export function loadProfile(): PetProfile | null {
  try {
    const raw = localStorage.getItem(PROFILE_STORAGE_KEY);
    if (raw === null) return null;
    const parsed = petProfileSchema.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

/** Saves the profile in this browser. Failures (storage full or blocked) are ignored. */
export function saveProfile(profile: PetProfile): void {
  try {
    localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
  } catch {
    // The app works without persistence; the form is just empty next time.
  }
}
