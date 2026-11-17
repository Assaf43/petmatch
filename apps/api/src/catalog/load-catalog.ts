import { readFile } from 'node:fs/promises';
import { deriveAllergens, foodSeedSchema } from '@petmatch/core';
import type { Food } from '@petmatch/core';

function describeRow(row: unknown, index: number): string {
  if (typeof row === 'object' && row !== null && 'id' in row && typeof row.id === 'string') {
    return `"${row.id}"`;
  }
  return `at index ${index}`;
}

/**
 * Reads the catalog JSON array, validates each row and derives its allergens
 * from the ingredient list. Throws an Error naming the row's id when a row is
 * invalid or an id appears twice.
 */
export async function loadCatalog(filePath: string): Promise<Food[]> {
  const raw: unknown = JSON.parse(await readFile(filePath, 'utf8'));
  if (!Array.isArray(raw)) {
    throw new Error(`Catalog ${filePath} must be a JSON array`);
  }

  const seenIds = new Set<string>();
  return raw.map((row: unknown, index) => {
    const parsed = foodSeedSchema.safeParse(row);
    if (!parsed.success) {
      const problems = parsed.error.issues
        .map((issue) => `${issue.path.join('.') || '(row)'}: ${issue.message}`)
        .join('; ');
      throw new Error(`Invalid catalog row ${describeRow(row, index)}: ${problems}`);
    }
    const seed = parsed.data;
    if (seenIds.has(seed.id)) {
      throw new Error(`Duplicate catalog id "${seed.id}"`);
    }
    seenIds.add(seed.id);
    return { ...seed, allergens: deriveAllergens(seed.ingredients) };
  });
}
