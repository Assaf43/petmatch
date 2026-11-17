import type { Food } from '@petmatch/core';
import { asc } from 'drizzle-orm';
import type { Db } from './client.js';
import { foods } from './schema.js';

/** Replaces every row in the catalog with `items`, in one transaction. */
export async function seedFoods(db: Db, items: Food[]): Promise<void> {
  await db.transaction(async (tx) => {
    await tx.delete(foods);
    if (items.length > 0) {
      await tx.insert(foods).values(items);
    }
  });
}

/** Returns the whole catalog ordered by brand, then name. */
export async function listFoods(db: Db): Promise<Food[]> {
  return db.select().from(foods).orderBy(asc(foods.brand), asc(foods.name));
}
