import type { ExcludedFood, Food, PetProfile } from './types.js';

/** Splits the catalog into foods the pet can eat and foods ruled out, with the reason. */
export function filterFoods(
  profile: PetProfile,
  foods: Food[],
): { eligible: Food[]; excluded: ExcludedFood[] } {
  const eligible: Food[] = [];
  const excluded: ExcludedFood[] = [];

  for (const food of foods) {
    if (food.species !== profile.species) {
      excluded.push({ food, excludedBecause: { code: 'SPECIES_MISMATCH' } });
      continue;
    }
    const shared = food.allergens.filter((allergen) => profile.allergies.includes(allergen)).sort();
    if (shared.length > 0) {
      excluded.push({ food, excludedBecause: { code: 'CONTAINS_ALLERGEN', allergens: shared } });
      continue;
    }
    eligible.push(food);
  }

  return { eligible, excluded };
}
