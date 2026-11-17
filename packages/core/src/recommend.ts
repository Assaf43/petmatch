import { filterFoods } from './filter.js';
import { scoreFood } from './scoring.js';
import type { Food, Match, PetProfile, RecommendationResult, Weights } from './types.js';

const byScoreThenLabel = (a: Match, b: Match): number =>
  b.score - a.score ||
  a.food.brand.localeCompare(b.food.brand) ||
  a.food.name.localeCompare(b.food.name);

/** Filters the catalog for a pet, scores what is left and returns it best match first. */
export function recommend(
  profile: PetProfile,
  foods: Food[],
  weights?: Weights,
): RecommendationResult {
  const { eligible, excluded } = filterFoods(profile, foods);
  const matches = eligible
    .map((food): Match => ({ food, ...scoreFood(profile, food, weights) }))
    .sort(byScoreThenLabel);
  return { matches, excluded };
}
