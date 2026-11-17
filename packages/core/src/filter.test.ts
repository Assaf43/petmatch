import { expect, test } from 'vitest';
import { filterFoods } from './filter.js';
import { makeFood, makeProfile } from './test-helpers.js';

test('excludes another species before checking allergens', () => {
  const cat = makeFood({ species: 'cat', allergens: ['chicken'] });
  const { eligible, excluded } = filterFoods(makeProfile({ allergies: ['chicken'] }), [cat]);
  expect(eligible).toEqual([]);
  expect(excluded[0]?.excludedBecause).toEqual({ code: 'SPECIES_MISMATCH' });
});

test('reports only the shared allergens', () => {
  const food = makeFood({ allergens: ['chicken', 'egg'] });
  const profile = makeProfile({ allergies: ['soy', 'egg', 'chicken'] });
  const { excluded } = filterFoods(profile, [food]);
  expect(excluded[0]?.excludedBecause).toEqual({
    code: 'CONTAINS_ALLERGEN',
    allergens: ['chicken', 'egg'],
  });
});

test('keeps every same-species food when there are no allergies', () => {
  const foods = [makeFood({ id: 'a' }), makeFood({ id: 'b' })];
  expect(filterFoods(makeProfile({ allergies: [] }), foods).eligible).toHaveLength(2);
});

test('keeps a food whose allergens the pet is not allergic to', () => {
  const food = makeFood({ allergens: ['fish'] });
  const { eligible } = filterFoods(makeProfile({ allergies: ['chicken'] }), [food]);
  expect(eligible).toEqual([food]);
});
