import { expect, test } from 'vitest';
import { CORE_VERSION } from './index.js';

test('exports a version', () => {
  expect(CORE_VERSION).toBe('0.1.0');
});
