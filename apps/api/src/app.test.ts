import { makeFood, makeProfile } from '@petmatch/core/test-helpers';
import request from 'supertest';
import { describe, expect, test } from 'vitest';
import { createApp } from './app.js';

const foods = [
  makeFood({ id: 'fish', brand: 'Alpha' }),
  makeFood({ id: 'chicken', brand: 'Beta', mainProtein: 'chicken', allergens: ['chicken'] }),
];
const app = createApp({ listFoods: () => Promise.resolve(foods), webOrigin: '*' });
const validProfile = makeProfile({ allergies: ['chicken'] });

test('GET /health', async () => {
  const res = await request(app).get('/health');
  expect(res.status).toBe(200);
  expect(res.body).toEqual({ status: 'ok' });
});

test('GET /api/foods returns the catalog', async () => {
  expect((await request(app).get('/api/foods')).body).toHaveLength(2);
});

test('POST /api/recommendations returns matches and excluded foods', async () => {
  const res = await request(app).post('/api/recommendations').send(validProfile);
  expect(res.status).toBe(200);
  expect(res.body).toEqual({ matches: expect.any(Array), excluded: expect.any(Array) });
  expect(res.body.matches.map((m: { food: { id: string } }) => m.food.id)).toEqual(['fish']);
  expect(res.body.excluded).toHaveLength(1);
});

test.each([{ ageYears: -1 }, { ageYears: 31 }, { ageYears: '4' }, { name: '' }])(
  'rejects %o with 400',
  async (override) => {
    const res = await request(app)
      .post('/api/recommendations')
      .send({ ...validProfile, ...override });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
    expect(res.body.error.message).toEqual(expect.any(String));
  },
);

test('rejects a request with no body as a validation error', async () => {
  const res = await request(app).post('/api/recommendations');
  expect(res.status).toBe(400);
  expect(res.body.error.code).toBe('VALIDATION_ERROR');
});

test('rejects malformed JSON', async () => {
  const res = await request(app)
    .post('/api/recommendations')
    .set('Content-Type', 'application/json')
    .send('{ not json');
  expect(res.status).toBe(400);
  expect(res.body.error.code).toBe('INVALID_JSON');
});

test('rejects a body over the 10kb limit', async () => {
  const res = await request(app)
    .post('/api/recommendations')
    .send({ ...validProfile, name: 'x'.repeat(11_000) });
  expect(res.status).toBe(413);
  expect(res.body.error.code).toBe('VALIDATION_ERROR');
});

test('unknown route returns NOT_FOUND', async () => {
  const res = await request(app).get('/nope');
  expect(res.status).toBe(404);
  expect(res.body.error.code).toBe('NOT_FOUND');
});

describe('a failing dependency', () => {
  test('returns INTERNAL_ERROR without details', async () => {
    const broken = createApp({
      listFoods: () => Promise.reject(new Error('db password')),
      webOrigin: '*',
    });
    const res = await request(broken).get('/api/foods');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
    expect(JSON.stringify(res.body)).not.toContain('db password');
  });
});

describe('CORS', () => {
  const restricted = createApp({
    listFoods: () => Promise.resolve(foods),
    webOrigin: 'http://localhost:5173',
  });

  test('allows the configured web origin', async () => {
    const res = await request(restricted).get('/health').set('Origin', 'http://localhost:5173');
    expect(res.headers['access-control-allow-origin']).toBe('http://localhost:5173');
  });

  test('does not allow another origin', async () => {
    const res = await request(restricted).get('/health').set('Origin', 'https://evil.example');
    expect(res.headers['access-control-allow-origin']).not.toBe('https://evil.example');
  });
});
