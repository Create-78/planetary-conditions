# Deployment

This runbook walks you through deploying **Planetary Conditions** to Vercel from scratch. Time: ~10 minutes once you have GitHub and Vercel accounts.

> The app is a static SPA — no backend, no Serverless Functions. Vercel auto-detects Vite and builds the project with zero configuration.

---

## Prerequisites

Before you start, you need:

1. **Node.js** (v18 or later) installed locally — for the pre-deploy build check.
2. **A GitHub account** — to host the repo.
3. **A Vercel account** — free Hobby tier is sufficient. Sign up at [vercel.com](https://vercel.com) and link your GitHub account during signup (Vercel will use it to import the project).
4. **(Recommended) A NASA API key** — free, 1000 requests/hour. Register at [api.nasa.gov](https://api.nasa.gov) — the form takes 30 seconds and the key arrives by email instantly.
   - Without your own key, the app falls back to `DEMO_KEY` (30 requests/hour) which is fine for local dev but will rate-limit quickly in production.

---

## First-time deployment

### 1. Confirm the project builds locally

From the project root:

```bash
npm install
npm run build
```

You should see Vite output ending with `✓ built in <time>`. If the build fails, fix the failure before continuing — Vercel will hit the same error.

### 2. Push the repo to GitHub

If you haven't already:

```bash
# Create a new repository on github.com first (any visibility — public recommended)
# Then, from the project root:
git remote add origin https://github.com/<USER>/planetary-conditions.git
git branch -M main
git push -u origin main
```

Replace `<USER>` with your GitHub username.

> Verify `.env` is NOT in your push — it should be gitignored. Run `git ls-files | grep '\.env$'` and confirm zero output before pushing.

### 3. Import the project in Vercel

Two equivalent paths — pick one:

**Path A — Vercel dashboard (recommended for first-time users):**
1. Go to [vercel.com/new](https://vercel.com/new)
2. Click **Add New… → Project**
3. Select your `planetary-conditions` repo from the GitHub list
4. On the configuration screen, **leave all defaults**:
   - Framework Preset: **Vite** (auto-detected)
   - Build Command: `npm run build` (auto-detected)
   - Output Directory: `dist` (auto-detected)
   - Install Command: `npm install` (auto-detected)
5. **Before clicking Deploy**, expand **Environment Variables** and add the env var from the next step.

**Path B — Vercel CLI:**
```bash
npm install -g vercel
vercel login
vercel link
# Accept the defaults (link to existing project: No; name: planetary-conditions; directory: ./)
```

### 4. Set the NASA API key in Vercel

In the Vercel dashboard, go to **Project → Settings → Environment Variables** and add:

| Field | Value |
|-------|-------|
| **Name** | `VITE_NASA_API_KEY` |
| **Value** | Your NASA API key from api.nasa.gov (or `DEMO_KEY` if you skipped registration) |
| **Environments** | ☑ Production, ☑ Preview (leave Development unchecked — local `.env` handles dev) |

Click **Save**.

> **Why both Production and Preview?** PR preview deploys need to hit NASA DONKI too. If only Production is checked, previews will fall back to `DEMO_KEY` and may rate-limit during review.

### 5. Trigger the first deploy

- **Path A users:** Click **Deploy** on the import screen. Vercel runs the first build (~1-2 minutes).
- **Path B users:** Push to `main` (`git push`) or run `vercel --prod` once. Either triggers a deploy via Vercel's GitHub integration.

Watch the build logs in the Vercel dashboard. Expected: `Build Completed in <project>/dist`. Vercel shows the production URL when the deploy finishes — typically `https://planetary-conditions.vercel.app` (or `https://planetary-conditions-<random>.vercel.app` if the name was taken).

### 6. Verify the production URL

Open the production URL in a browser, then:

1. Open DevTools → **Network** tab → filter to `Fetch/XHR`.
2. Switch to the **Mars** tab. Confirm 1 successful GET to `https://api.maas2.apollorion.com/` (status 200).
3. Switch to the **Moon** tab. Confirm 6 successful GETs:
   - 3 to `services.swpc.noaa.gov` (`plasma-2-hour.json`, `mag-2-hour.json`, `noaa-planetary-k-index.json`)
   - 3 to `api.nasa.gov/DONKI/` (`CME`, `FLR`, `GST`)
4. Open DevTools → **Console**. Confirm **zero** `CORS policy: ...blocked...` errors.
5. Inspect the DONKI request URLs — confirm `api_key=<your-key>` (NOT `api_key=DEMO_KEY`) in the query string. If you see `DEMO_KEY`, the env var didn't propagate — re-check step 4 then redeploy from the Vercel dashboard (Deployments → ⋯ → Redeploy).

### 7. Smoke test both tabs

On the production URL:

- **Mars tab:** 8 DataCards render with real values (sol number, Earth date, min/max temp, pressure, wind speed, humidity, opacity) — no em-dashes everywhere, no "Data temporarily unavailable" banners.
- **Moon tab — Lunar Context:** Current lunar phase name, percentage, day/night indicator, estimated surface temperature.
- **Moon tab — Space Weather:** Solar wind speed, density, Bz, Kp index, and a colored Radiation Risk badge (Low/Moderate/High).
- **Moon tab — Solar Event Alerts:** Either a scrollable list of recent CME/FLR/GST events OR the empty-state copy "No significant events in the past 7 days — conditions are calm."

If all four sections render real data with no console errors, the deploy is verified.

---

## Subsequent deploys

Every push to `main` triggers an auto-deploy:

```bash
git push origin main
```

Watch the Vercel dashboard (**Deployments** tab) for build status. Most builds complete in under 60 seconds.

---

## Preview deploys

Every push to a non-`main` branch (and every pull request) generates a unique preview URL automatically. Useful for:

- Reviewing visual changes before merging
- Testing with the Preview-scope env var
- Sharing in-progress work without affecting production

Preview URLs are posted as a comment on the PR by Vercel's GitHub app.

---

## Troubleshooting

### Build fails on Vercel but works locally
- Confirm `node_modules` is in `.gitignore` and was NOT committed.
- Confirm `package-lock.json` IS committed — Vercel uses it for reproducible installs.
- Check Vercel's Node version (Settings → General → Node.js Version) — set to 18.x or newer.

### CORS errors in production console
All three upstream APIs (MAAS2, NOAA SWPC, NASA DONKI) are documented CORS-open and have been verified from production. If you see CORS errors:
1. Confirm the request URL exactly matches the documented endpoint (typos break CORS preflight).
2. Check that you're not behind a corporate proxy that strips CORS headers.
3. If a specific upstream genuinely starts blocking the deployed origin, the contingency is a Vercel Edge Function proxy — but this is **not** part of v1 unless evidence shows the rate limit or CORS block is unavoidable. See `CLAUDE.md` for the proxy decision rule.

### NASA DONKI returns 403 / "OVER_RATE_LIMIT"
You're hitting `DEMO_KEY`'s 30/hr cap. Register a real key at [api.nasa.gov](https://api.nasa.gov) and update `VITE_NASA_API_KEY` in Vercel (Settings → Environment Variables → edit → Save). Redeploy: **Deployments → latest → ⋯ → Redeploy**.

### "VITE_NASA_API_KEY is undefined" at runtime
- Confirm the env var name is **exact**: `VITE_NASA_API_KEY` (the `VITE_` prefix is required — Vite only inlines vars with that prefix into the client bundle at build time).
- Confirm the var is set on **Production** scope (and Preview if you want preview deploys to use the real key).
- After adding/editing an env var, you MUST redeploy — Vercel does NOT hot-swap env vars into existing builds.

### Production URL shows a 404 or blank screen
- Check Vercel's build log for errors.
- Confirm `dist/index.html` was generated locally (`npm run build` then `ls dist/`).
- Confirm the Output Directory in Vercel settings is `dist` (not `build` or `out`).

---

*This runbook is the deployment source-of-truth. If you change deployment infrastructure (custom domain, env vars, build settings), update this file in the same commit.*
