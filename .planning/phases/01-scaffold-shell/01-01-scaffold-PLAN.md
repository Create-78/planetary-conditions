---
phase: 01-scaffold-shell
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - package.json
  - vite.config.js
  - index.html
  - tailwind.config.js
  - postcss.config.js
  - src/index.css
  - src/main.jsx
  - src/App.jsx
  - src/components/.gitkeep
  - src/tabs/.gitkeep
  - src/hooks/.gitkeep
  - src/constants/.gitkeep
  - src/utils/env.js
  - .env.example
  - .gitignore
autonomous: true
requirements:
  - SCAF-01
  - SCAF-02
  - SCAF-03
  - SCAF-04
  - SCAF-05
must_haves:
  truths:
    - "User can run `npm run dev` and the app boots at localhost with no console errors"
    - "User can run `npm run build` and the production bundle compiles successfully"
    - "User's NASA API key is read from VITE_NASA_API_KEY env var with DEMO_KEY fallback, never hardcoded"
    - "User's `.env` file is ignored by git; `.env.example` is committed as the template"
    - "User's app is wrapped in QueryClientProvider so React Query hooks work app-wide"
  artifacts:
    - path: "package.json"
      provides: "Project dependencies and npm scripts"
      contains: "vite"
    - path: "vite.config.js"
      provides: "Vite + React build config"
    - path: "tailwind.config.js"
      provides: "Tailwind config with mars/moon/space color palettes and Inter font family"
      contains: "mars"
    - path: "src/main.jsx"
      provides: "App entry point with QueryClientProvider wrapper"
      contains: "QueryClientProvider"
    - path: "src/utils/env.js"
      provides: "Typed accessor for VITE_NASA_API_KEY with DEMO_KEY fallback"
      contains: "DEMO_KEY"
    - path: ".env.example"
      provides: "Documented env var template"
      contains: "VITE_NASA_API_KEY"
    - path: ".gitignore"
      provides: "Git exclusions for .env and node_modules"
      contains: ".env"
  key_links:
    - from: "src/main.jsx"
      to: "@tanstack/react-query"
      via: "QueryClientProvider wrapping <App />"
      pattern: "QueryClientProvider.*client"
    - from: "src/index.css"
      to: "tailwindcss"
      via: "@tailwind base/components/utilities directives"
      pattern: "@tailwind"
    - from: "tailwind.config.js"
      to: "src/**/*.{js,jsx}"
      via: "content glob"
      pattern: "content"
---

<objective>
Scaffold the Vite + React + Tailwind + TanStack Query foundation. Establish the project skeleton (directories, configs, entry points), wire up the React Query provider, configure Tailwind with the Mars/Moon/space color palettes and Inter font, and gate the NASA API key behind an env-var accessor with a DEMO_KEY fallback.

Purpose: Phase 2+ components depend on this scaffold being correct — Tailwind tokens, env access, and the Query client must already exist before any UI or data hook is written. This is foundation work; no UI is visible yet beyond a placeholder.
Output: A buildable Vite project committed to git, `.env` gitignored, `.env.example` documented, `npm run dev` and `npm run build` both succeed.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/REQUIREMENTS.md
@.planning/STATE.md
@Discussion.md
@README.md
</context>

<tasks>

