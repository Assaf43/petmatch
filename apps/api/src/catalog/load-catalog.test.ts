import { fileURLToPath } from 'node:url';
import { deriveAllergens } from '@petmatch/core';
import { expect, test } from 'vitest';
import { loadCatalog } from './load-catalog.js';

const SEED_PATH = fileURLToPath(new URL('../../data/foods.seed.json', import.meta.url));
const fixture = (name: string): string =>
  fileURLToPath(new URL(`./fixtures/${name}`, import.meta.url));

test('loads the seed file and derives allergens', async () => {
  const foods = await loadCatalog(SEED_PATH);
  expect(foods.length).toBeGreaterThanOrEqual(5);
  for (const food of foods) expect(food.allergens).toEqual(deriveAllergens(food.ingredients));
});

test('rejects a row with a missing field and names its id', async () => {
  await expect(loadCatalog(fixture('missing-brand.json'))).rejects.toThrow(/bad-row/);
});

test('rejects duplicate ids', async () => {
  await expect(loadCatalog(fixture('duplicate-ids.json'))).rejects.toThrow(/duplicate/i);
});
