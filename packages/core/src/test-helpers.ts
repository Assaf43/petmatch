import type { Food, PetProfile } from './types.js';

/** A valid adult, large-breed, fish-based dog food. Pass overrides to vary it. */
export function makeFood(overrides: Partial<Food> = {}): Food {
  return {
    id: 'food-1',
    brand: 'Brand',
    name: 'Adult Salmon',
    species: 'dog',
    lifeStage: 'adult',
    breedSizes: ['large'],
    mainProtein: 'fish',
    ingredients: ['salmon', 'rice'],
    allergens: [],
    grainFree: false,
    imageUrl: null,
    buyUrl: 'https://example.com/food-1',
    ...overrides,
  };
}

/** A valid profile that fully matches makeFood(). Pass overrides to vary it. */
export function makeProfile(overrides: Partial<PetProfile> = {}): PetProfile {
  return {
    name: 'Miley',
    species: 'dog',
    ageYears: 4,
    breedSize: 'large',
    allergies: [],
    preferredProteins: ['fish'],
    grainFree: 'no-preference',
    ...overrides,
  };
}
