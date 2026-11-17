import { expect, test } from 'vitest';
import { deriveAllergens } from './allergens.js';

test('finds an allergen inside a longer ingredient', () => {
  expect(deriveAllergens(['Chicken Meal', 'brown rice'])).toEqual(['chicken']);
});

test('ignores case and sorts the result', () => {
  expect(deriveAllergens(['salmon oil', 'MAIZE'])).toEqual(['corn', 'fish']);
});

test('matches whole words only', () => {
  expect(deriveAllergens(['acorn squash', 'eggplant'])).toEqual([]);
});

test('returns each allergen once', () => {
  expect(deriveAllergens(['chicken', 'chicken fat', 'dried egg'])).toEqual(['chicken', 'egg']);
});

test('returns an empty list for no ingredients', () => {
  expect(deriveAllergens([])).toEqual([]);
});
