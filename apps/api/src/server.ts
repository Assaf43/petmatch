import { fileURLToPath } from 'node:url';
import { createApp } from './app.js';
import { loadCatalog } from './catalog/load-catalog.js';
import { createDb } from './db/client.js';
import { listFoods, seedFoods } from './db/food-repository.js';
import { parseEnv } from './env.js';

const SEED_PATH = fileURLToPath(new URL('../data/foods.seed.json', import.meta.url));

async function main(): Promise<void> {
  const env = parseEnv(process.env);
  const catalog = await loadCatalog(SEED_PATH);
  const db = await createDb(env.DATABASE_URL);
  await seedFoods(db, catalog);

  const app = createApp({ listFoods: () => listFoods(db), webOrigin: env.WEB_ORIGIN });
  app.listen(env.PORT, () => {
    console.log(`PetMatch API listening on port ${env.PORT} (${catalog.length} foods)`);
  });
}

main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
