import { makeFood, makeProfile } from '@petmatch/core/test-helpers';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { ApiError, fetchRecommendations } from './client.js';

const fetchMock = vi.fn();
const profile = makeProfile();

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

beforeEach(() => {
  fetchMock.mockReset();
  vi.stubGlobal('fetch', fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

test('posts the profile and returns the result', async () => {
  fetchMock.mockResolvedValue(jsonResponse(200, { matches: [], excluded: [] }));
  await expect(fetchRecommendations(profile)).resolves.toEqual({ matches: [], excluded: [] });
  expect(fetchMock).toHaveBeenCalledWith(
    expect.stringMatching(/\/api\/recommendations$/),
    expect.objectContaining({ method: 'POST', body: JSON.stringify(profile) }),
  );
});

test('returns matches and excluded foods with their reasons', async () => {
  const food = makeFood();
  const result = {
    matches: [{ food, score: 92, reasons: [{ code: 'LIFE_STAGE_MATCH', kind: 'positive' }] }],
    excluded: [{ food, excludedBecause: { code: 'CONTAINS_ALLERGEN', allergens: ['chicken'] } }],
  };
  fetchMock.mockResolvedValue(jsonResponse(200, result));
  await expect(fetchRecommendations(profile)).resolves.toEqual(result);
});

test('throws ApiError with the server code', async () => {
  fetchMock.mockResolvedValue(
    jsonResponse(400, { error: { code: 'VALIDATION_ERROR', message: 'x' } }),
  );
  await expect(fetchRecommendations(profile)).rejects.toMatchObject({ code: 'VALIDATION_ERROR' });
  await expect(fetchRecommendations(profile)).rejects.toBeInstanceOf(ApiError);
});

test('throws NETWORK_ERROR when fetch rejects', async () => {
  fetchMock.mockRejectedValue(new TypeError('failed'));
  await expect(fetchRecommendations(profile)).rejects.toMatchObject({ code: 'NETWORK_ERROR' });
});

test('throws UNEXPECTED_RESPONSE when an error body is not the documented shape', async () => {
  fetchMock.mockResolvedValue(new Response('<html>Bad gateway</html>', { status: 502 }));
  await expect(fetchRecommendations(profile)).rejects.toMatchObject({
    code: 'UNEXPECTED_RESPONSE',
  });
});

test('throws UNEXPECTED_RESPONSE when a 200 body is not a recommendation result', async () => {
  fetchMock.mockResolvedValue(jsonResponse(200, { matches: 'nope' }));
  await expect(fetchRecommendations(profile)).rejects.toMatchObject({
    code: 'UNEXPECTED_RESPONSE',
  });
});

test('passes the abort signal to fetch and lets an abort through unchanged', async () => {
  const controller = new AbortController();
  const abort = new DOMException('Aborted', 'AbortError');
  fetchMock.mockImplementation(() => {
    controller.abort();
    return Promise.reject(abort);
  });
  await expect(fetchRecommendations(profile, controller.signal)).rejects.toBe(abort);
  expect(fetchMock).toHaveBeenCalledWith(
    expect.any(String),
    expect.objectContaining({ signal: controller.signal }),
  );
});
