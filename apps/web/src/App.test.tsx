import type { Match, RecommendationResult } from '@petmatch/core';
import { makeFood, makeProfile } from '@petmatch/core/test-helpers';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, expect, test, vi } from 'vitest';
import { App } from './App.js';
import { ApiError } from './api/client.js';
import { he } from './i18n/he.js';
import { PROFILE_STORAGE_KEY, loadProfile } from './profile/storage.js';

const { fetchRecommendationsMock } = vi.hoisted(() => ({ fetchRecommendationsMock: vi.fn() }));

vi.mock('./api/client.js', async (importOriginal) => ({
  ...(await importOriginal<typeof import('./api/client.js')>()),
  fetchRecommendations: fetchRecommendationsMock,
}));

function match(score: number): Match {
  return {
    food: makeFood(),
    score,
    reasons: [{ code: 'LIFE_STAGE_MATCH', kind: 'positive' }],
  };
}

async function fillAndSubmitForm(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText(he.form.name), 'Miley');
  await user.type(screen.getByLabelText(he.form.age), '4');
  await user.click(screen.getByLabelText(he.breedSize.large));
  await user.click(screen.getByRole('button', { name: he.form.submit }));
}

beforeEach(() => {
  fetchRecommendationsMock.mockReset();
  localStorage.clear();
});

test('renders the app name and a right-to-left layout', () => {
  render(<App />);
  expect(screen.getByRole('heading', { name: 'PetMatch' })).toBeInTheDocument();
  expect(document.querySelector('[dir="rtl"]')).not.toBeNull();
});

test('starts with the profile form', () => {
  render(<App />);
  expect(screen.getByRole('button', { name: he.form.submit })).toBeInTheDocument();
});

test('shows loading, then results', async () => {
  const user = userEvent.setup();
  let resolve: (result: RecommendationResult) => void = () => undefined;
  fetchRecommendationsMock.mockReturnValue(
    new Promise<RecommendationResult>((r) => {
      resolve = r;
    }),
  );
  render(<App />);
  await fillAndSubmitForm(user);
  expect(screen.getByText(he.loading)).toBeInTheDocument();

  resolve({ matches: [match(92)], excluded: [] });
  expect(await screen.findByText('92%')).toBeInTheDocument();
  expect(screen.queryByText(he.loading)).not.toBeInTheDocument();
});

test('sends the submitted profile and saves it in the browser', async () => {
  const user = userEvent.setup();
  fetchRecommendationsMock.mockResolvedValue({ matches: [match(92)], excluded: [] });
  render(<App />);
  await fillAndSubmitForm(user);
  await screen.findByText('92%');
  expect(fetchRecommendationsMock).toHaveBeenCalledWith(
    expect.objectContaining({ name: 'Miley', ageYears: 4, breedSize: 'large' }),
    expect.anything(),
  );
  expect(loadProfile()).toMatchObject({ name: 'Miley' });
});

test('shows an error with a retry button that fetches again', async () => {
  const user = userEvent.setup();
  fetchRecommendationsMock.mockRejectedValueOnce(new ApiError('NETWORK_ERROR'));
  fetchRecommendationsMock.mockResolvedValueOnce({ matches: [match(92)], excluded: [] });
  render(<App />);
  await fillAndSubmitForm(user);
  expect(await screen.findByText(he.error.message)).toBeInTheDocument();
  await user.click(await screen.findByRole('button', { name: he.error.retry }));
  expect(await screen.findByText('92%')).toBeInTheDocument();
  expect(fetchRecommendationsMock).toHaveBeenCalledTimes(2);
  expect(fetchRecommendationsMock.mock.calls[1]?.[0]).toEqual(
    fetchRecommendationsMock.mock.calls[0]?.[0],
  );
});

test('an error is never a blank page: the form stays reachable', async () => {
  const user = userEvent.setup();
  fetchRecommendationsMock.mockRejectedValue(new ApiError('NETWORK_ERROR'));
  render(<App />);
  await fillAndSubmitForm(user);
  await screen.findByText(he.error.message);
  await user.click(screen.getByRole('button', { name: he.error.edit }));
  expect(screen.getByLabelText(he.form.name)).toHaveValue('Miley');
});

test('a profile whose allergies exclude every food shows the empty state, not an error', async () => {
  const user = userEvent.setup();
  fetchRecommendationsMock.mockResolvedValue({
    matches: [],
    excluded: [
      {
        food: makeFood(),
        excludedBecause: { code: 'CONTAINS_ALLERGEN', allergens: ['fish'] },
      },
    ],
  });
  render(<App />);
  await fillAndSubmitForm(user);
  expect(await screen.findByText(he.results.empty)).toBeInTheDocument();
  expect(screen.queryByText(he.error.message)).not.toBeInTheDocument();
});

test('editing the profile from the results brings back the form, prefilled', async () => {
  const user = userEvent.setup();
  fetchRecommendationsMock.mockResolvedValue({ matches: [match(92)], excluded: [] });
  render(<App />);
  await fillAndSubmitForm(user);
  await screen.findByText('92%');
  await user.click(screen.getByRole('button', { name: he.results.edit }));
  expect(screen.getByLabelText(he.form.name)).toHaveValue('Miley');
  expect(screen.getByLabelText(he.breedSize.large)).toBeChecked();
});

test('prefills the form from a saved profile', () => {
  localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(makeProfile({ name: 'Rex' })));
  render(<App />);
  expect(screen.getByLabelText(he.form.name)).toHaveValue('Rex');
});

test('ignores a corrupt saved profile and shows the empty form', () => {
  localStorage.setItem(PROFILE_STORAGE_KEY, '{ not json');
  render(<App />);
  expect(screen.getByLabelText(he.form.name)).toHaveValue('');
});

test('an aborted request leaves no error behind', async () => {
  const user = userEvent.setup();
  fetchRecommendationsMock.mockImplementation((_profile: unknown, signal: AbortSignal) => {
    return new Promise((_resolve, reject) => {
      signal.addEventListener('abort', () => {
        reject(new DOMException('Aborted', 'AbortError'));
      });
    });
  });
  const { unmount } = render(<App />);
  await fillAndSubmitForm(user);
  unmount();
  // Nothing to assert on a removed tree except that no unhandled rejection is raised.
  await Promise.resolve();
});
