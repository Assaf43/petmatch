import type { LifeStage } from './types.js';

const ADULT_FROM_YEARS = 1;
const SENIOR_FROM_YEARS = 7;

/** Maps a dog's age to the life stage food labels use. */
export function lifeStageForAge(ageYears: number): Exclude<LifeStage, 'all'> {
  if (ageYears < ADULT_FROM_YEARS) return 'puppy';
  if (ageYears < SENIOR_FROM_YEARS) return 'adult';
  return 'senior';
}
