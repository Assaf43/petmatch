# PetMatch v2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and deploy a web app where a dog owner fills in a short pet profile and gets a ranked, explained list of suitable foods.

**Architecture:** One npm-workspaces repository with three packages. `packages/core` holds the matching engine as pure TypeScript functions. `apps/api` is an Express server that loads a hand-entered catalog into SQLite and exposes it through three endpoints. `apps/web` is a React app that collects the profile, calls the API and renders the results in Hebrew, right-to-left.

**Tech Stack:** Node 22+, TypeScript (strict), npm workspaces, Zod, Vitest, Express 5, Drizzle ORM with `@libsql/client` (SQLite file), Supertest, React 19, Vite, Tailwind CSS 4, Testing Library, ESLint, Prettier, GitHub Actions.

**Spec:** `docs/design.md`

## Global Constraints

- **Repository location:** `C:\Users\himan\projects\PetMatch\dev`. The May code was moved to `C:\Users\himan\projects\PetMatch\old` and serves as the archive.
- **Git identity:** commits must not contain the owner's personal email address. The repository uses the GitHub no-reply address (`<id>+<username>@users.noreply.github.com`) as `user.email`.
- **Never commit:** `.env` files, `*.db` files, `node_modules`.
- **Branching:** `main` is always deployable. Each task is done on a branch named `task-NN-short-name` and merged by pull request.
- **Commits:** Conventional Commits (`feat:`, `fix:`, `chore:`, `docs:`, `test:`, `refactor:`).
- **Tags:** `v0.1.0` after Task 1, `v0.2.0` after Task 6, `v0.3.0` after Task 10, `v0.4.0` after Task 14, `v1.0.0` after Task 15.
- **TypeScript:** `strict: true`, no `any` (use `unknown`), Zod on every external input, throw `Error` instances only.
- **Naming:** files `kebab-case.ts`, React component files `PascalCase.tsx`, functions and variables `camelCase`, constants `SCREAMING_SNAKE_CASE`, types `PascalCase`.
- **Language:** UI text is Hebrew and lives only in `apps/web/src/i18n/he.ts`. Code, comments, commits and docs are English.
- **Scope:** dogs only, no accounts, no scraping, no stored prices, no health-condition fields. Anything outside section 5 of the spec waits until `v1.0.0` is tagged.
- **Disclaimer:** every results page shows the "not veterinary advice" text.
- **Deviation from the spec:** `imageUrl` is `string | null` and every v1 catalog row has `null`. The web app shows a generic illustration per main protein, so no manufacturer images are hot-linked.

## Review Focus

1. **A profile whose allergies exclude every food.** Expected: an empty-state message and the excluded list, not an error. Tests in Task 6 and Task 14.
2. **Ages at the edges** (`0`, `0.5`, `30`, `-1`, `31`, non-numbers). Expected: `0`–`30` accepted including fractions, everything else rejected with a 400 and a readable message. Tests in Task 2 and Task 9.
3. **Ingredient spelling and casing** (`Chicken Meal`, `MAIZE`, `eggplant`, `acorn squash`). Expected: matching is case-insensitive and whole-word, so `eggplant` is not egg. Tests in Task 3.
4. **The API is slow or unreachable** (free-tier hosts sleep). Expected: a loading state, then an error message with a retry button, never a blank page. Tests in Task 14.
5. **A corrupt or outdated profile in `localStorage`.** Expected: it is ignored and the empty form is shown. Tests in Task 12.

---

## File Structure

```
dev/
├── package.json                      workspaces + root scripts
├── tsconfig.base.json
├── eslint.config.js
├── .prettierrc
├── .gitignore
├── .github/workflows/ci.yml
├── README.md
├── docs/
│   ├── design.md
│   ├── plan.md
│   └── decisions.md                  hosting choice and later decisions
├── scripts/smoke.mjs                 post-deploy check
├── packages/core/src/
│   ├── schemas.ts                    Zod schemas
│   ├── types.ts                      types inferred from schemas + result types
│   ├── allergens.ts                  deriveAllergens
│   ├── life-stage.ts                 lifeStageForAge
│   ├── filter.ts                     filterFoods
│   ├── scoring.ts                    scoreFood, DEFAULT_WEIGHTS
│   ├── recommend.ts                  recommend
│   └── index.ts                      public exports
├── apps/api/
│   ├── data/foods.seed.json          the catalog, source of truth
│   ├── drizzle/                      generated migrations
│   └── src/
│       ├── env.ts
│       ├── errors.ts                 AppError
│       ├── catalog/load-catalog.ts
│       ├── db/schema.ts
│       ├── db/client.ts
│       ├── db/seed.ts
│       ├── db/food-repository.ts
│       ├── app.ts                    createApp
│       └── server.ts                 boot: migrate, seed, listen
└── apps/web/src/
    ├── i18n/he.ts
    ├── api/client.ts
    ├── profile/storage.ts
    ├── profile/ProfileForm.tsx
    ├── results/FoodCard.tsx
    ├── results/ExcludedList.tsx
    ├── results/ResultsPage.tsx
    ├── layout/Sidebar.tsx
    ├── App.tsx
    └── main.tsx
```

Test files sit next to the file they test, named `<name>.test.ts(x)`.

---

## Milestone M0 — Repository and tooling

### Task 1: Repository, tooling and CI

**Files:**

- Create: `package.json`, `tsconfig.base.json`, `eslint.config.js`, `.prettierrc`, `.gitignore`, `.github/workflows/ci.yml`, `README.md`, `docs/design.md`, `docs/plan.md`
- Create: `packages/core/package.json`, `packages/core/tsconfig.json`, `packages/core/src/index.ts`
- Test: `packages/core/src/index.test.ts`

