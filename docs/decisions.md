# Decisions

## 2026-11-17: v1 is released locally; deployment is deferred

**Context.** Task 15 of the plan deploys the API and the web app to free hosts so the project has a public URL. The
owner does not need a public URL now and runs the app on their own computer.

**Decision.** v1.0.0 is tagged without a deployment. The app runs locally with `npm run dev`. No hosting account was
opened and nothing was published. The README says so.

**Consequences.**

- The design's goal of "a public URL" is not met yet. The project is complete and demonstrable locally (README
  screenshots, tests, CI), but a reviewer cannot open it from a link.
- Deployment problems that only appear on a host (CORS with two real origins, environment variables, building on a clean
  machine, a cold start) have not been exercised.

**What deploying would take, when wanted.**

- Static web app: build `apps/web` with `VITE_API_URL` set to the API's URL, and publish `apps/web/dist` on any static host.
- API: run `apps/api` (`npm start`) on a Node host with `WEB_ORIGIN` set to the web app's URL (CORS allows only that
  origin). The catalog is loaded from `apps/api/data/foods.seed.json` into SQLite on every start, so a host with a disk
  that is erased on restart is fine.
- Free tiers research (2026-11-17, third-party summaries, not verified on the providers' sites): Cloudflare Pages for
  the static site (500 builds a month, no bandwidth charge), Render for the API (750 free hours a month, but a free
  service is spun down after 15 minutes without traffic and takes about a minute to wake). The web app already shows
  a loading state and an error with a retry button, so a sleeping API is not a blank page. Re-read the providers' current
  terms and confirm no payment card is needed before signing up.
- After deploying, check it with `npm run smoke -- <apiUrl>`.

## 2026-11-17: the local API port defaults to 3100 under `npm run dev`

Port 3000, the API's own default, is often taken by other local projects. `npm run dev` therefore starts the API on
3100 and points the web app at it. `PORT` overrides it.
