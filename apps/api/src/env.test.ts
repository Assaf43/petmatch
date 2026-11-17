import { expect, test } from 'vitest';
import { parseEnv } from './env.js';

test('uses the defaults when nothing is set', () => {
  expect(parseEnv({})).toEqual({
    PORT: 3000,
    WEB_ORIGIN: 'http://localhost:5173',
    DATABASE_URL: 'file:./data/petmatch.db',
  });
});

test('reads values from the given source', () => {
  const env = parseEnv({ PORT: '8080', WEB_ORIGIN: 'https://petmatch.example' });
  expect(env.PORT).toBe(8080);
  expect(env.WEB_ORIGIN).toBe('https://petmatch.example');
});

test.each(['abc', '0', '70000', '-1'])('rejects PORT %s', (port) => {
  expect(() => parseEnv({ PORT: port })).toThrow(/PORT/);
});
