# Phase 6: Vercel Deployment — Context

**Gathered:** 2026-05-21
**Status:** Ready for planning
**Source:** Auto-discuss (session-wide "no clarifying questions" instruction). Synthesized from ROADMAP.md Phase 6, REQUIREMENTS.md DEPLOY-01..DEPLOY-04, Discussion.md §3 (env vars) + §8 (deployment checklist) + §9 (API auth), PROJECT.md (Vercel deployment decision), and current repo state probe.

<domain>
## Phase Boundary

Phase 6 ships v1.0 to production at a public Vercel URL with continuous deployment from `main`. The build is already production-ready (5 prior phases verified; `npm run build` passes cleanly with all data fetches working from localhost). Phase 6 is the **infrastructure phase** — the only one in the milestone that depends on actions outside this repository.

**In scope (Phase 6):**
- Pre-deploy hygiene audit (Claude-autonomous): confirm `.gitignore` excludes `.env` / `.env.local`, no API keys committed to history, `npm run build` exits 0, `dist/` not in repo
- Repo state preparation (Claude-autonomous if applicable): confirm `main` branch state, all commits pushed-ready
- Deployment runbook generation (Claude-autonomous): create a step-by-step DEPLOYMENT.md walking through Vercel project creation, env var setup, and first deploy verification
- README.md update (Claude-autonomous): add "Deploy your own" section referencing the runbook + the canonical production URL once known
- PROJECT.md update (Claude-autonomous): mark Vercel deployment decision as Validated (currently Pending)
- Vercel project linkage (USER ACTION): `vercel link` or import from GitHub via Vercel dashboard
- GitHub remote (USER ACTION if not yet set): `git remote add origin <github-url>` + initial `git push -u origin main`
- Environment variable in Vercel (USER ACTION): `VITE_NASA_API_KEY` set in Project → Settings → Environment Variables (Production + Preview scopes)
- Production CORS verification (USER ACTION): visit the production URL, open DevTools, confirm MAAS2, NOAA SWPC, and NASA DONKI all return 200s (no CORS errors)
- Smoke test of both tabs (USER ACTION): confirm Mars + Moon tabs render live data end-to-end from the deployed origin

