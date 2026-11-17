// Checks a running API: node scripts/smoke.mjs <apiUrl>   (for example http://localhost:3000)
// Exits 0 when the API is healthy and returns at least 3 matches for a typical dog, otherwise prints why and exits 1.
const PROFILE = {
  name: 'Smoke',
  species: 'dog',
  ageYears: 4,
  breedSize: 'medium',
  allergies: [],
  preferredProteins: [],
  grainFree: 'no-preference',
};
const MIN_MATCHES = 3;

function fail(reason) {
  console.error(`FAIL: ${reason}`);
  process.exit(1);
}

const baseUrl = process.argv[2]?.replace(/\/+$/, '');
if (!baseUrl) fail('usage: node scripts/smoke.mjs <apiUrl>');

async function request(path, init) {
  try {
    return await fetch(`${baseUrl}${path}`, { ...init, signal: AbortSignal.timeout(90_000) });
  } catch (err) {
    return fail(`${path} is unreachable (${err instanceof Error ? err.message : String(err)})`);
  }
}

const health = await request('/health');
const healthBody = await health.json().catch(() => undefined);
if (!health.ok || healthBody?.status !== 'ok') {
  fail(`/health answered ${health.status} with ${JSON.stringify(healthBody)}`);
}

const response = await request('/api/recommendations', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(PROFILE),
});
const body = await response.json().catch(() => undefined);
if (!response.ok)
  fail(`/api/recommendations answered ${response.status} with ${JSON.stringify(body)}`);
if (!Array.isArray(body?.matches)) fail('/api/recommendations did not return a matches list');
if (body.matches.length < MIN_MATCHES) {
  fail(`expected at least ${MIN_MATCHES} matches, got ${body.matches.length}`);
}

console.log(`OK: healthy, ${body.matches.length} matches, ${body.excluded.length} excluded`);
