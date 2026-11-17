import { lifeStageForAge } from './life-stage.js';
import type { Food, PetProfile, Reason, ReasonCode, Weights } from './types.js';

export const DEFAULT_WEIGHTS: Weights = {
  lifeStage: 40,
  breedSize: 25,
  preferredProtein: 25,
  grainFree: 10,
};

interface Criterion {
  weight: number;
  applies: boolean;
  matches: boolean;
  matchCode: ReasonCode;
  mismatchCode: ReasonCode;
}

/**
 * Scores one food against a profile from 0 to 100.
 * Criteria the owner expressed no preference on are left out of the maximum.
 */
export function scoreFood(
  profile: PetProfile,
  food: Food,
  weights: Weights = DEFAULT_WEIGHTS,
): { score: number; reasons: Reason[] } {
  const criteria: Criterion[] = [
    {
      weight: weights.lifeStage,
      applies: true,
      matches: food.lifeStage === 'all' || food.lifeStage === lifeStageForAge(profile.ageYears),
      matchCode: 'LIFE_STAGE_MATCH',
      mismatchCode: 'LIFE_STAGE_MISMATCH',
    },
    {
      weight: weights.breedSize,
      applies: true,
      matches: food.breedSizes.includes(profile.breedSize),
      matchCode: 'BREED_SIZE_MATCH',
      mismatchCode: 'BREED_SIZE_MISMATCH',
    },
    {
      weight: weights.preferredProtein,
      applies: profile.preferredProteins.length > 0,
      matches: profile.preferredProteins.includes(food.mainProtein),
      matchCode: 'PROTEIN_PREFERRED',
      mismatchCode: 'PROTEIN_NOT_PREFERRED',
    },
    {
      weight: weights.grainFree,
      applies: profile.grainFree === 'yes',
      matches: food.grainFree,
      matchCode: 'GRAIN_FREE_MATCH',
      mismatchCode: 'GRAIN_FREE_MISMATCH',
    },
  ];

  const applicable = criteria.filter((criterion) => criterion.applies);
  const maximum = applicable.reduce((sum, criterion) => sum + criterion.weight, 0);
  const earned = applicable
    .filter((criterion) => criterion.matches)
    .reduce((sum, criterion) => sum + criterion.weight, 0);

  const reasons: Reason[] = applicable.map((criterion) =>
    criterion.matches
      ? { code: criterion.matchCode, kind: 'positive' }
      : { code: criterion.mismatchCode, kind: 'negative' },
  );

  return { score: maximum === 0 ? 0 : Math.round((earned / maximum) * 100), reasons };
}