**Out of scope (deferred to v2 / future milestones):**
- Custom domain (Vercel's `*.vercel.app` URL is sufficient for v1)
- Serverless proxy / Edge Function (only if `DEMO_KEY` rate limits hit — not building speculatively)
- Vercel Analytics integration (v2 polish)
- Preview deploy automation beyond the default Vercel GitHub integration
- Multi-environment promotion gates (staging → prod)
- GitHub Actions CI (Vercel handles build per push; redundant for v1)
- Lighthouse / Web Vitals monitoring (v2)
- Branch protection rules on `main` (governance for collaborators; not needed for single-developer v1)

**Carrying forward from prior phases:**
- Tech stack: Vite + React + Tailwind + TanStack Query (auto-detected by Vercel as a Vite project — no `vercel.json` needed)
- Build output: `dist/` (Vite default; Vercel auto-detects)
- Build command: `npm run build` (Vite default; Vercel auto-detects)
- Env var convention: `VITE_NASA_API_KEY` (Vite prefix exposes to client; acceptable for low-sensitivity NASA keys per CLAUDE.md / PROJECT.md)
- API surface: MAAS2 (no auth, CORS-open), NOAA SWPC (no auth, CORS-open), NASA DONKI (NASA key, CORS-open) — all confirmed CORS-open from localhost; production verification still required (DEPLOY-03)
- All env access goes through `src/utils/env.js` (no inline `import.meta.env` outside that module per Phase 4 D-20)

</domain>

<decisions>
## Implementation Decisions

### Deployment trigger — GitHub auto-deploy, not CLI push

- **D-01:** Production deploys are triggered by `git push origin main` (Vercel's GitHub app watches the `main` branch). Pre-prod previews are automatic for every other branch / pull request. This matches Discussion.md §8 (`Vercel auto-deploy on push to main confirmed`) and PROJECT.md (`Vercel deployment, Zero-config GitHub deploys`).
- **D-02:** No `vercel deploy --prod` CLI usage in the normal workflow. The Vercel CLI is used only for the initial `vercel link` step (or import via Vercel dashboard, which is equivalent).
- **D-03:** No `vercel.json` configuration file. Vercel auto-detects Vite (build command `npm run build`, output directory `dist/`, install command `npm install`). Adding a config file would be premature lock-in.

### Environment variables

- **D-04:** `VITE_NASA_API_KEY` is set in the Vercel dashboard under Project → Settings → Environment Variables. Scopes: **Production + Preview** (so PR previews can hit DONKI). Development scope is NOT set (local `.env` handles it).
- **D-05:** For v1 production, register a real NASA API key (free at api.nasa.gov, 1000 req/hr per IP) rather than shipping `DEMO_KEY` (30 req/hr — would hit limits with multi-user traffic). Document the registration step in DEPLOYMENT.md.
- **D-06:** `DEMO_KEY` remains the local development default via `src/utils/env.js` fallback. The `.env.example` file (already shipped in Phase 1) documents the convention.
- **D-07:** No other env vars are needed. MAAS2 and NOAA SWPC require no auth.

### GitHub remote

- **D-08:** The project must be pushed to a GitHub repository before Vercel can import it. If not already done, the user creates the GitHub repo and configures `git remote add origin <url>` + `git push -u origin main`. Claude does NOT run `git push` autonomously — pushing to a remote affects shared state and requires user authorization (per CLAUDE.md guardrails).
- **D-09:** Repo visibility (public vs private) is user's choice; Vercel supports both. Default recommendation: public (the educational/portfolio nature of the project benefits from being visible).

### Vercel project linkage

- **D-10:** Two equivalent paths — user picks based on preference:
  - **Path A (Dashboard import):** Visit vercel.com → "Add New Project" → select the GitHub repo → click Deploy. Vercel auto-detects Vite, creates the project, runs first build. Most users prefer this.
  - **Path B (CLI link):** `vercel login` → `vercel link` (in project root) → select team/scope → confirm name. Then `vercel --prod` once OR push to `main` to trigger first deploy via the GitHub integration.
- **D-11:** Either path is acceptable. The Vercel project name defaults to the repo name (`planetary-conditions`). Production URL will be `https://planetary-conditions.vercel.app` (or `-<random>` suffix if name is taken).

### CORS verification (DEPLOY-03)

- **D-12:** After first successful deploy, verify CORS from the deployed origin by:
  1. Opening the production URL in a browser
  2. Opening DevTools Network panel
  3. Switching to the Mars tab → confirming 1 successful `https://api.maas2.apollorion.com/` fetch
  4. Switching to the Moon tab → confirming 3 successful SWPC fetches (plasma, mag, Kp) and 3 successful DONKI fetches (CME, FLR, GST)
  5. Confirming NO `CORS policy: ...blocked...` errors in console
- **D-13:** If any source CORS-fails from the production origin (unlikely — all three are documented CORS-open public APIs), the fallback is a Vercel Edge Function proxy. **This is deferred until evidence of need** (per CLAUDE.md: "no backend proxy unless DEMO_KEY rate limits force it" — extends to CORS too).

### Pre-deploy hygiene (Claude-autonomous)

- **D-14:** Before recommending the user push to GitHub, Claude verifies:
  1. `.gitignore` excludes `.env`, `.env.local`, `.env.*.local` — already confirmed (lines exist in current `.gitignore`)
  2. `git log -p` contains no NASA API key values — verify with `git log -p | grep -iE "api[_-]?key.*=.*[a-zA-Z0-9]{8,}"` and confirm no real keys (only `DEMO_KEY` references which are public)
  3. `dist/` is gitignored — already confirmed
  4. `npm run build` exits 0 — verified at end of Phase 5
  5. `package.json` has a valid `build` script — verified
  6. No leftover Vite dev server processes (informational; user closes any local dev sessions before first push)
- **D-15:** If any pre-deploy check fails, Phase 6 STOPS and surfaces the issue. Do not advance to the user-action steps with hygiene issues.

### Deployment runbook (DEPLOYMENT.md)

- **D-16:** Create a new top-level `DEPLOYMENT.md` file (NOT inside `.planning/` since users will read this outside the GSD context). Sections:
  1. **Prerequisites:** Node.js installed; GitHub account; Vercel account (free tier); NASA API key registered (optional — DEMO_KEY works for dev)
  2. **First-time deployment** (5-7 numbered steps): create GitHub repo → push code → import in Vercel → set env var → wait for first build → verify production URL → smoke test
  3. **Subsequent deploys:** push to `main`; Vercel auto-deploys. Reference Vercel's dashboard for deploy history.
  4. **Preview deploys:** push to any non-main branch; Vercel creates a preview URL. Useful for PR review.
  5. **Troubleshooting:** common issues — env var typos, CORS errors (link to D-13 fallback), build failures (point at Vercel build logs).
- **D-17:** DEPLOYMENT.md is referenced from README.md ("Deploy your own → see DEPLOYMENT.md").

### README.md update

- **D-18:** README.md gets a new "Deployment" section with a 2-line summary + link to DEPLOYMENT.md. After the user provides the production URL, also add a "Live demo: <url>" line near the top.
- **D-19:** Do NOT add the production URL until the user confirms the deploy succeeded — placeholder text like `(coming soon)` is fine until then.

### PROJECT.md decision validation

- **D-20:** PROJECT.md's "Key Decisions" table currently marks "Vercel deployment" as "— Pending". After Phase 6 success, update to "✓ Good" with a date stamp and the production URL.

### Plan decomposition guidance

- **D-21:** Phase 6 splits into 2 sequential plans:

  **Plan 06-01 (Wave 1) — Pre-deploy hygiene + runbook (Claude-autonomous):**
  - Audit `.gitignore`, git history for committed secrets, `dist/` exclusion, build status (D-14)
  - Create `DEPLOYMENT.md` runbook with 5 sections (D-16)
  - Update README.md with Deployment section (D-18, D-19)
  - Mark plan complete; user proceeds to Plan 06-02 manually

  **Plan 06-02 (Wave 2) — User-action gates + verification (autonomous: false):**
  - **USER ACTION 1:** Create GitHub repo + push code (D-08)
  - **USER ACTION 2:** Import project in Vercel dashboard OR `vercel link` (D-10)
  - **USER ACTION 3:** Set `VITE_NASA_API_KEY` in Vercel dashboard (D-04, D-05) — registered NASA key recommended
  - **USER ACTION 4:** Wait for first build to complete in Vercel (autonomous: false — Claude waits for user confirmation with the production URL)
  - **USER ACTION 5:** Open production URL, verify CORS for all 6 fetches (D-12)
  - **USER ACTION 6:** Smoke test Mars + Moon tabs end-to-end
  - **Claude action after user confirms URL:** Update README.md "Live demo" line + PROJECT.md decision table (D-18 final, D-20)
  - **Claude action:** Mark DEPLOY-01..DEPLOY-04 complete in REQUIREMENTS.md

- **D-22:** Plan 06-02 MUST have `autonomous: false` because it contains checkpoint tasks where Claude waits for user input (Vercel URL, env var confirmation). This is the first checkpoint plan in the milestone — earlier phases were all autonomous.

### Claude's Discretion

- Whether to bundle Plans 06-01 + 06-02 into a single checkpoint plan vs keep them separate (recommend: separate, so the autonomous hygiene + runbook lands first as a clean diff before the user-gated deploy)
- Exact wording / format of DEPLOYMENT.md (recommend: copy patterns from other Vercel + Vite project READMEs the user has seen)
- Whether to verify the Vercel project name is available (`vercel inspect` or dashboard check) — recommend not, since name conflicts auto-resolve to a `-suffix` form
- Whether to add a "Deploy" button (Vercel/Netlify-style Markdown badge linking to the deploy import URL) in README — recommend yes, low-effort win for shareability

</decisions>

<specifics>
## Specific Ideas

- **Vercel auto-detection means zero config.** Vite is one of Vercel's first-class supported frameworks. The Project Settings page in the dashboard will already show:
  - Framework Preset: Vite
  - Build Command: `npm run build`
  - Output Directory: `dist`
  - Install Command: `npm install`
  - Development Command: `npm run dev`

- **NASA API key registration URL:** https://api.nasa.gov — single-page form, instant email delivery. Document this exact link in DEPLOYMENT.md.

- **Vercel "Deploy" button Markdown template:**
  ```markdown
  [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2F<USER>%2Fplanetary-conditions&env=VITE_NASA_API_KEY&envDescription=NASA%20API%20key%20for%20DONKI%20events&envLink=https%3A%2F%2Fapi.nasa.gov%2F)
  ```
  The `env=` and `envDescription=` query params prompt the cloner to set `VITE_NASA_API_KEY` during import — a meaningful quality-of-life touch for the "deploy your own" path.

- **Production URL placeholder pattern:** Use `https://planetary-conditions.vercel.app` as the expected default in DEPLOYMENT.md, with a note that the actual URL is shown in the Vercel dashboard after the first deploy and may differ if the name was taken.

- **Smoke test checklist for Plan 06-02:**
  - Mars tab: 8 DataCards render with values (not all em-dashes)
  - Moon tab Section 1: 4 lunar DataCards render with phase data
  - Moon tab Section 2: 4 SWPC DataCards + Radiation Risk StatusBadge render
  - Moon tab Section 3: AlertCard list shows recent events OR the empty-state copy
  - No console errors (other than expected fetch wait times)
  - Network panel: 6 successful API responses (1 MAAS2 + 3 SWPC + 3 DONKI) when both tabs are visited

</specifics>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Product spec & decisions
- `Discussion.md` §3 (Environment Variables — `VITE_NASA_API_KEY`, `DEMO_KEY` fallback, Vite client-side exposure rationale)
- `Discussion.md` §8 (Deployment Checklist — 7 explicit items including Vercel auto-deploy and CORS verification)
- `Discussion.md` §9 (API Quick Reference — NASA key registration)
- `PROJECT.md` Key Decisions table (Vercel deployment line — currently Pending, becomes Validated after this phase)
- `CLAUDE.md` — Project guardrails: no hardcoded keys; backend proxy only if rate limits force it; client-side fetch only

### Requirements
- `.planning/REQUIREMENTS.md` DEPLOY-01..DEPLOY-04 (the four deployment locks)

### Roadmap
- `.planning/ROADMAP.md` Phase 6 — goal, depends on Phase 5, 4 success criteria

### Prior-phase decisions (locked — Phase 6 preserves)
- `.planning/phases/01-scaffold-shell/01-01-scaffold-SUMMARY.md` — `.env.example` shipped, `.gitignore` excludes `.env` (DEPLOY-02 prereq honored)
- `.planning/phases/04-moon-tab-three-sub-sections/04-CONTEXT.md` D-20 — env access only via `src/utils/env.js` (DEPLOY-02 honored)
- All phase VERIFICATION.md files — confirm `npm run build` passes consistently (DEPLOY-01 prereq)

### External services
- Vercel: https://vercel.com (free Hobby tier sufficient for v1)
- GitHub: https://github.com (free public/private repos)
- NASA API: https://api.nasa.gov (key registration; rate limits: 1000 req/hr authenticated, 30 req/hr DEMO_KEY)

### Vercel docs referenced
- Vite framework preset: https://vercel.com/docs/frameworks/vite (zero-config support)
- Environment variables: https://vercel.com/docs/projects/environment-variables (scoping: Production / Preview / Development)
- Deploy hooks & Git integration: https://vercel.com/docs/git/vercel-for-github (auto-deploy on push behavior)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `package.json` — `build` script is `vite build` (Vite default). Vercel auto-detects this.
- `vite.config.js` — Standard Vite config from Phase 1; no Vercel-specific overrides needed.
- `.gitignore` — Already excludes `.env`, `.env.local`, `dist`, `node_modules`. No changes needed.
- `.env.example` — Already shipped in Phase 1 documenting the `VITE_NASA_API_KEY=DEMO_KEY` default.
- `src/utils/env.js` — Centralized env access; works identically in production (Vite inlines `import.meta.env.VITE_*` at build time).
- `README.md` — Existing project README to extend with a Deployment section.
- `PROJECT.md` — Key Decisions table to update post-deploy.

### Established Patterns
- All env vars use the `VITE_` prefix (Vite convention — these get embedded in the client bundle at build time).
- Client-side fetch only; no backend code anywhere in the repo — Vercel deploys this as a static site (no Serverless Functions needed).
- Tailwind purges unused classes at build time; production CSS is the 16.3 kB observed in Phase 5 verification.

### Integration Points
- `package.json` — Vercel's auto-detection reads this.
- `dist/` — Build output, served as static assets.
- No backend / API routes — purely static SPA delivery.
- `.env.example` (not `.env`) is committed; the real `.env` is local-only.
- Future `DEPLOYMENT.md` (top-level, NOT inside `.planning/`) — user-facing runbook.

### Verified at end of Phase 5
- `npm run build` exits 0 — 99 modules, 210.65 kB JS bundle, 1.33s build time
- `git status` clean
- All 13 milestone plans complete with summaries and verifications

</code_context>

<deferred>
## Deferred Ideas

- **Custom domain** (e.g., `planetaryconditions.app`) — Vercel's `*.vercel.app` URL is adequate for v1. Custom domain adds DNS configuration + potential SSL cert handling; defer to v2 or whenever the project gains a clear audience.
- **Serverless proxy (Vercel Edge Function)** — Documented as a contingency in PROJECT.md for the DEMO_KEY rate-limit case. Not building speculatively. Add only if evidence shows the rate limit is hit in production (per CLAUDE.md guardrails).
- **Vercel Analytics integration** — Free tier offers Web Vitals + basic traffic. Nice-to-have for monitoring v1 usage; defer to v1.1 or v2 polish milestone.
- **GitHub Actions CI** — Vercel handles build-per-push; a separate Actions workflow would be redundant for v1. Add if/when the project gains tests that need to run independently of Vercel's build (e.g., Vitest suites — currently deferred).
- **Lighthouse / Core Web Vitals monitoring** — Defer to v2.
- **Branch protection on `main`** — Useful for collaborator workflows. Single-developer v1 doesn't need it.
- **Multi-environment promotion gates** (staging → prod) — Out of scope for v1.
- **Preview deploy comments on GitHub PRs** — Vercel auto-adds these via its GitHub app; no extra config needed. Just ensure the GitHub integration is enabled during project import.
- **A "Deploy your own" Vercel button + Netlify button + Cloudflare Pages button trifecta** — One button (Vercel) is enough for v1.
- **Dockerfile** — Static SPA; no container needed.
- **Robots.txt / sitemap.xml** — SEO polish; the dashboard isn't SEO-driven for v1. Defer.
- **Open Graph / Twitter Card meta tags** — Shareability polish; defer to v2 unless the project's public reach goal changes.

</deferred>

---

*Phase: 06-vercel-deployment*
*Context gathered: 2026-05-21*
