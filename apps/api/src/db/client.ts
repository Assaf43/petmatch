import { fileURLToPath } from 'node:url';
import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import { migrate } from 'drizzle-orm/libsql/migrator';
import * as schema from './schema.js';

export type Db = ReturnType<typeof createDrizzle>;

const MIGRATIONS_FOLDER = fileURLToPath(new URL('../../drizzle', import.meta.url));

function createDrizzle(url: string) {
  return drizzle(createClient({ url }), { schema });
}

/** Opens the database at `url` (a libsql URL or ':memory:') and applies all migrations. */
export async function createDb(url: string): Promise<Db> {
  const db = createDrizzle(url);
  await migrate(db, { migrationsFolder: MIGRATIONS_FOLDER });
  return db;
}
