import type { ExcludedFood, Match } from '@petmatch/core';
import { makeFood, makeProfile } from '@petmatch/core/test-helpers';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, test, vi } from 'vitest';
import { he } from '../i18n/he.js';
import { ExcludedList } from './ExcludedList.js';
import { FoodCard } from './FoodCard.js';
import { ResultsPage } from './ResultsPage.js';

const profile = makeProfile();

function match(score: number, overrides: Partial<Match> = {}): Match {
  return {
    food: makeFood(),
    score,
    reasons: [
      { code: 'LIFE_STAGE_MATCH', kind: 'positive' },
      { code: 'PROTEIN_NOT_PREFERRED', kind: 'negative' },
    ],
    ...overrides,
  };
}

const excludedFood: ExcludedFood = {
  food: makeFood({ id: 'chicken', brand: 'Acme', name: 'Chicken Feast', allergens: ['chicken'] }),
  excludedBecause: { code: 'CONTAINS_ALLERGEN', allergens: ['chicken', 'egg'] },
};

test('shows the computed score and the reasons', () => {
  render(
    <ResultsPage
      profile={profile}
      result={{ matches: [match(92)], excluded: [] }}
      onEdit={vi.fn()}
    />,
  );
  expect(screen.getByText('92%')).toBeInTheDocument();
  expect(screen.getByText(he.reason.LIFE_STAGE_MATCH)).toBeInTheDocument();
  expect(screen.getByText(he.reason.PROTEIN_NOT_PREFERRED)).toBeInTheDocument();
});

test('shows an empty state when nothing matches', () => {
  render(
    <ResultsPage
      profile={profile}
      result={{ matches: [], excluded: [excludedFood] }}
      onEdit={vi.fn()}
    />,
  );
  expect(screen.getByText(he.results.empty)).toBeInTheDocument();
});

test('keeps the excluded list visible when every food is excluded', () => {
  render(
    <ResultsPage
      profile={profile}
      result={{ matches: [], excluded: [excludedFood] }}
      onEdit={vi.fn()}
    />,
  );
  expect(screen.getByRole('button', { name: he.results.excluded(1) })).toBeInTheDocument();
});

test('always shows the disclaimer', () => {
  render(<ResultsPage profile={profile} result={{ matches: [], excluded: [] }} onEdit={vi.fn()} />);
  expect(screen.getByText(he.disclaimer)).toBeInTheDocument();
});

test('shows the disclaimer next to results too', () => {
  render(
    <ResultsPage
      profile={profile}
      result={{ matches: [match(80)], excluded: [] }}
      onEdit={vi.fn()}
    />,
  );
  expect(screen.getByText(he.disclaimer)).toBeInTheDocument();
});

test('greets the pet by name and lets the owner edit the profile', async () => {
  const user = userEvent.setup();
  const onEdit = vi.fn();
  render(
    <ResultsPage
      profile={makeProfile({ name: 'Miley' })}
      result={{ matches: [], excluded: [] }}
      onEdit={onEdit}
    />,
  );
  expect(screen.getByRole('heading', { name: he.results.title('Miley') })).toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: he.results.edit }));
  expect(onEdit).toHaveBeenCalledTimes(1);
});

test('lists matches in the order given', () => {
  render(
    <ResultsPage
      profile={profile}
      result={{
        matches: [
          match(90, { food: makeFood({ id: 'a', name: 'First Food' }) }),
          match(70, { food: makeFood({ id: 'b', name: 'Second Food' }) }),
        ],
        excluded: [],
      }}
      onEdit={vi.fn()}
    />,
  );
  const names = screen.getAllByRole('heading', { level: 3 }).map((h) => h.textContent);
  expect(names).toEqual(['First Food', 'Second Food']);
});

test('the buy link opens safely in a new tab', () => {
  render(<FoodCard match={match(92)} />);
  const link = screen.getByRole('link', { name: he.results.buy });
  expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  expect(link).toHaveAttribute('target', '_blank');
  expect(link).toHaveAttribute('href', makeFood().buyUrl);
});

test('a food card shows brand, name and a marker for each reason', () => {
  render(<FoodCard match={match(92)} />);
  expect(screen.getByText(makeFood().brand)).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: makeFood().name })).toBeInTheDocument();
  expect(screen.getAllByRole('listitem')).toHaveLength(2);
});

test('the excluded list is collapsed by default and shows the count', async () => {
  const user = userEvent.setup();
  render(<ExcludedList excluded={[excludedFood]} />);
  const toggle = screen.getByRole('button', { name: he.results.excluded(1) });
  expect(toggle).toHaveAttribute('aria-expanded', 'false');
  expect(
    screen.queryByText(`${excludedFood.food.brand} · ${excludedFood.food.name}`),
  ).not.toBeInTheDocument();

  await user.click(toggle);
  expect(toggle).toHaveAttribute('aria-expanded', 'true');
  expect(
    screen.getByText(`${excludedFood.food.brand} · ${excludedFood.food.name}`),
  ).toBeInTheDocument();
  expect(
    screen.getByText(
      he.exclusion.CONTAINS_ALLERGEN(`${he.allergenName.chicken}, ${he.allergenName.egg}`),
    ),
  ).toBeInTheDocument();
});

test('the excluded list explains a species mismatch', async () => {
  const user = userEvent.setup();
  render(
    <ExcludedList
      excluded={[
        { food: makeFood({ species: 'cat' }), excludedBecause: { code: 'SPECIES_MISMATCH' } },
      ]}
    />,
  );
  await user.click(screen.getByRole('button'));
  expect(screen.getByText(he.exclusion.SPECIES_MISMATCH)).toBeInTheDocument();
});

test('renders nothing when no food was excluded', () => {
  const { container } = render(<ExcludedList excluded={[]} />);
  expect(container).toBeEmptyDOMElement();
});
