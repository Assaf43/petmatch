import { fileURLToPath } from 'node:url';
import { recommend } from '@petmatch/core';
import { makeProfile } from '@petmatch/core/test-helpers';
import { expect, test } from 'vitest';
import { loadCatalog } from './load-catalog.js';

const SEED_PATH = fileURLToPath(new URL('../../data/foods.seed.json', import.meta.url));

test('has 30 to 40 foods', async () => {
  const foods = await loadCatalog(SEED_PATH);
  expect(foods.length).toBeGreaterThanOrEqual(30);
  expect(foods.length).toBeLessThanOrEqual(40);
});

test.each(['small', 'medium', 'large'] as const)(
  'has at least 5 foods for %s breeds',
  async (size) => {
    const foods = await loadCatalog(SEED_PATH);
    expect(foods.filter((f) => f.breedSizes.includes(size)).length).toBeGreaterThanOrEqual(5);
  },
);

test.each([0.5, 4, 9])(
  'a dog aged %s with no restrictions gets at least 3 matches of 60 or more',
  async (ageYears) => {
    const foods = await loadCatalog(SEED_PATH);
    const profile = makeProfile({ ageYears, allergies: [], preferredProteins: [] });
    expect(
      recommend(profile, foods).matches.filter((m) => m.score >= 60).length,
    ).toBeGreaterThanOrEqual(3);
  },
);

// Extra checks on the data itself (beyond the plan): a hand-entered file is where mistakes creep in.
test('every food has a unique id and a unique brand + name', async () => {
  const foods = await loadCatalog(SEED_PATH);
  expect(new Set(foods.map((f) => f.id)).size).toBe(foods.length);
  expect(new Set(foods.map((f) => `${f.brand}|${f.name}`)).size).toBe(foods.length);
});

test('every food is a dog food with no image and an https buy link', async () => {
  const foods = await loadCatalog(SEED_PATH);
  for (const food of foods) {
    expect(food.species).toBe('dog');
    expect(food.imageUrl).toBeNull();
    expect(food.buyUrl.startsWith('https://')).toBe(true);
  }
});

test('a grain-free food lists no cereal grain', async () => {
  const foods = await loadCatalog(SEED_PATH);
  const grains = /\b(wheat|rice|maize|corn|barley|oats?|sorghum|millet|rye)\b/i;
  for (const food of foods.filter((f) => f.grainFree)) {
    expect(
      food.ingredients.filter((i) => grains.test(i)),
      food.id,
    ).toEqual([]);
  }
});

test('the catalog covers more than one protein and has grain-free foods', async () => {
  const foods = await loadCatalog(SEED_PATH);
  expect(new Set(foods.map((f) => f.mainProtein)).size).toBeGreaterThanOrEqual(3);
  expect(foods.some((f) => f.grainFree)).toBe(true);
});
