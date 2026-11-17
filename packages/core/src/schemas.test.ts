import { expect, test } from 'vitest';
import { foodSchema, petProfileSchema } from './schemas.js';

const valid = {
  name: 'Miley',
  species: 'dog',
  ageYears: 4,
  breedSize: 'large',
  allergies: ['chicken'],
  preferredProteins: ['fish'],
  grainFree: 'no-preference',
};

test('accepts a valid profile', () => {
  expect(petProfileSchema.parse(valid)).toEqual(valid);
});

test.each([0, 0.5, 30])('accepts age %s', (ageYears) => {
  expect(petProfileSchema.safeParse({ ...valid, ageYears }).success).toBe(true);
});

test.each([-1, 31, Number.NaN, '4'])('rejects age %s', (ageYears) => {
  expect(petProfileSchema.safeParse({ ...valid, ageYears }).success).toBe(false);
});

test('rejects an empty name', () => {
  expect(petProfileSchema.safeParse({ ...valid, name: '  ' }).success).toBe(false);
});

test('rejects an unknown allergen', () => {
  expect(petProfileSchema.safeParse({ ...valid, allergies: ['gold'] }).success).toBe(false);
});

test('rejects a repeated allergy', () => {
  const result = petProfileSchema.safeParse({ ...valid, allergies: ['chicken', 'chicken'] });
  expect(result.success).toBe(false);
});

test('rejects a non-https buyUrl', () => {
  expect(foodSchema.shape.buyUrl.safeParse('http://x.co').success).toBe(false);
});

test('accepts an https buyUrl', () => {
  expect(foodSchema.shape.buyUrl.safeParse('https://x.co/a').success).toBe(true);
});
