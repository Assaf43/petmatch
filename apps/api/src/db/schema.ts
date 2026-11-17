import type { Allergen, BreedSize, LifeStage, Protein, Species } from '@petmatch/core';
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const foods = sqliteTable('foods', {
  id: text('id').primaryKey(),
  brand: text('brand').notNull(),
  name: text('name').notNull(),
  species: text('species').$type<Species>().notNull(),
  lifeStage: text('life_stage').$type<LifeStage>().notNull(),
  breedSizes: text('breed_sizes', { mode: 'json' }).$type<BreedSize[]>().notNull(),
  mainProtein: text('main_protein').$type<Protein>().notNull(),
  ingredients: text('ingredients', { mode: 'json' }).$type<string[]>().notNull(),
  allergens: text('allergens', { mode: 'json' }).$type<Allergen[]>().notNull(),
  grainFree: integer('grain_free', { mode: 'boolean' }).notNull(),
  imageUrl: text('image_url'),
  buyUrl: text('buy_url').notNull(),
});
