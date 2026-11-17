import { makeFood } from '@petmatch/core/test-helpers';
import { expect, test } from 'vitest';
import { createDb } from './client.js';
import { listFoods, seedFoods } from './food-repository.js';

test('returns seeded foods with arrays intact', async () => {
  const db = await createDb(':memory:');
  const foods = [
    makeFood({ id: 'a', brand: 'Alpha', allergens: ['fish'], breedSizes: ['small', 'large'] }),
    makeFood({ id: 'b', brand: 'Beta' }),
  ];
  await seedFoods(db, foods);
  expect(await listFoods(db)).toEqual(foods);
});

test('seeding twice does not duplicate rows', async () => {
  const db = await createDb(':memory:');
  const foods = [makeFood({ id: 'a' })];
  await seedFoods(db, foods);
  await seedFoods(db, foods);
  expect(await listFoods(db)).toHaveLength(1);
});

test('lists foods ordered by brand, then name', async () => {
  const db = await createDb(':memory:');
  await seedFoods(db, [
    makeFood({ id: '1', brand: 'Beta', name: 'A' }),
    makeFood({ id: '2', brand: 'Alpha', name: 'Z' }),
    makeFood({ id: '3', brand: 'Alpha', name: 'B' }),
  ]);
  expect((await listFoods(db)).map((f) => f.id)).toEqual(['3', '2', '1']);
});

test('seeding an empty list clears the table', async () => {
  const db = await createDb(':memory:');
  await seedFoods(db, [makeFood({ id: 'a' })]);
  await seedFoods(db, []);
  expect(await listFoods(db)).toEqual([]);
});
