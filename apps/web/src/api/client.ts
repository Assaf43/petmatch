import { ALLERGENS, foodSchema } from '@petmatch/core';
import type { PetProfile, RecommendationResult } from '@petmatch/core';
import { z } from 'zod';

const API_URL = (import.meta.env.VITE_API_URL ?? 'http://localhost:3000').replace(/\/+$/, '');

/** A failed API call. `code` is the server's error code, or one of the client-side codes below. */
export class ApiError extends Error {
  readonly code: string;

  constructor(code: string, message: string = code) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
  }
}

const REASON_CODES = [
  'LIFE_STAGE_MATCH',
  'LIFE_STAGE_MISMATCH',
  'BREED_SIZE_MATCH',
  'BREED_SIZE_MISMATCH',
  'PROTEIN_PREFERRED',
  'PROTEIN_NOT_PREFERRED',
  'GRAIN_FREE_MATCH',
  'GRAIN_FREE_MISMATCH',
] as const;

// Typed against core's result type, so a change there fails the build here.
const resultSchema: z.ZodType<RecommendationResult> = z.object({
  matches: z.array(
    z.object({
      food: foodSchema,
      score: z.number(),
      reasons: z.array(
        z.object({ code: z.enum(REASON_CODES), kind: z.enum(['positive', 'negative']) }),
      ),
    }),
  ),
  excluded: z.array(
    z.object({
      food: foodSchema,
      excludedBecause: z.discriminatedUnion('code', [
        z.object({ code: z.literal('SPECIES_MISMATCH') }),
        z.object({
          code: z.literal('CONTAINS_ALLERGEN'),
          allergens: z.array(z.enum(ALLERGENS)),
        }),
      ]),
    }),
  ),
});

const errorBodySchema = z.object({ error: z.object({ code: z.string(), message: z.string() }) });

async function readJson(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return undefined;
  }
}

/** Asks the API for ranked matches. Throws ApiError; an aborted request throws the abort error. */
export async function fetchRecommendations(
  profile: PetProfile,
  signal?: AbortSignal,
): Promise<RecommendationResult> {
  let response: Response;
  try {
    response = await fetch(`${API_URL}/api/recommendations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profile),
      signal,
    });
  } catch (err) {
    if (signal?.aborted) throw err;
    throw new ApiError('NETWORK_ERROR', 'Could not reach the server');
  }

  const body = await readJson(response);

  if (!response.ok) {
    const parsedError = errorBodySchema.safeParse(body);
    if (parsedError.success) {
      throw new ApiError(parsedError.data.error.code, parsedError.data.error.message);
    }
    throw new ApiError('UNEXPECTED_RESPONSE', `Server answered ${response.status}`);
  }

  const parsed = resultSchema.safeParse(body);
  if (!parsed.success) {
    throw new ApiError('UNEXPECTED_RESPONSE', 'Server sent an unexpected response');
  }
  return parsed.data;
}