<task type="auto">
  <name>Task 1: Create Vite + React + Tailwind project files directly and install dependencies</name>
  <files>package.json, vite.config.js, index.html, src/main.jsx, src/App.jsx, src/index.css, tailwind.config.js, postcss.config.js, .gitignore</files>
  <read_first>
    - Discussion.md (§3 Stack, §4 App Structure) — confirms React + Vite + Tailwind + TanStack Query
    - .planning/REQUIREMENTS.md (SCAF-01, SCAF-03, SCAF-05)
    - README.md (Tech Stack)
  </read_first>
  <action>
    The working directory is non-empty (CLAUDE.md, README.md, Discussion.md, .planning/ already exist), so we cannot run `npm create vite@latest .` — it would hang in non-TTY autonomous execution waiting for the "Ignore files and continue" prompt. Instead, write the Vite scaffold files directly (the "create-vite react template" is just a known set of files).

    Execute the following from the project root:

    1. Create `package.json` with Vite + React metadata:
       ```bash
       cat > package.json <<'EOF'
       {
         "name": "planetary-conditions",
         "private": true,
         "version": "0.0.1",
         "type": "module",
         "scripts": {
           "dev": "vite",
           "build": "vite build",
           "preview": "vite preview"
         }
       }
       EOF
       ```

    2. Install runtime dependencies (writes them into package.json automatically):
       ```bash
       npm install --save react@^18.3.1 react-dom@^18.3.1
       npm install --save @tanstack/react-query
       ```

    3. Install build/dev dependencies (Tailwind v3 — NOT v4 — is the stable, well-documented baseline for this stack):
       ```bash
       npm install --save-dev vite@^5.4.0 @vitejs/plugin-react@^4.3.0
       npm install --save-dev tailwindcss@^3.4.0 postcss autoprefixer
       ```

       After these installs, `node_modules/` and `package-lock.json` will exist.

    4. Create `vite.config.js` with EXACTLY:
       ```js
       import { defineConfig } from 'vite'
       import react from '@vitejs/plugin-react'

       // https://vitejs.dev/config/
       export default defineConfig({
         plugins: [react()],
       })
       ```

    5. Create `index.html` at the project root with EXACTLY (no favicon link — keeps console clean, avoids /vite.svg 404):
       ```html
       <!doctype html>
       <html lang="en">
         <head>
           <meta charset="UTF-8" />
           <meta name="viewport" content="width=device-width, initial-scale=1.0" />
           <link rel="preconnect" href="https://fonts.googleapis.com" />
           <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
           <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
           <title>Planetary Conditions</title>
         </head>
         <body>
           <div id="root"></div>
           <script type="module" src="/src/main.jsx"></script>
         </body>
       </html>
       ```

    6. Create `src/index.css` with EXACTLY the three Tailwind directives:
       ```css
       @tailwind base;
       @tailwind components;
       @tailwind utilities;
       ```

    7. Create `src/main.jsx` with EXACTLY:
       ```jsx
       import { StrictMode } from 'react'
       import { createRoot } from 'react-dom/client'
       import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
       import './index.css'
       import App from './App.jsx'

       const queryClient = new QueryClient({
         defaultOptions: {
           queries: {
             staleTime: 60_000,
             refetchOnWindowFocus: false,
           },
         },
       })

       createRoot(document.getElementById('root')).render(
         <StrictMode>
           <QueryClientProvider client={queryClient}>
             <App />
           </QueryClientProvider>
         </StrictMode>,
       )
       ```

    8. Create `src/App.jsx` with a minimal placeholder (the real shell is built in Plan 02):
       ```jsx
       function App() {
         return (
           <div className="min-h-screen bg-slate-950 text-white p-8">
             <h1 className="text-2xl font-bold">Planetary Conditions</h1>
             <p className="text-slate-400">Scaffold ready. Shell coming in Plan 02.</p>
           </div>
         )
       }

       export default App
       ```

    9. Generate Tailwind + PostCSS config files: `npx tailwindcss init -p`
       - This creates `tailwind.config.js` and `postcss.config.js`. Task 2 customizes `tailwind.config.js` with the mars/moon/space palettes.

    10. Create / update `.gitignore` with EXACTLY (Vite's standard ignores + explicit `.env`):
        ```
        # Logs
        logs
        *.log
        npm-debug.log*

        # Dependencies
        node_modules

        # Build output
        dist
        dist-ssr

        # Local env files
        .env
        .env.local
        *.local

        # Editor
        .vscode/*
        !.vscode/extensions.json
        .idea
        .DS_Store
        *.suo
        *.ntvs*
        *.njsproj
        *.sln
        *.sw?
        ```

       (Note: SCAF-05 requires both `.env` and `node_modules` appear in the final file — both are present above.)

    Why this approach: Directly writing the scaffold files avoids the interactive `npm create vite@latest .` prompt that would hang under non-TTY autonomous execution in a non-empty directory. The files we create are identical to what create-vite's React template produces, minus the demo assets (App.css, react.svg, vite.svg) we wouldn't keep anyway.
  </action>
  <verify>
    <automated>test -f package.json && test -f vite.config.js && test -f index.html && test -f tailwind.config.js && test -f postcss.config.js && test -f src/main.jsx && test -f src/App.jsx && test -f src/index.css && test -f node_modules/vite/package.json && test -f node_modules/react/package.json && test -f node_modules/@tanstack/react-query/package.json && test -f node_modules/tailwindcss/package.json && grep -q '"@tanstack/react-query"' package.json && grep -q '"tailwindcss"' package.json && grep -q '"vite"' package.json && grep -q 'QueryClientProvider' src/main.jsx && grep -q '@tailwind base' src/index.css && grep -q '^\.env$' .gitignore && grep -q 'node_modules' .gitignore && grep -q '<div id="root">' index.html && ! grep -q 'vite.svg' index.html</automated>
  </verify>
  <acceptance_criteria>
    - `package.json` exists and contains `"vite"`, `"react"`, `"@tanstack/react-query"`, and `"tailwindcss"` in dependencies/devDependencies
    - `node_modules/vite/package.json` exists (i.e., `npm install` succeeded)
    - `vite.config.js` exists and contains `@vitejs/plugin-react`
    - `index.html` contains `<div id="root">` and does NOT contain any reference to `vite.svg`
    - `tailwind.config.js` and `postcss.config.js` both exist (created by `npx tailwindcss init -p`)
    - `src/index.css` contains exactly the three lines `@tailwind base;`, `@tailwind components;`, `@tailwind utilities;`
    - `src/main.jsx` contains `QueryClientProvider` and wraps `<App />` with it
    - `.gitignore` contains a line matching exactly `.env` and a line containing `node_modules`
  </acceptance_criteria>
  <done>Vite project files created directly (no interactive scaffold), dependencies installed into node_modules, React Query provider wrapping App, Tailwind installed and CSS directives in place, `.gitignore` excludes `.env` and `node_modules`.</done>
</task>

<task type="auto">
  <name>Task 2: Configure Tailwind palettes, env-var accessor, and project directories</name>
  <files>tailwind.config.js, src/utils/env.js, .env.example, src/components/.gitkeep, src/tabs/.gitkeep, src/hooks/.gitkeep, src/constants/.gitkeep</files>
  <read_first>
    - tailwind.config.js (the generated file from Task 1)
    - Discussion.md (§2 Visual Style — color palettes and typography, §3 Environment Variables, §5 Component Architecture)
    - .planning/REQUIREMENTS.md (SCAF-02, SCAF-04)
  </read_first>
  <action>
    1. Overwrite `tailwind.config.js` with EXACTLY:
       ```js
       /** @type {import('tailwindcss').Config} */
       export default {
         content: [
           './index.html',
           './src/**/*.{js,jsx}',
         ],
         theme: {
           extend: {
             colors: {
               mars: {
                 50:  '#fef2f2',
                 500: '#dc2626',
                 600: '#b91c1c',
                 700: '#991b1b',
                 800: '#7f1d1d',
                 900: '#450a0a',
                 accent: '#f59e0b',
               },
               moon: {
                 50:  '#f1f5f9',
                 400: '#94a3b8',
                 500: '#64748b',
                 600: '#475569',
                 700: '#334155',
                 800: '#1e293b',
                 900: '#0f172a',
                 accent: '#cbd5e1',
               },
               space: {
                 900: '#0a0a0f',
                 950: '#020617',
               },
             },
             fontFamily: {
               sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
             },
           },
         },
         plugins: [],
       }
       ```

       Note: Inter is already loaded via Google Fonts CDN in `index.html` (Task 1, step 5) — no `<head>` edits needed here.

    2. Create `src/utils/env.js` with EXACTLY:
       ```js
       // Typed accessor for build-time env vars.
       // Never hardcode API keys — always read through this module.
       // See Discussion.md §3 Environment Variables.

       export const NASA_API_KEY = import.meta.env.VITE_NASA_API_KEY || 'DEMO_KEY'
       ```

    3. Create `.env.example` (committed to git, serves as template; the real `.env` is gitignored) with EXACTLY:
       ```
       # Copy this file to .env and replace DEMO_KEY with a real NASA API key for production use.
       # Register a free key at https://api.nasa.gov (1,000 req/hr per IP).
       # The .env file is gitignored — never commit real keys.

       VITE_NASA_API_KEY=DEMO_KEY
       ```

    4. Create the empty source directories per Discussion.md §5 component architecture. Use `.gitkeep` files so git tracks the directories:
       - `src/components/.gitkeep`
       - `src/tabs/.gitkeep`
       - `src/hooks/.gitkeep`
       - `src/constants/.gitkeep`

       (No `.gitkeep` in `src/utils/` — `src/utils/env.js` already exists from step 2 and keeps the directory tracked.)

       Each `.gitkeep` is an empty file (zero bytes is fine).

    Why this order: Tailwind config first so subsequent steps can rely on color tokens existing. Env accessor before the directories so we have one tracked file in `src/utils/` already. Directories last as scaffolding for Phase 2+ work. The final `npm run build` in <verify> is the end-of-plan smoke test that proves the whole scaffold compiles together.
  </action>
  <verify>
    <automated>grep -q "mars:" tailwind.config.js && grep -q "moon:" tailwind.config.js && grep -q "'#f59e0b'" tailwind.config.js && grep -q "'#cbd5e1'" tailwind.config.js && grep -q "Inter" tailwind.config.js && grep -q "VITE_NASA_API_KEY" src/utils/env.js && grep -q "DEMO_KEY" src/utils/env.js && grep -q "VITE_NASA_API_KEY=DEMO_KEY" .env.example && test -d src/components && test -d src/tabs && test -d src/hooks && test -d src/utils && test -d src/constants && ! test -f src/utils/.gitkeep && npm run build</automated>
  </verify>
  <acceptance_criteria>
    - `tailwind.config.js` contains `mars:` with hex `#dc2626` (mars.500), `#f59e0b` (mars.accent)
    - `tailwind.config.js` contains `moon:` with hex `#0f172a` (moon.900), `#cbd5e1` (moon.accent)
    - `tailwind.config.js` contains `space:` with hex `#020617` (space.950)
    - `tailwind.config.js` `fontFamily.sans` array starts with `'Inter'`
    - `tailwind.config.js` `content` array includes `'./src/**/*.{js,jsx}'`
    - `src/utils/env.js` exports `NASA_API_KEY` and references `import.meta.env.VITE_NASA_API_KEY` with `'DEMO_KEY'` fallback
    - `.env.example` contains the line `VITE_NASA_API_KEY=DEMO_KEY`
    - `.env` is NOT present in git (it should be either absent or gitignored)
    - Directories `src/components/`, `src/tabs/`, `src/hooks/`, `src/utils/`, `src/constants/` all exist
    - `src/utils/.gitkeep` does NOT exist (env.js already tracks the directory)
    - `npm run build` exits with code 0 — end-of-plan smoke test confirms the full scaffold compiles
  </acceptance_criteria>
  <done>Tailwind config defines mars/moon/space palettes and Inter font; env accessor exports `NASA_API_KEY` with DEMO_KEY fallback; `.env.example` documents the env var; all five required source directories exist; production build succeeds.</done>
</task>

</tasks>

<verification>
After both tasks complete, verify the scaffold end-to-end:

1. `npm run dev` starts without errors (Vite dev server prints "Local: http://localhost:5173/" or similar)
2. `npm run build` exits 0 and produces `dist/index.html` + `dist/assets/*`
3. Opening `http://localhost:5173` in a browser shows the placeholder "Planetary Conditions" heading on a dark slate-950 background with no red errors in the browser console
4. `git status` shows `.env` is NOT tracked (either absent or honored by gitignore); `.env.example`, `tailwind.config.js`, `src/utils/env.js`, all `.gitkeep` files ARE tracked
5. `grep -r "DEMO_KEY" src/` returns at most a reference inside `src/utils/env.js` — no other hardcoded key references
</verification>

<success_criteria>
- [ ] Vite + React project files written directly (no interactive scaffold call)
- [ ] TanStack Query installed and `QueryClientProvider` wraps `<App />` in `src/main.jsx`
- [ ] Tailwind CSS installed, `tailwind.config.js` defines mars/moon/space color palettes + Inter font family
- [ ] Inter loaded via Google Fonts CDN in `index.html`
- [ ] `src/utils/env.js` exposes `NASA_API_KEY` with `DEMO_KEY` fallback — no hardcoded keys anywhere else
- [ ] `.env.example` committed; `.env` gitignored
- [ ] `.gitignore` excludes both `.env` and `node_modules`
- [ ] Project directories (`components/`, `tabs/`, `hooks/`, `utils/`, `constants/`) exist
- [ ] `npm run build` succeeds with exit code 0
- [ ] `npm run dev` starts without console errors
</success_criteria>

<output>
After completion, create `.planning/phases/01-scaffold-shell/01-01-SUMMARY.md` capturing:
- Final dependency versions (Vite, React, Tailwind, TanStack Query)
- Any deviations from the plan (e.g., if a Vite version pin had to shift)
- Final tailwind.config.js color palette as shipped
- Anything Phase 1 Plan 02 (shell) needs to know about file locations
</output>
</content>
</invoke>