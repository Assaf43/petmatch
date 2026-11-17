import { z } from 'zod';

export const SPECIES = ['dog', 'cat'] as const;
export const LIFE_STAGES = ['puppy', 'adult', 'senior', 'all'] as const;
export const BREED_SIZES = ['small', 'medium', 'large'] as const;
export const PROTEINS = ['chicken', 'beef', 'lamb', 'fish', 'turkey', 'duck', 'other'] as const;
export const ALLERGENS = [
  'chicken',
  'beef',
  'lamb',
  'fish',
  'turkey',
  'duck',
  'egg',
  'dairy',
  'wheat',
  'corn',
  'soy',
] as const;

const hasNoDuplicates = (items: readonly unknown[]): boolean =>
  new Set(items).size === items.length;

const uniqueArray = <T extends z.ZodType>(item: T) =>
  z.array(item).refine(hasNoDuplicates, { message: 'Items must be unique' });

const httpsUrl = z
  .string()
  .url()
  .refine((value) => value.startsWith('https://'), { message: 'URL must use https' });

export const petProfileSchema = z.object({
  name: z.string().trim().min(1).max(40),
  species: z.enum(SPECIES),
  ageYears: z.number().min(0).max(30),
  breedSize: z.enum(BREED_SIZES),
  allergies: uniqueArray(z.enum(ALLERGENS)),
  preferredProteins: uniqueArray(z.enum(PROTEINS)),
  grainFree: z.enum(['yes', 'no-preference']),
});

export const foodSchema = z.object({
  id: z.string().min(1),
  brand: z.string().trim().min(1),
  name: z.string().trim().min(1),
  species: z.enum(SPECIES),
  lifeStage: z.enum(LIFE_STAGES),
  breedSizes: uniqueArray(z.enum(BREED_SIZES)).min(1),
  mainProtein: z.enum(PROTEINS),
  ingredients: z.array(z.string().trim().min(1)).min(1),
  allergens: uniqueArray(z.enum(ALLERGENS)),
  grainFree: z.boolean(),
  imageUrl: httpsUrl.nullable(),
  buyUrl: httpsUrl,
});

export const foodSeedSchema = foodSchema.omit({ allergens: true });
