import { expect, test } from 'vitest';
import { lifeStageForAge } from './life-stage.js';

test.each([
  [0, 'puppy'],
  [0.99, 'puppy'],
  [1, 'adult'],
  [6.9, 'adult'],
  [7, 'senior'],
  [30, 'senior'],
])('age %s is %s', (age, stage) => {
  expect(lifeStageForAge(age)).toBe(stage);
});
