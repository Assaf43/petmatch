import type { z } from 'zod';
import type {
  ALLERGENS,
  BREED_SIZES,
  LIFE_STAGES,
  PROTEINS,
  SPECIES,
  foodSchema,
  foodSeedSchema,
  petProfileSchema,
} from './schemas.js';

export type Species = (typeof SPECIES)[number];
export type LifeStage = (typeof LIFE_STAGES)[number];
export type BreedSize = (typeof BREED_SIZES)[number];
export type Protein = (typeof PROTEINS)[number];
export type Allergen = (typeof ALLERGENS)[number];

export type PetProfile = z.infer<typeof petProfileSchema>;
export type Food = z.infer<typeof foodSchema>;
export type FoodSeed = z.infer<typeof foodSeedSchema>;

export type ExclusionReason =
  { code: 'SPECIES_MISMATCH' } | { code: 'CONTAINS_ALLERGEN'; allergens: Allergen[] };

export interface ExcludedFood {
  food: Food;
  excludedBecause: ExclusionReason;
}

export type ReasonCode =
  | 'LIFE_STAGE_MATCH'
  | 'LIFE_STAGE_MISMATCH'
  | 'BREED_SIZE_MATCH'
  | 'BREED_SIZE_MISMATCH'
  | 'PROTEIN_PREFERRED'
  | 'PROTEIN_NOT_PREFERRED'
  | 'GRAIN_FREE_MATCH'
  | 'GRAIN_FREE_MISMATCH';

export interface Reason {
  code: ReasonCode;
  kind: 'positive' | 'negative';
}

export interface Weights {
  lifeStage: number;
  breedSize: number;
  preferredProtein: number;
  grainFree: number;
}
