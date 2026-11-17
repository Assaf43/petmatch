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
