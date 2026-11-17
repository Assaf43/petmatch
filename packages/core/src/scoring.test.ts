import { expect, test } from 'vitest';
import { scoreFood } from './scoring.js';
import { makeFood, makeProfile } from './test-helpers.js';

test('a full match scores 100', () => {
  expect(scoreFood(makeProfile(), makeFood()).score).toBe(100);
});

test('a non-preferred protein scores 72', () => {
  // 65 of 90 applicable points
  expect(scoreFood(makeProfile(), makeFood({ mainProtein: 'lamb' })).score).toBe(72);
});

test('a missed grain-free preference scores 87', () => {
  // 65 of 75 applicable points
  const profile = makeProfile({ preferredProteins: [], grainFree: 'yes' });
  expect(scoreFood(profile, makeFood()).score).toBe(87);
});

test('a wrong life stage scores 38', () => {
  // 25 of 65 applicable points
  const profile = makeProfile({ ageYears: 0.5, preferredProteins: [] });
  expect(scoreFood(profile, makeFood()).score).toBe(38);
});

test('an all-life-stages food counts as a life stage match', () => {
  const { reasons } = scoreFood(makeProfile({ ageYears: 9 }), makeFood({ lifeStage: 'all' }));
  expect(reasons[0]).toEqual({ code: 'LIFE_STAGE_MATCH', kind: 'positive' });
});

test('lists reasons in order and skips criteria that do not apply', () => {
  const { reasons } = scoreFood(makeProfile(), makeFood({ mainProtein: 'lamb' }));
  expect(reasons.map((reason) => reason.code)).toEqual([
    'LIFE_STAGE_MATCH',
    'BREED_SIZE_MATCH',
    'PROTEIN_NOT_PREFERRED',
  ]);
});

test('marks a mismatch as a negative reason', () => {
  const { reasons } = scoreFood(makeProfile({ breedSize: 'small' }), makeFood());
  expect(reasons[1]).toEqual({ code: 'BREED_SIZE_MISMATCH', kind: 'negative' });
});

test('custom weights change the score', () => {
  const weights = { lifeStage: 50, breedSize: 50, preferredProtein: 0, grainFree: 0 };
  expect(scoreFood(makeProfile({ breedSize: 'small' }), makeFood(), weights).score).toBe(50);
});
