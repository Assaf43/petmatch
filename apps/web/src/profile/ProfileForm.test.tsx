import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { makeProfile } from '@petmatch/core/test-helpers';
import { expect, test, vi } from 'vitest';
import { he } from '../i18n/he.js';
import { ProfileForm } from './ProfileForm.js';

// The form always submits choices in the schema's canonical order (lamb before fish).
const profile = makeProfile({
  allergies: ['chicken', 'egg'],
  preferredProteins: ['lamb', 'fish'],
  grainFree: 'yes',
});

test('submits the entered profile', async () => {
  const user = userEvent.setup();
  const onSubmit = vi.fn();
  render(<ProfileForm initial={null} onSubmit={onSubmit} />);
  await user.type(screen.getByLabelText(he.form.name), 'Miley');
  await user.type(screen.getByLabelText(he.form.age), '4');
  await user.click(screen.getByLabelText(he.breedSize.large));
  await user.click(screen.getByLabelText(he.allergen.chicken));
  await user.click(screen.getByRole('button', { name: he.form.submit }));
  expect(onSubmit).toHaveBeenCalledWith({
    name: 'Miley',
    species: 'dog',
    ageYears: 4,
    breedSize: 'large',
    allergies: ['chicken'],
    preferredProteins: [],
    grainFree: 'no-preference',
  });
});

test('shows an error and does not submit without a name', async () => {
  const user = userEvent.setup();
  const onSubmit = vi.fn();
  render(<ProfileForm initial={null} onSubmit={onSubmit} />);
  await user.click(screen.getByRole('button', { name: he.form.submit }));
  expect(screen.getByText(he.form.errors.name)).toBeInTheDocument();
  expect(onSubmit).not.toHaveBeenCalled();
});

test('prefills from the initial profile', () => {
  render(<ProfileForm initial={profile} onSubmit={vi.fn()} />);
  expect(screen.getByLabelText(he.form.name)).toHaveValue(profile.name);
  expect(screen.getByLabelText(he.form.age)).toHaveValue(profile.ageYears);
  expect(screen.getByLabelText(he.breedSize.large)).toBeChecked();
  expect(screen.getByLabelText(he.allergen.chicken)).toBeChecked();
  expect(screen.getByLabelText(he.allergen.egg)).toBeChecked();
  expect(screen.getByLabelText(he.allergen.fish)).not.toBeChecked();
  expect(screen.getByLabelText(he.protein.fish)).toBeChecked();
  expect(screen.getByLabelText(he.protein.lamb)).toBeChecked();
  expect(screen.getByLabelText(he.grainFree.yes)).toBeChecked();
});

test('resubmits a prefilled profile unchanged', async () => {
  const user = userEvent.setup();
  const onSubmit = vi.fn();
  render(<ProfileForm initial={profile} onSubmit={onSubmit} />);
  await user.click(screen.getByRole('button', { name: he.form.submit }));
  expect(onSubmit).toHaveBeenCalledWith(profile);
});

test('shows an error when no breed size is chosen', async () => {
  const user = userEvent.setup();
  const onSubmit = vi.fn();
  render(<ProfileForm initial={null} onSubmit={onSubmit} />);
  await user.type(screen.getByLabelText(he.form.name), 'Miley');
  await user.type(screen.getByLabelText(he.form.age), '4');
  await user.click(screen.getByRole('button', { name: he.form.submit }));
  expect(screen.getByText(he.form.errors.breedSize)).toBeInTheDocument();
  expect(onSubmit).not.toHaveBeenCalled();
});

test.each(['', '-1', '31'])('shows an age error for %j', async (age) => {
  const user = userEvent.setup();
  const onSubmit = vi.fn();
  render(<ProfileForm initial={makeProfile()} onSubmit={onSubmit} />);
  const field = screen.getByLabelText(he.form.age);
  await user.clear(field);
  if (age !== '') await user.type(field, age);
  await user.click(screen.getByRole('button', { name: he.form.submit }));
  expect(screen.getByText(he.form.errors.age)).toBeInTheDocument();
  expect(field).toHaveAttribute('aria-invalid', 'true');
  expect(onSubmit).not.toHaveBeenCalled();
});

test('accepts a fractional age', async () => {
  const user = userEvent.setup();
  const onSubmit = vi.fn();
  render(<ProfileForm initial={makeProfile()} onSubmit={onSubmit} />);
  const field = screen.getByLabelText(he.form.age);
  await user.clear(field);
  await user.type(field, '0.5');
  await user.click(screen.getByRole('button', { name: he.form.submit }));
  expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ ageYears: 0.5 }));
});

test('trims the name before submitting', async () => {
  const user = userEvent.setup();
  const onSubmit = vi.fn();
  render(<ProfileForm initial={makeProfile()} onSubmit={onSubmit} />);
  const field = screen.getByLabelText(he.form.name);
  await user.clear(field);
  await user.type(field, '  Miley  ');
  await user.click(screen.getByRole('button', { name: he.form.submit }));
  expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ name: 'Miley' }));
});

test('clears an error once the form is submitted correctly', async () => {
  const user = userEvent.setup();
  const onSubmit = vi.fn();
  render(<ProfileForm initial={makeProfile({ name: 'Miley' })} onSubmit={onSubmit} />);
  const field = screen.getByLabelText(he.form.name);
  await user.clear(field);
  await user.click(screen.getByRole('button', { name: he.form.submit }));
  expect(screen.getByText(he.form.errors.name)).toBeInTheDocument();
  await user.type(field, 'Miley');
  await user.click(screen.getByRole('button', { name: he.form.submit }));
  expect(screen.queryByText(he.form.errors.name)).not.toBeInTheDocument();
  expect(onSubmit).toHaveBeenCalledTimes(1);
});

test('lets the owner pick grain-free', async () => {
  const user = userEvent.setup();
  const onSubmit = vi.fn();
  render(<ProfileForm initial={makeProfile()} onSubmit={onSubmit} />);
  await user.click(screen.getByLabelText(he.grainFree.yes));
  await user.click(screen.getByRole('button', { name: he.form.submit }));
  expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ grainFree: 'yes' }));
});
