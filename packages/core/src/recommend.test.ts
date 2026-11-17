import { expect, test } from 'vitest';
import { recommend } from './recommend.js';
import { makeFood, makeProfile } from './test-helpers.js';

test('sorts by score, highest first', () => {
  const foods = [makeFood({ id: 'lamb', mainProtein: 'lamb' }), makeFood({ id: 'fish' })];
  const ids = recommend(makeProfile(), foods).matches.map((match) => match.food.id);
  expect(ids).toEqual(['fish', 'lamb']);
});

test('breaks ties by brand then name', () => {
  const foods = [
    makeFood({ id: 'z', brand: 'Zeta' }),
    makeFood({ id: 'a2', brand: 'Alpha', name: 'Senior' }),
    makeFood({ id: 'a1', brand: 'Alpha', name: 'Adult' }),
  ];
  const ids = recommend(makeProfile(), foods).matches.map((match) => match.food.id);
  expect(ids).toEqual(['a1', 'a2', 'z']);
});

test('returns no matches when every food is excluded', () => {
  const foods = [
    makeFood({ id: 'a', allergens: ['fish'] }),
    makeFood({ id: 'b', allergens: ['fish'] }),
  ];
  const result = recommend(makeProfile({ allergies: ['fish'] }), foods);
  expect(result.matches).toEqual([]);
  expect(result.excluded).toHaveLength(2);
});

test('handles an empty catalog', () => {
  expect(recommend(makeProfile(), [])).toEqual({ matches: [], excluded: [] });
});

test('each match carries its score and reasons', () => {
  const [match] = recommend(makeProfile(), [makeFood()]).matches;
  expect(match?.score).toBe(100);
  expect(match?.reasons).toHaveLength(3);
});
