import { render, screen } from '@testing-library/react';
import { expect, test } from 'vitest';
import { App } from './App.js';

test('renders the app name and a right-to-left layout', () => {
  render(<App />);
  expect(screen.getByRole('heading', { name: 'PetMatch' })).toBeInTheDocument();
  expect(document.querySelector('[dir="rtl"]')).not.toBeNull();
});
