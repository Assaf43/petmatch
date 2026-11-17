import { makeProfile } from '@petmatch/core/test-helpers';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { loadProfile, PROFILE_STORAGE_KEY, saveProfile } from './storage.js';

const profile = makeProfile();

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  vi.restoreAllMocks();
});

test('round-trips a profile', () => {
  saveProfile(profile);
  expect(loadProfile()).toEqual(profile);
});

test.each([
  '{ not json',
  JSON.stringify({ name: 'x' }),
  JSON.stringify({ ...profile, ageYears: 99 }),
  'null',
  '[]',
])('ignores a bad stored value: %s', (raw) => {
  localStorage.setItem(PROFILE_STORAGE_KEY, raw);
  expect(loadProfile()).toBeNull();
});

test('returns null when nothing is stored', () => {
  expect(loadProfile()).toBeNull();
});

test('returns null when storage throws on read', () => {
  vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
    throw new Error('blocked');
  });
  expect(loadProfile()).toBeNull();
});

test('does not throw when storage is full or blocked on write', () => {
  vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
    throw new Error('quota');
  });
  expect(() => {
    saveProfile(profile);
  }).not.toThrow();
});

test('uses a versioned key', () => {
  expect(PROFILE_STORAGE_KEY).toBe('petmatch.profile.v1');
});