**Interfaces:**

- Produces: package name `@petmatch/core`; root scripts `npm run lint`, `npm run typecheck`, `npm test`, `npm run format`; `CORE_VERSION: string` exported from `packages/core/src/index.ts`.

- [ ] **Step 1: Create the folder and the repository**

```bash
cd C:\Users\himan\projects\PetMatch\dev
git init -b main
git config user.name "<GitHub display name>"
git config user.email "<id>+<username>@users.noreply.github.com"
```

On GitHub, under Settings → Emails, turn on "Keep my email addresses private" and "Block command line pushes that expose my email".

- [ ] **Step 2: Add `.gitignore`** with `node_modules/`, `dist/`, `.env`, `.env.*`, `!.env.example`, `*.db`, `coverage/`.

- [ ] **Step 3: Add root `package.json`** with `"private": true`, `"workspaces": ["packages/*", "apps/*"]`, `"engines": { "node": ">=22" }` and the four root scripts. `test` runs `vitest run` in every workspace; `typecheck` runs `tsc --noEmit` in every workspace.

- [ ] **Step 4: Add `tsconfig.base.json`** with `strict`, `noUncheckedIndexedAccess`, `module: "NodeNext"`, `target: "ES2022"`. Add ESLint (typescript-eslint, `no-explicit-any` as error) and Prettier configs.

- [ ] **Step 5: Write the failing test** in `packages/core/src/index.test.ts`

```ts
import { CORE_VERSION } from './index';
test('exports a version', () => {
  expect(CORE_VERSION).toBe('0.1.0');
});
```

- [ ] **Step 6: Run it.** `npm test` → FAIL, `CORE_VERSION` is not exported.

- [ ] **Step 7: Export `CORE_VERSION = '0.1.0'`** from `packages/core/src/index.ts`.

- [ ] **Step 8: Run all checks.** `npm run lint && npm run typecheck && npm test` → all pass.

- [ ] **Step 9: Add `.github/workflows/ci.yml`**: on `push` and `pull_request`, Node 22, `npm ci`, then lint, typecheck, test.

- [ ] **Step 10: Copy the approved design and this plan** to `docs/design.md` and `docs/plan.md`. Add a README with the project name, one-paragraph description and a "Status: in development" line.

- [ ] **Step 11: Verify the commit identity, then commit and push**

```bash
git add .
git commit -m "chore: set up workspaces, tooling and CI"
git log -1 --format=%ae
```

Expected: the printed address ends with `users.noreply.github.com`. Then create the GitHub repository `petmatch`, push, confirm CI is green, and tag `v0.1.0`.

---

## Milestone M1 — Matching engine

### Task 2: Schemas and types

**Files:**

- Create: `packages/core/src/schemas.ts`, `packages/core/src/types.ts`
- Test: `packages/core/src/schemas.test.ts`

**Interfaces:**

- Produces, from `schemas.ts`: `petProfileSchema`, `foodSchema`, `foodSeedSchema` (`foodSchema` without `allergens`), and the value lists `SPECIES`, `LIFE_STAGES`, `BREED_SIZES`, `PROTEINS`, `ALLERGENS`.
- Produces, from `types.ts`:

```ts
export type Species = 'dog' | 'cat';
export type LifeStage = 'puppy' | 'adult' | 'senior' | 'all';
export type BreedSize = 'small' | 'medium' | 'large';
export type Protein = 'chicken' | 'beef' | 'lamb' | 'fish' | 'turkey' | 'duck' | 'other';
export type Allergen =
  | 'chicken'
  | 'beef'
  | 'lamb'
  | 'fish'
  | 'turkey'
  | 'duck'
  | 'egg'
  | 'dairy'
  | 'wheat'
  | 'corn'
  | 'soy';

export type PetProfile = z.infer<typeof petProfileSchema>;
// { name: string; species: Species; ageYears: number; breedSize: BreedSize;
//   allergies: Allergen[]; preferredProteins: Protein[];
//   grainFree: 'yes' | 'no-preference' }

export type Food = z.infer<typeof foodSchema>;
// { id: string; brand: string; name: string; species: Species;
//   lifeStage: LifeStage; breedSizes: BreedSize[]; mainProtein: Protein;
//   ingredients: string[]; allergens: Allergen[]; grainFree: boolean;
//   imageUrl: string | null; buyUrl: string }

export type FoodSeed = z.infer<typeof foodSeedSchema>;
```

- Validation rules: `name` trimmed, 1–40 characters. `ageYears` a number from 0 to 30 inclusive. `breedSizes` and `ingredients` have at least one item. `buyUrl` is an `https://` URL. Arrays reject duplicates.

- [ ] **Step 1: Write the failing tests**

```ts
const valid = {
  name: 'Miley',
  species: 'dog',
  ageYears: 4,
  breedSize: 'large',
  allergies: ['chicken'],
  preferredProteins: ['fish'],
  grainFree: 'no-preference',
};

test('accepts a valid profile', () => {
  expect(petProfileSchema.parse(valid)).toEqual(valid);
});
test.each([0, 0.5, 30])('accepts age %s', (ageYears) => {
  expect(petProfileSchema.safeParse({ ...valid, ageYears }).success).toBe(true);
});
test.each([-1, 31, Number.NaN, '4'])('rejects age %s', (ageYears) => {
  expect(petProfileSchema.safeParse({ ...valid, ageYears }).success).toBe(false);
});
test('rejects an empty name', () => {
  expect(petProfileSchema.safeParse({ ...valid, name: '  ' }).success).toBe(false);
});
test('rejects an unknown allergen', () => {
  expect(petProfileSchema.safeParse({ ...valid, allergies: ['gold'] }).success).toBe(false);
});
test('rejects a non-https buyUrl', () => {
  expect(foodSchema.shape.buyUrl.safeParse('http://x.co').success).toBe(false);
});
```

