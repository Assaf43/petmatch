# PetMatch v2 — Design

- **Date:** 2026-11-17
- **Status:** Draft, waiting for approval
- **Supersedes:** `PROJECT.md` (May 2026). That document described a much larger product and is kept only as history.
- **Next document:** `docs/plan.md`, the step-by-step implementation plan, written after this design is approved.

Items marked **(proposal)** are calls made while writing this document. They were not discussed and are open to change.

---

## 1. Intent

PetMatch v2 is a small web app that answers one question: _which food suits this specific pet, and why?_

The owner fills in a short pet profile and gets a ranked list of foods. Every result shows the reasons it fits or does not fit, and a link to buy it.

**Why this project exists**

1. **Portfolio.** A finished, deployed, well-kept Git repository that shows full-stack work in React, Node and TypeScript.
2. **Learning.** Hands-on practice with React, Node and TypeScript beyond the basics.
3. **Income, maybe.** If the result is good, affiliate links can be added later. v1 does not depend on it.

## 2. Goals, non-goals, anti-goals

**Goals**

- A visitor completes a profile in under a minute and sees at least three ranked foods with reasons.
- The app is live at a public URL and the demo does not break on its own.
- The repository reads well to a reviewer: clear history, tests, CI, a README with screenshots.

**Non-goals for v1**

- User accounts, login, email.
- Live price comparison and any scraping.
- Cross-border import, customs and currency calculation.
- Premium tier, alerts, vet sharing, notifications.
- AI chat agent (planned as an optional later milestone).

**Anti-goals** (the project has failed if any of these happen)

- A public demo that shows errors or empty results.
- A long setup phase with nothing a visitor can use.
- Advice that reads as veterinary guidance.

## 3. What the visitor sees

```
[ Step 1: Pet profile ]                [ Step 2: Matches for Miley ]

 Name        [ Miley            ]      1. Brand A Adult Salmon        92% match
 Age         [ 4 years          ]         + Adult formula fits age 4
 Breed size  ( ) S  (•) L  ( ) XL         + Main protein: fish (preferred)
 Allergies   [x] Chicken [ ] Beef         + No chicken ingredients
 Prefers     [x] Fish   [ ] Lamb          - Not grain-free (no preference set)
 Grain-free  ( ) Yes (•) No pref.         [ Where to buy ]

          [ Find matches ]             2. Brand B Large Breed Lamb    81% match
                                          ...
                                       Excluded: 6 foods contain chicken  [show]

                                       Not veterinary advice. Ask your vet
                                       about medical conditions.
```

- The match score is computed, never hard-coded.
- Excluded foods are listed with the reason, so the visitor can see the filter working.
- UI text is Hebrew, right-to-left, as in the existing client. Code, commits and docs are English. **(proposal)**

## 4. Approaches considered

| Approach                                          | What it is                                                                          | Trade-off                                                                                                                    | Decision                 |
| ------------------------------------------------- | ----------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- | ------------------------ |
| **A. Matching engine on a small curated catalog** | Profile in, ranked and explained foods out. Catalog of 30–40 foods entered by hand. | Finishable and stable. No live prices.                                                                                       | **Chosen**               |
| B. Price aggregator over Israeli stores           | Scrape store sites and compare prices (the direction of the May code).              | Technically interesting, but scrapers break when a store changes its site, there is legal exposure, and Zap already does it. | Dropped                  |
| C. AI chat recommender                            | A model recommends food in conversation.                                            | In demand, but costs money per call and shows less of the author's own code.                                                 | Later, as an add-on to A |

A was chosen because the main goals are portfolio and learning, and both need a project that gets finished and stays working.

## 5. Scope of v1

- **Species:** dogs only. The data model carries a `species` field so cats can be added without a redesign. **(proposal)**
- **Profile fields:** name, age, breed size, allergies, preferred proteins, grain-free preference.
- **Catalog:** 30–40 dry dog foods sold in Israel, entered by hand from the manufacturers' published ingredient lists.
- **Profile storage:** in the browser (`localStorage`). Nothing personal is stored on the server, so v1 needs no accounts and no privacy policy work. **(proposal)**
- **Buy link:** each food links out to a price-comparison search for that product. No prices are stored. **(proposal)**
- **Kept from the original plan:** food only, no medical advice, a disclaimer on every results page.

## 6. Architecture and stack

One repository, three packages:

```
petmatch/
├── apps/
│   ├── web/        React + Vite + TypeScript + Tailwind
│   └── api/        Node + Express + TypeScript + Zod
├── packages/
│   └── core/       Matching engine and shared types (no framework code)
├── docs/
│   ├── design.md   this file
│   └── plan.md     implementation plan
├── .github/workflows/ci.yml
└── README.md
```

