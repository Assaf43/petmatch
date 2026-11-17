import { ALLERGENS } from './schemas.js';
import type { Allergen } from './types.js';

export const ALLERGEN_KEYWORDS: Record<Allergen, string[]> = {
  chicken: ['chicken', 'poultry'],
  beef: ['beef'],
  lamb: ['lamb'],
  fish: ['fish', 'salmon', 'herring', 'tuna', 'trout', 'sardine', 'mackerel', 'whitefish', 'cod'],
  turkey: ['turkey'],
  duck: ['duck'],
  egg: ['egg', 'eggs'],
  dairy: ['milk', 'whey', 'cheese', 'dairy', 'lactose'],
  wheat: ['wheat', 'gluten'],
  corn: ['corn', 'maize'],
  soy: ['soy', 'soya', 'soybean'],
};

const ALLERGEN_PATTERNS: [Allergen, RegExp][] = ALLERGENS.map((allergen) => [
  allergen,
  new RegExp(`\\b(${ALLERGEN_KEYWORDS[allergen].join('|')})\\b`, 'i'),
]);

/** Returns the allergens found in an ingredient list, unique and sorted alphabetically. */
export function deriveAllergens(ingredients: string[]): Allergen[] {
  return ALLERGEN_PATTERNS.filter(([, pattern]) =>
    ingredients.some((ingredient) => pattern.test(ingredient)),
  )
    .map(([allergen]) => allergen)
    .sort();
}