- [ ] **Step 2: Run.** `npm test -w @petmatch/core` → FAIL, module not found.
- [ ] **Step 3: Implement the schemas in `schemas.ts` and the types in `types.ts`.**
- [ ] **Step 4: Run.** → PASS.
- [ ] **Step 5: Commit.** `feat(core): add profile and food schemas`

### Task 3: Allergen derivation

**Files:**

- Create: `packages/core/src/allergens.ts`
- Test: `packages/core/src/allergens.test.ts`

**Interfaces:**

- Consumes: `Allergen` from Task 2.
- Produces: `deriveAllergens(ingredients: string[]): Allergen[]`, returning unique allergens sorted alphabetically, and `ALLERGEN_KEYWORDS: Record<Allergen, string[]>`.

Keyword table (the spec's data, copy exactly):

| Allergen | Keywords                                                              |
| -------- | --------------------------------------------------------------------- |
| chicken  | chicken, poultry                                                      |
| beef     | beef                                                                  |
| lamb     | lamb                                                                  |
| fish     | fish, salmon, herring, tuna, trout, sardine, mackerel, whitefish, cod |
| turkey   | turkey                                                                |
| duck     | duck                                                                  |
| egg      | egg, eggs                                                             |
| dairy    | milk, whey, cheese, dairy, lactose                                    |
| wheat    | wheat, gluten                                                         |
| corn     | corn, maize                                                           |
| soy      | soy, soya, soybean                                                    |

A keyword matches when it appears as a whole word in an ingredient, ignoring case.

- [ ] **Step 1: Write the failing tests**

```ts
test('finds an allergen inside a longer ingredient', () => {
  expect(deriveAllergens(['Chicken Meal', 'brown rice'])).toEqual(['chicken']);
});
test('ignores case and sorts the result', () => {
  expect(deriveAllergens(['salmon oil', 'MAIZE'])).toEqual(['corn', 'fish']);
});
test('matches whole words only', () => {
  expect(deriveAllergens(['acorn squash', 'eggplant'])).toEqual([]);
});
test('returns each allergen once', () => {
  expect(deriveAllergens(['chicken', 'chicken fat', 'dried egg'])).toEqual(['chicken', 'egg']);
});
test('returns an empty list for no ingredients', () => {
  expect(deriveAllergens([])).toEqual([]);
});
```

- [ ] **Step 2: Run.** → FAIL.
- [ ] **Step 3: Implement `deriveAllergens`** with one word-boundary regular expression per keyword.
- [ ] **Step 4: Run.** → PASS.
- [ ] **Step 5: Commit.** `feat(core): derive allergens from ingredient lists`

### Task 4: Life stage and hard filters

**Files:**

- Create: `packages/core/src/life-stage.ts`, `packages/core/src/filter.ts`
- Modify: `packages/core/src/types.ts`
- Test: `packages/core/src/life-stage.test.ts`, `packages/core/src/filter.test.ts`

**Interfaces:**

- Produces: `lifeStageForAge(ageYears: number): 'puppy' | 'adult' | 'senior'`. Under 1 is puppy, 1 up to but not including 7 is adult, 7 and over is senior.
- Produces, in `types.ts`:

```ts
export type ExclusionReason =
  { code: 'SPECIES_MISMATCH' } | { code: 'CONTAINS_ALLERGEN'; allergens: Allergen[] };
export interface ExcludedFood {
  food: Food;
  excludedBecause: ExclusionReason;
}
```

- Produces: `filterFoods(profile: PetProfile, foods: Food[]): { eligible: Food[]; excluded: ExcludedFood[] }`. Species is checked first. `allergens` in the reason lists only the ones the profile and the food share, sorted.

- [ ] **Step 1: Write the failing tests**

```ts
test.each([
  [0, 'puppy'],
  [0.99, 'puppy'],
  [1, 'adult'],
  [6.9, 'adult'],
  [7, 'senior'],
  [30, 'senior'],
])('age %s is %s', (age, stage) => {
  expect(lifeStageForAge(age)).toBe(stage);
});

test('excludes another species before checking allergens', () => {
  const cat = makeFood({ species: 'cat', allergens: ['chicken'] });
  const { eligible, excluded } = filterFoods(makeProfile({ allergies: ['chicken'] }), [cat]);
  expect(eligible).toEqual([]);
  expect(excluded[0]?.excludedBecause).toEqual({ code: 'SPECIES_MISMATCH' });
});
test('reports only the shared allergens', () => {
  const food = makeFood({ allergens: ['chicken', 'egg'] });
  const { excluded } = filterFoods(makeProfile({ allergies: ['soy', 'egg', 'chicken'] }), [food]);
  expect(excluded[0]?.excludedBecause).toEqual({
    code: 'CONTAINS_ALLERGEN',
    allergens: ['chicken', 'egg'],
  });
});
test('keeps every same-species food when there are no allergies', () => {
  const foods = [makeFood({ id: 'a' }), makeFood({ id: 'b' })];
  expect(filterFoods(makeProfile({ allergies: [] }), foods).eligible).toHaveLength(2);
});
```

`makeFood` and `makeProfile` are test helpers in `packages/core/src/test-helpers.ts` that return a valid adult, large-breed, fish-based dog food and a matching profile, with overrides. The package exports them under `@petmatch/core/test-helpers` so the API and web tests in later tasks can use them.

- [ ] **Step 2: Run.** → FAIL.
- [ ] **Step 3: Implement both functions and the helpers.**
- [ ] **Step 4: Run.** → PASS.
- [ ] **Step 5: Commit.** `feat(core): add life stage and hard filters`

### Task 5: Scoring

**Files:**

- Create: `packages/core/src/scoring.ts`
- Modify: `packages/core/src/types.ts`
- Test: `packages/core/src/scoring.test.ts`

**Interfaces:**

- Consumes: `lifeStageForAge` from Task 4.
- Produces, in `types.ts`:

```ts
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
```

- Produces: `DEFAULT_WEIGHTS: Weights = { lifeStage: 40, breedSize: 25, preferredProtein: 25, grainFree: 10 }` and `scoreFood(profile: PetProfile, food: Food, weights?: Weights): { score: number; reasons: Reason[] }`.

Scoring rules:

| Criterion        | Applies when                             | Full points when                                                          |
| ---------------- | ---------------------------------------- | ------------------------------------------------------------------------- |
| lifeStage        | always                                   | `food.lifeStage` is `'all'` or equals `lifeStageForAge(profile.ageYears)` |
| breedSize        | always                                   | `food.breedSizes` includes `profile.breedSize`                            |
| preferredProtein | `profile.preferredProteins` is not empty | it includes `food.mainProtein`                                            |
| grainFree        | `profile.grainFree === 'yes'`            | `food.grainFree` is true                                                  |

A criterion that applies earns full points or zero, and adds one reason (match or mismatch). A criterion that does not apply adds no reason and is left out of the maximum. `score = Math.round(earned / applicableMaximum * 100)`. Reasons are returned in the table's order.

- [ ] **Step 1: Write the failing tests** (the base profile is age 4, large, prefers fish, grain-free no-preference; the base food is adult, large, fish, not grain-free)

```ts
test('a full match scores 100', () => {
  expect(scoreFood(makeProfile(), makeFood()).score).toBe(100);
});
test('a non-preferred protein scores 72', () => {
  // 65 / 90
  expect(scoreFood(makeProfile(), makeFood({ mainProtein: 'lamb' })).score).toBe(72);
});
test('a missed grain-free preference scores 87', () => {
  // 65 / 75
  const profile = makeProfile({ preferredProteins: [], grainFree: 'yes' });
  expect(scoreFood(profile, makeFood()).score).toBe(87);
});
test('a wrong life stage scores 38', () => {
  // 25 / 65
  const profile = makeProfile({ ageYears: 0.5, preferredProteins: [] });
  expect(scoreFood(profile, makeFood()).score).toBe(38);
});
test('an all-life-stages food counts as a life stage match', () => {
  const { reasons } = scoreFood(makeProfile({ ageYears: 9 }), makeFood({ lifeStage: 'all' }));
  expect(reasons[0]).toEqual({ code: 'LIFE_STAGE_MATCH', kind: 'positive' });
});
test('lists reasons in order and skips criteria that do not apply', () => {
  const { reasons } = scoreFood(makeProfile(), makeFood({ mainProtein: 'lamb' }));
  expect(reasons.map((r) => r.code)).toEqual([
    'LIFE_STAGE_MATCH',
    'BREED_SIZE_MATCH',
    'PROTEIN_NOT_PREFERRED',
  ]);
});
```

- [ ] **Step 2: Run.** → FAIL.
- [ ] **Step 3: Implement `scoreFood` and `DEFAULT_WEIGHTS`.**
- [ ] **Step 4: Run.** → PASS.
- [ ] **Step 5: Commit.** `feat(core): score foods against a profile`

### Task 6: `recommend` and the public API

**Files:**

- Create: `packages/core/src/recommend.ts`
- Modify: `packages/core/src/index.ts`, `packages/core/src/types.ts`
- Test: `packages/core/src/recommend.test.ts`

**Interfaces:**

- Consumes: `filterFoods` (Task 4), `scoreFood` (Task 5).
- Produces, in `types.ts`:

```ts
export interface Match {
  food: Food;
  score: number;
  reasons: Reason[];
}
export interface RecommendationResult {
  matches: Match[];
  excluded: ExcludedFood[];
}
```

- Produces: `recommend(profile: PetProfile, foods: Food[], weights?: Weights): RecommendationResult`. Matches are sorted by score, highest first; ties are ordered by `brand` then `name`, alphabetically.
- `index.ts` exports everything from `schemas`, `types`, `allergens`, `life-stage`, `filter`, `scoring`, `recommend`, plus `CORE_VERSION`.

- [ ] **Step 1: Write the failing tests**

```ts
test('sorts by score, highest first', () => {
  const foods = [makeFood({ id: 'lamb', mainProtein: 'lamb' }), makeFood({ id: 'fish' })];
  expect(recommend(makeProfile(), foods).matches.map((m) => m.food.id)).toEqual(['fish', 'lamb']);
});
test('breaks ties by brand then name', () => {
  const foods = [makeFood({ id: 'z', brand: 'Zeta' }), makeFood({ id: 'a', brand: 'Alpha' })];
  expect(recommend(makeProfile(), foods).matches.map((m) => m.food.id)).toEqual(['a', 'z']);
});
test('returns no matches when every food is excluded', () => {
  const foods = [
    makeFood({ id: 'a', allergens: ['fish'] }),
    makeFood({ id: 'b', allergens: ['fish'] }),
  ];
  const result = recommend(makeProfile({ allergies: ['fish'] }), foods);
  expect(result.matches).toEqual([]);
  expect(result.excluded).toHaveLength(2);
});
test('handles an empty catalog', () => {
  expect(recommend(makeProfile(), [])).toEqual({ matches: [], excluded: [] });
});
```

- [ ] **Step 2: Run.** → FAIL.
- [ ] **Step 3: Implement `recommend` and the exports.**
- [ ] **Step 4: Run all checks.** `npm run lint && npm run typecheck && npm test` → PASS.
- [ ] **Step 5: Commit, merge, tag.** `feat(core): add recommend and public exports`, then tag `v0.2.0`.

---

## Milestone M2 — Catalog and API

### Task 7: Catalog file and loader

**Files:**

- Create: `apps/api/package.json`, `apps/api/tsconfig.json`, `apps/api/data/foods.seed.json`, `apps/api/src/catalog/load-catalog.ts`
- Test: `apps/api/src/catalog/load-catalog.test.ts`

**Interfaces:**

- Consumes: `foodSeedSchema`, `deriveAllergens`, `Food` from `@petmatch/core`.
- Produces: `loadCatalog(filePath: string): Promise<Food[]>`. It reads the JSON array, validates each row with `foodSeedSchema`, sets `allergens` with `deriveAllergens(row.ingredients)`, and throws an `Error` naming the row's `id` when a row is invalid or an `id` repeats.

- [ ] **Step 1: Create `foods.seed.json` with 5 sample dog foods** covering three proteins, two breed sizes and two life stages. `imageUrl` is `null`.
- [ ] **Step 2: Write the failing tests**

```ts
test('loads the seed file and derives allergens', async () => {
  const foods = await loadCatalog(SEED_PATH);
  expect(foods.length).toBeGreaterThanOrEqual(5);
  for (const food of foods) expect(food.allergens).toEqual(deriveAllergens(food.ingredients));
});
test('rejects a row with a missing field and names its id', async () => {
  await expect(loadCatalog(fixture('missing-brand.json'))).rejects.toThrow(/bad-row/);
});
test('rejects duplicate ids', async () => {
  await expect(loadCatalog(fixture('duplicate-ids.json'))).rejects.toThrow(/duplicate/i);
});
```

- [ ] **Step 3: Run.** `npm test -w @petmatch/api` → FAIL.
- [ ] **Step 4: Implement `loadCatalog`.**
- [ ] **Step 5: Run.** → PASS.
- [ ] **Step 6: Commit.** `feat(api): add catalog seed file and loader`

### Task 8: Database

**Files:**

- Create: `apps/api/src/db/schema.ts`, `apps/api/src/db/client.ts`, `apps/api/src/db/seed.ts`, `apps/api/src/db/food-repository.ts`, `apps/api/drizzle.config.ts`, `apps/api/drizzle/` (generated)
- Test: `apps/api/src/db/food-repository.test.ts`

**Interfaces:**

- Produces: table `foods` with one column per `Food` field; `breedSizes`, `ingredients` and `allergens` are stored as JSON text.
- Produces: `createDb(url: string): Promise<Db>` (opens the database and applies migrations from `apps/api/drizzle`), `seedFoods(db: Db, foods: Food[]): Promise<void>` (replaces all rows in one transaction), `listFoods(db: Db): Promise<Food[]>` (ordered by `brand`, then `name`).

- [ ] **Step 1: Write the failing tests** against `createDb(':memory:')`

```ts
test('returns seeded foods with arrays intact', async () => {
  const db = await createDb(':memory:');
  const foods = [makeFood({ id: 'a', brand: 'Alpha' }), makeFood({ id: 'b', brand: 'Beta' })];
  await seedFoods(db, foods);
  expect(await listFoods(db)).toEqual(foods);
});
test('seeding twice does not duplicate rows', async () => {
  const db = await createDb(':memory:');
  const foods = [makeFood({ id: 'a' })];
  await seedFoods(db, foods);
  await seedFoods(db, foods);
  expect(await listFoods(db)).toHaveLength(1);
});
```

- [ ] **Step 2: Run.** → FAIL.
- [ ] **Step 3: Write the schema, generate the migration** (`npx drizzle-kit generate`), **and implement the three functions.**
- [ ] **Step 4: Run.** → PASS.
- [ ] **Step 5: Commit.** `feat(api): add SQLite catalog storage`

### Task 9: HTTP API

**Files:**

- Create: `apps/api/src/env.ts`, `apps/api/src/errors.ts`, `apps/api/src/app.ts`, `apps/api/src/server.ts`, `apps/api/.env.example`
- Test: `apps/api/src/app.test.ts`

**Interfaces:**

- Consumes: `petProfileSchema`, `recommend`, `Food` from `@petmatch/core`; `createDb`, `seedFoods`, `listFoods` (Task 8); `loadCatalog` (Task 7).
- Produces: `createApp(deps: { listFoods: () => Promise<Food[]>; webOrigin: string }): Express`.
- Produces: `AppError` with `statusCode: number` and `code: string`.
- Environment: `PORT` (default `3000`), `WEB_ORIGIN` (default `http://localhost:5173`), `DATABASE_URL` (default `file:./data/petmatch.db`), validated with Zod in `env.ts`.
- Endpoints: `GET /health` → `{ status: 'ok' }`; `GET /api/foods` → `Food[]`; `POST /api/recommendations` with a `PetProfile` body → `RecommendationResult`.
- Every error response is `{ error: { code, message } }`. Codes: `VALIDATION_ERROR` (400), `INVALID_JSON` (400), `NOT_FOUND` (404), `INTERNAL_ERROR` (500). A 500 never includes a stack trace or the original message.
- `server.ts` loads the catalog, creates the database, seeds it and listens. CORS allows only `webOrigin`. The JSON body limit is `10kb`.

- [ ] **Step 1: Write the failing tests** with Supertest and an in-memory `listFoods`

```ts
test('GET /health', async () => {
  const res = await request(app).get('/health');
  expect(res.status).toBe(200);
  expect(res.body).toEqual({ status: 'ok' });
});
test('GET /api/foods returns the catalog', async () => {
  expect((await request(app).get('/api/foods')).body).toHaveLength(2);
});
test('POST /api/recommendations returns matches and excluded foods', async () => {
  const res = await request(app).post('/api/recommendations').send(validProfile);
  expect(res.status).toBe(200);
  expect(res.body).toEqual({ matches: expect.any(Array), excluded: expect.any(Array) });
});
test.each([{ ageYears: -1 }, { ageYears: 31 }, { ageYears: '4' }, { name: '' }])(
  'rejects %o with 400',
  async (override) => {
    const res = await request(app)
      .post('/api/recommendations')
      .send({ ...validProfile, ...override });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  },
);
test('rejects malformed JSON', async () => {
  const res = await request(app)
    .post('/api/recommendations')
    .set('Content-Type', 'application/json')
    .send('{ not json');
  expect(res.body.error.code).toBe('INVALID_JSON');
});
test('unknown route returns NOT_FOUND', async () => {
  expect((await request(app).get('/nope')).body.error.code).toBe('NOT_FOUND');
});
test('a failing dependency returns INTERNAL_ERROR without details', async () => {
  const broken = createApp({
    listFoods: () => Promise.reject(new Error('db password')),
    webOrigin: '*',
  });
  const res = await request(broken).get('/api/foods');
  expect(res.status).toBe(500);
  expect(JSON.stringify(res.body)).not.toContain('db password');
});
```

- [ ] **Step 2: Run.** → FAIL.
- [ ] **Step 3: Implement `env.ts`, `errors.ts`, `app.ts` and `server.ts`.**
- [ ] **Step 4: Run.** → PASS.
- [ ] **Step 5: Start the server and check by hand.** `npm run dev -w @petmatch/api`, then `curl http://localhost:3000/health` → `{"status":"ok"}`.
- [ ] **Step 6: Commit.** `feat(api): add health, foods and recommendations endpoints`

### Task 10: Fill the catalog

**Files:**

- Modify: `apps/api/data/foods.seed.json`
- Test: `apps/api/src/catalog/catalog-content.test.ts`

**Interfaces:**

- Consumes: `loadCatalog` (Task 7), `recommend` from `@petmatch/core`.

Data-entry rules: 30–40 dry dog foods sold in Israel. `ingredients` is copied from the manufacturer's published list, in English, one ingredient per item. `buyUrl` is a price-comparison search URL for the product; open each one in a browser before saving it. `imageUrl` is `null`.

- [ ] **Step 1: Write the failing tests**

```ts
test('has 30 to 40 foods', async () => {
  const foods = await loadCatalog(SEED_PATH);
  expect(foods.length).toBeGreaterThanOrEqual(30);
  expect(foods.length).toBeLessThanOrEqual(40);
});
test.each(['small', 'medium', 'large'] as const)(
  'has at least 5 foods for %s breeds',
  async (size) => {
    const foods = await loadCatalog(SEED_PATH);
    expect(foods.filter((f) => f.breedSizes.includes(size)).length).toBeGreaterThanOrEqual(5);
  },
);
test.each([0.5, 4, 9])(
  'a dog aged %s with no restrictions gets at least 3 matches of 60 or more',
  async (ageYears) => {
    const foods = await loadCatalog(SEED_PATH);
    const profile = makeProfile({ ageYears, allergies: [], preferredProteins: [] });
    expect(
      recommend(profile, foods).matches.filter((m) => m.score >= 60).length,
    ).toBeGreaterThanOrEqual(3);
  },
);
```

- [ ] **Step 2: Run.** → FAIL, only 5 foods.
- [ ] **Step 3: Enter the foods.**
- [ ] **Step 4: Run.** → PASS.
- [ ] **Step 5: Commit, merge, tag.** `feat(api): fill the catalog`, then tag `v0.3.0`.

---

## Milestone M3 — Web app

### Task 11: Web scaffold and layout

**Files:**

- Create: `apps/web/` (Vite `react-ts` template), `apps/web/src/i18n/he.ts`, `apps/web/src/layout/Sidebar.tsx`, `apps/web/src/App.tsx`, `apps/web/src/index.css`, `apps/web/.env.example`
- Test: `apps/web/src/App.test.tsx`

**Interfaces:**

- Produces: `he`, a typed object of every UI string. Later tasks add keys to it; no component contains a Hebrew literal.
- Produces: `VITE_API_URL` (default `http://localhost:3000`).
- Source to port: `C:\Users\himan\projects\PetMatch\old\petmatch\petmatch-client\client\src\` (`App.jsx`, `components/Sidebar/*`, `index.css`). Keep the look. Replace inline `style` objects with Tailwind classes. Define the custom tokens the old components use (`brand-blue`, `match-green`, `match-bg`, `shadow-card`, `shadow-premium`) in `index.css` under `@theme`. Remove the hard-coded user name, pet name and breed.

- [ ] **Step 1: Scaffold the app, add Tailwind 4, Vitest, jsdom and Testing Library.**
- [ ] **Step 2: Write the failing test**

```tsx
test('renders the app name and a right-to-left layout', () => {
  render(<App />);
  expect(screen.getByRole('heading', { name: 'PetMatch' })).toBeInTheDocument();
  expect(document.querySelector('[dir="rtl"]')).not.toBeNull();
});
```

- [ ] **Step 3: Run.** `npm test -w @petmatch/web` → FAIL.
- [ ] **Step 4: Port `Sidebar` and the page shell to TypeScript.**
- [ ] **Step 5: Run.** → PASS. Open `npm run dev -w @petmatch/web` and compare with the old screen by eye.
- [ ] **Step 6: Commit.** `feat(web): scaffold app and port layout`

### Task 12: API client and profile storage

**Files:**

- Create: `apps/web/src/api/client.ts`, `apps/web/src/profile/storage.ts`
- Test: `apps/web/src/api/client.test.ts`, `apps/web/src/profile/storage.test.ts`

**Interfaces:**

- Consumes: `PetProfile`, `RecommendationResult`, `petProfileSchema` from `@petmatch/core`.
- Produces: `fetchRecommendations(profile: PetProfile, signal?: AbortSignal): Promise<RecommendationResult>` and `class ApiError extends Error { code: string }`. A non-2xx response throws `ApiError` with the server's `error.code`; a network failure throws `ApiError` with code `NETWORK_ERROR`.
- Produces: `PROFILE_STORAGE_KEY = 'petmatch.profile.v1'`, `loadProfile(): PetProfile | null`, `saveProfile(profile: PetProfile): void`. `loadProfile` returns `null` when the key is missing, the value is not JSON, the value fails `petProfileSchema`, or storage throws.

- [ ] **Step 1: Write the failing tests**

```ts
test('posts the profile and returns the result', async () => {
  fetchMock.mockResolvedValue(jsonResponse(200, { matches: [], excluded: [] }));
  await expect(fetchRecommendations(profile)).resolves.toEqual({ matches: [], excluded: [] });
  expect(fetchMock).toHaveBeenCalledWith(
    expect.stringMatching(/\/api\/recommendations$/),
    expect.objectContaining({ method: 'POST' }),
  );
});
test('throws ApiError with the server code', async () => {
  fetchMock.mockResolvedValue(
    jsonResponse(400, { error: { code: 'VALIDATION_ERROR', message: 'x' } }),
  );
  await expect(fetchRecommendations(profile)).rejects.toMatchObject({ code: 'VALIDATION_ERROR' });
});
test('throws NETWORK_ERROR when fetch rejects', async () => {
  fetchMock.mockRejectedValue(new TypeError('failed'));
  await expect(fetchRecommendations(profile)).rejects.toMatchObject({ code: 'NETWORK_ERROR' });
});

test('round-trips a profile', () => {
  saveProfile(profile);
  expect(loadProfile()).toEqual(profile);
});
test.each([
  '{ not json',
  JSON.stringify({ name: 'x' }),
  JSON.stringify({ ...profile, ageYears: 99 }),
])('ignores a bad stored value: %s', (raw) => {
  localStorage.setItem(PROFILE_STORAGE_KEY, raw);
  expect(loadProfile()).toBeNull();
});
test('returns null when nothing is stored', () => {
  expect(loadProfile()).toBeNull();
});
```

- [ ] **Step 2: Run.** → FAIL.
- [ ] **Step 3: Implement both modules.**
- [ ] **Step 4: Run.** → PASS.
- [ ] **Step 5: Commit.** `feat(web): add API client and profile storage`

### Task 13: Profile form

**Files:**

- Create: `apps/web/src/profile/ProfileForm.tsx`
- Modify: `apps/web/src/i18n/he.ts`
- Test: `apps/web/src/profile/ProfileForm.test.tsx`

**Interfaces:**

- Consumes: `petProfileSchema`, `PetProfile`, `ALLERGENS`, `PROTEINS`, `BREED_SIZES` from `@petmatch/core`.
- Produces: `ProfileForm(props: { initial: PetProfile | null; onSubmit: (profile: PetProfile) => void })`.
- Fields: name (text), age in years (number, step 0.5), breed size (radio), allergies (checkboxes), preferred proteins (checkboxes), grain-free (radio: yes / no preference). `species` is always `'dog'` and is not shown. Every input has a label. Validation runs on submit with `petProfileSchema`; errors appear next to the field and `onSubmit` is not called.

- [ ] **Step 1: Write the failing tests**

```tsx
test('submits the entered profile', async () => {
  const onSubmit = vi.fn();
  render(<ProfileForm initial={null} onSubmit={onSubmit} />);
  await user.type(screen.getByLabelText(he.form.name), 'Miley');
  await user.type(screen.getByLabelText(he.form.age), '4');
  await user.click(screen.getByLabelText(he.breedSize.large));
  await user.click(screen.getByLabelText(he.allergen.chicken));
  await user.click(screen.getByRole('button', { name: he.form.submit }));
  expect(onSubmit).toHaveBeenCalledWith({
    name: 'Miley',
    species: 'dog',
    ageYears: 4,
    breedSize: 'large',
    allergies: ['chicken'],
    preferredProteins: [],
    grainFree: 'no-preference',
  });
});
test('shows an error and does not submit without a name', async () => {
  const onSubmit = vi.fn();
  render(<ProfileForm initial={null} onSubmit={onSubmit} />);
  await user.click(screen.getByRole('button', { name: he.form.submit }));
  expect(screen.getByText(he.form.errors.name)).toBeInTheDocument();
  expect(onSubmit).not.toHaveBeenCalled();
});
test('prefills from the initial profile', () => {
  render(<ProfileForm initial={profile} onSubmit={vi.fn()} />);
  expect(screen.getByLabelText(he.form.name)).toHaveValue(profile.name);
});
```

- [ ] **Step 2: Run.** → FAIL.
- [ ] **Step 3: Implement the form and add its strings to `he.ts`.**
- [ ] **Step 4: Run.** → PASS.
- [ ] **Step 5: Commit.** `feat(web): add pet profile form`

### Task 14: Results page and app flow

**Files:**

- Create: `apps/web/src/results/FoodCard.tsx`, `apps/web/src/results/ExcludedList.tsx`, `apps/web/src/results/ResultsPage.tsx`
- Modify: `apps/web/src/App.tsx`, `apps/web/src/i18n/he.ts`
- Test: `apps/web/src/results/ResultsPage.test.tsx`, `apps/web/src/App.test.tsx`

**Interfaces:**

- Consumes: `fetchRecommendations`, `ApiError` (Task 12); `loadProfile`, `saveProfile` (Task 12); `ProfileForm` (Task 13); `Match`, `ExcludedFood`, `RecommendationResult`, `ReasonCode` from `@petmatch/core`.
- Produces: `ResultsPage(props: { profile: PetProfile; result: RecommendationResult; onEdit: () => void })`, `FoodCard(props: { match: Match })`, `ExcludedList(props: { excluded: ExcludedFood[] })`.
- `he.reason` has one string per `ReasonCode`. `he.exclusion` has one string per exclusion code; the allergen one lists the allergen names.
- `FoodCard` is ported from the old `ProductCard.jsx`. It shows brand, name, the computed score as `NN%`, the reasons with a plus or minus marker, and a "where to buy" link that opens `buyUrl` in a new tab with `rel="noopener noreferrer"`.
- `ExcludedList` is collapsed by default and shows the count.
- `App` has four states: `form`, `loading`, `results`, `error`. On load it prefills the form from `loadProfile()`. On submit it saves the profile and fetches. The error state shows `he.error.message` and a retry button that fetches again with the same profile.

- [ ] **Step 1: Write the failing tests**

```tsx
test('shows the computed score and the reasons', () => {
  render(
    <ResultsPage
      profile={profile}
      result={{ matches: [match(92)], excluded: [] }}
      onEdit={vi.fn()}
    />,
  );
  expect(screen.getByText('92%')).toBeInTheDocument();
  expect(screen.getByText(he.reason.LIFE_STAGE_MATCH)).toBeInTheDocument();
});
test('shows an empty state when nothing matches', () => {
  render(
    <ResultsPage
      profile={profile}
      result={{ matches: [], excluded: [excludedFood] }}
      onEdit={vi.fn()}
    />,
  );
  expect(screen.getByText(he.results.empty)).toBeInTheDocument();
});
test('always shows the disclaimer', () => {
  render(<ResultsPage profile={profile} result={{ matches: [], excluded: [] }} onEdit={vi.fn()} />);
  expect(screen.getByText(he.disclaimer)).toBeInTheDocument();
});
test('the buy link opens safely in a new tab', () => {
  render(<FoodCard match={match(92)} />);
  expect(screen.getByRole('link', { name: he.results.buy })).toHaveAttribute(
    'rel',
    'noopener noreferrer',
  );
});

test('shows loading, then results', async () => {
  fetchRecommendationsMock.mockResolvedValue({ matches: [match(92)], excluded: [] });
  render(<App />);
  await fillAndSubmitForm();
  expect(screen.getByText(he.loading)).toBeInTheDocument();
  expect(await screen.findByText('92%')).toBeInTheDocument();
});
test('shows an error with a retry button that fetches again', async () => {
  fetchRecommendationsMock.mockRejectedValueOnce(new ApiError('NETWORK_ERROR'));
  fetchRecommendationsMock.mockResolvedValueOnce({ matches: [match(92)], excluded: [] });
  render(<App />);
  await fillAndSubmitForm();
  await user.click(await screen.findByRole('button', { name: he.error.retry }));
  expect(await screen.findByText('92%')).toBeInTheDocument();
});
```

- [ ] **Step 2: Run.** → FAIL.
- [ ] **Step 3: Implement the three components and the app flow.**
- [ ] **Step 4: Run all checks.** `npm run lint && npm run typecheck && npm test` → PASS.
- [ ] **Step 5: Check end to end by hand.** Run the API and the web app, enter a profile with a chicken allergy, and confirm that chicken foods appear only in the excluded list.
- [ ] **Step 6: Commit, merge, tag.** `feat(web): add results page and app flow`, then tag `v0.4.0`.

---

## Milestone M4 — Polish and deploy

### Task 15: Deploy, smoke test and README

**Files:**

- Create: `scripts/smoke.mjs`, `docs/decisions.md`
- Modify: `README.md`, `apps/api/.env.example`, `apps/web/.env.example`

**Interfaces:**

- Consumes: the deployed API URL and web URL.
- Produces: `node scripts/smoke.mjs <apiUrl>`. It exits 0 when `GET /health` returns `{ status: 'ok' }` and `POST /api/recommendations` returns at least 3 matches for the profile `{ name: 'Smoke', species: 'dog', ageYears: 4, breedSize: 'medium', allergies: [], preferredProteins: [], grainFree: 'no-preference' }`. Otherwise it prints the reason and exits 1.

- [ ] **Step 1: Choose the hosts.** Read the current free-tier terms of two static hosts and two Node hosts. Record the choice, the date and the reason in `docs/decisions.md`. The API host must allow a build step and environment variables.
- [ ] **Step 2: Write `scripts/smoke.mjs`** and run it against the local API. Expected: exit code 0.
- [ ] **Step 3: Deploy the API** with `WEB_ORIGIN` set to the final web URL. Run the smoke script against it. Expected: exit code 0.
- [ ] **Step 4: Deploy the web app** with `VITE_API_URL` set to the API URL.
- [ ] **Step 5: Check the live site by hand:** complete a profile in under a minute, get at least three results, open a buy link, reload and confirm the form is prefilled. Repeat on a phone-width window.
- [ ] **Step 6: Write the README:** what the app does, a screenshot of the form and of the results, the live URL, an architecture diagram of the three packages, how to run and test locally, the disclaimer, and what is planned next.
- [ ] **Step 7: Commit, merge, tag.** `docs: add README and deployment notes`, then tag `v1.0.0`.

---

## After v1.0.0

M5 (AI explanation) and M6 (affiliate links and analytics) each get their own design and plan once v1 is live.