- **TypeScript everywhere, `strict: true`.** It is close to C#, and it is what reviewers look for.
- **`packages/core` holds the matching logic as pure functions.** It has no database or HTTP code, so it is easy to unit test, and it is the part of the repository most worth showing.
- **Database: SQLite with Drizzle.** The catalog is read-only and seeded from a file, so there is no database server to install or host. Postgres can replace it later without touching `core`. **(proposal)**
- **Tests:** Vitest. `core` is covered thoroughly; the API gets a few request-level tests.
- **CI:** GitHub Actions runs lint, type check and tests on every push.
- **Hosting:** static web app on a free static host, API on a free-tier Node host. The providers are chosen in the plan after checking current free-tier terms. **(proposal)**
- **Removed from the original stack:** Fastify, Redis, BullMQ, Lucia, pgvector, R2, Resend, Puppeteer. None is needed for v1.

## 7. Data model

**Food** (catalog row)

| Field                | Type                                                                     | Notes                                          |
| -------------------- | ------------------------------------------------------------------------ | ---------------------------------------------- |
| `id`                 | string                                                                   |                                                |
| `brand`, `name`      | string                                                                   |                                                |
| `species`            | `dog`                                                                    | `cat` reserved                                 |
| `lifeStage`          | `puppy` \| `adult` \| `senior` \| `all`                                  |                                                |
| `breedSizes`         | list of `small` \| `medium` \| `large`                                   |                                                |
| `mainProtein`        | `chicken` \| `beef` \| `lamb` \| `fish` \| `turkey` \| `duck` \| `other` |                                                |
| `allergens`          | list of allergen tags                                                    | derived from the ingredient list at entry time |
| `grainFree`          | boolean                                                                  |                                                |
| `imageUrl`, `buyUrl` | string                                                                   |                                                |

**PetProfile** (request body, never stored on the server)

`name`, `species`, `ageYears`, `breedSize`, `allergies[]`, `preferredProteins[]`, `grainFree: 'yes' | 'no-preference'`

## 8. Matching engine

Two stages, both in `packages/core`:

1. **Hard filters.** A food is excluded if the species differs or if it contains any allergen in the profile. Each exclusion records its reason.
2. **Scoring.** Each remaining food gets points for life-stage fit, breed-size fit, preferred protein and grain-free preference. Points are normalised to a 0–100 score.

Output per food: `score`, `reasons[]` (each marked positive or negative), and for excluded foods `excludedBecause`.

The weights live in one configuration object so they can be tuned and tested. Exact weights are left to the builder.

## 9. API

| Method | Path                   | Purpose                                                        |
| ------ | ---------------------- | -------------------------------------------------------------- |
| `GET`  | `/health`              | Liveness check                                                 |
| `GET`  | `/api/foods`           | Full catalog                                                   |
| `POST` | `/api/recommendations` | Body: `PetProfile`. Returns ranked matches and excluded foods. |

All input is validated with Zod. Errors return `{ error: { code, message } }`.

## 10. Git and repository practice

- A **new** repository. The May folders (`PetMatch_old`, `petmatch`) are moved to an archive outside it, not deleted. Their `.env` files must never be committed.
- `main` is always deployable. Work happens on short feature branches merged by pull request, even when working alone, so the history shows the workflow.
- Conventional Commits (`feat:`, `fix:`, `chore:`, `docs:`, `test:`, `refactor:`), as in the original plan.
- A version tag at the end of each milestone.
- `docs/design.md` and `docs/plan.md` live in the repository. Business notes about income stay out of it.

## 11. Milestones

Each milestone ends with something that runs and a tag.

| #   | Milestone                                 | Done when                                                                 |
| --- | ----------------------------------------- | ------------------------------------------------------------------------- |
| M0  | Repository and tooling                    | Workspaces, TypeScript, lint, CI green on an empty test                   |
| M1  | Matching engine                           | `core` returns ranked, explained results for sample data; unit tests pass |
| M2  | Catalog and API                           | 30–40 foods seeded; both endpoints return real results                    |
| M3  | Web app                                   | Profile form and results page work against the API                        |
| M4  | Polish and deploy                         | Empty and error states, disclaimer, README with screenshots, public URL   |
| M5  | _Optional:_ AI explanation                | A short model-written summary per recommendation                          |
| M6  | _Optional:_ affiliate links and analytics | Only if the project is worth pursuing for income                          |

v1 is M0–M4.

## 12. Reused from the May code

- **Kept:** the client layout (`App.jsx`, `Sidebar`, `ProductCard`) as the visual starting point, converted to TypeScript and wired to real data.
- **Kept as rules:** naming conventions, strict TypeScript, no `any`, Zod on external input, `Error` instances only.
- **Not carried over:** the Fastify skeleton, the Express scraper server, Puppeteer.

## 13. Left to the builder

- Scoring weights and the exact wording of reasons.
- Component breakdown and state handling inside the web app.
- Choice of hosting providers.
- Which 30–40 foods go into the catalog.

## 14. Known risks

| Risk                                            | Response                                                                          |
| ----------------------------------------------- | --------------------------------------------------------------------------------- |
| Catalog entry is tedious and stalls the project | Start M1 with 5 sample foods; fill the catalog in M2                              |
| Scope grows back toward the original plan       | Anything outside section 5 waits until M4 is tagged                               |
| Allergen tags entered wrongly                   | Tags are derived from the ingredient list by a tested function, not typed by hand |
| Results read as medical advice                  | Disclaimer on every results page; no health-condition fields in v1                |
