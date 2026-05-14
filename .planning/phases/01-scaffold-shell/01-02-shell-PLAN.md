---
phase: 01-scaffold-shell
plan: 02
type: execute
wave: 2
depends_on:
  - 01-01
files_modified:
  - src/App.jsx
  - src/components/TabBar.jsx
  - src/components/StarField.jsx
  - src/tabs/MarsTab.jsx
  - src/tabs/MoonTab.jsx
  - src/constants/tabs.js
  - src/index.css
autonomous: true
requirements:
  - SHELL-01
  - SHELL-02
  - SHELL-03
  - SHELL-04
  - SHELL-05
must_haves:
  truths:
    - "User sees a dark cinematic shell with a subtle star-field background applied behind both tabs"
    - "User sees clean technical sans-serif (Inter) typography throughout the shell"
    - "User sees two prominent tabs labeled 'Mars' and 'Moon' at the top of the page"
    - "User can click between tabs and the active tab switches instantly (state-only, no route reload, no network)"
    - "User sees the active Mars tab styled in amber/rust palette; active Moon tab styled in blue/silver palette"
    - "User on a desktop viewport sees the intended max-w-6xl centered shell layout with TabBar horizontal; user on a narrow viewport (~375px) sees a non-broken single-column fallback"
  artifacts:
    - path: "src/App.jsx"
      provides: "Root layout with tab state, star-field background, and tab content area"
      contains: "useState"
    - path: "src/components/TabBar.jsx"
      provides: "Tab switcher with Mars/Moon buttons, palette-aware active state"
      contains: "activeTab"
    - path: "src/components/StarField.jsx"
      provides: "Fixed-position CSS-only star-field background texture"
      contains: "fixed inset-0"
    - path: "src/tabs/MarsTab.jsx"
      provides: "Empty Mars tab placeholder; data wired in Phase 3"
    - path: "src/tabs/MoonTab.jsx"
      provides: "Empty Moon tab placeholder; data wired in Phase 4"
    - path: "src/constants/tabs.js"
      provides: "Tab identifiers and palette-key map (single source of truth)"
      contains: "MARS"
  key_links:
    - from: "src/App.jsx"
      to: "src/components/TabBar.jsx"
      via: "imports TabBar; passes activeTab + setActiveTab via props"
      pattern: "import TabBar"
    - from: "src/App.jsx"
      to: "src/tabs/MarsTab.jsx and src/tabs/MoonTab.jsx"
      via: "conditional render based on activeTab state"
      pattern: "activeTab === "
    - from: "src/components/TabBar.jsx"
      to: "src/constants/tabs.js"
      via: "imports TABS constants for ids/labels"
      pattern: "from.*constants/tabs"
    - from: "src/App.jsx"
      to: "src/components/StarField.jsx"
      via: "renders StarField behind tab content"
      pattern: "<StarField"
---

<objective>
Build the dark cinematic shell on top of the Plan 01 scaffold: an `App.jsx` with tab state, a `TabBar` component with palette-aware active styling, a CSS-only `StarField` background, and empty `MarsTab` / `MoonTab` placeholders. Wire Inter typography app-wide and ensure the layout degrades gracefully on narrow viewports.

Purpose: Phase 1's user-visible deliverable. Users can run the app, see the dark cinematic frame, switch between two clearly-styled tabs, and trust that the foundation is ready for data panels in Phases 2–4.
Output: A working two-tab dark shell. No data — that's deliberate. The tabs render empty placeholders that Phases 3 and 4 fill in.
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
@.planning/phases/01-scaffold-shell/01-01-SUMMARY.md

<interfaces>
<!-- Plan 01 (01-01) produced these tokens/exports. Use them directly — no exploration needed. -->

Tailwind palette tokens (from tailwind.config.js, theme.extend.colors):
- mars: 50, 500, 600, 700, 800, 900, accent (#f59e0b amber)
- moon: 50, 400, 500, 600, 700, 800, 900, accent (#cbd5e1 silver)
- space: 900 (#0a0a0f), 950 (#020617 — base black)

Tailwind font tokens (from tailwind.config.js, theme.extend.fontFamily):
- font-sans → ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif']

Existing files (do not duplicate, only modify if explicitly listed in files_modified):
- src/main.jsx — already wraps App in QueryClientProvider; do not touch
- src/index.css — Tailwind directives only; you may append a small custom `body` rule for font-family fallback
- src/App.jsx — Plan 01 left a placeholder; REPLACE its contents in this plan
- src/utils/env.js — exports NASA_API_KEY; not used in shell, available for Phase 3+
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Define tab constants, build TabBar and StarField components, build empty tab placeholders</name>
  <files>src/constants/tabs.js, src/components/TabBar.jsx, src/components/StarField.jsx, src/tabs/MarsTab.jsx, src/tabs/MoonTab.jsx</files>
  <read_first>
    - tailwind.config.js (confirm palette token names available: mars-*, moon-*, space-*)
    - Discussion.md (§2 Visual Style, §4 Tab Layout, §5 Component Architecture)
    - .planning/REQUIREMENTS.md (SHELL-01, SHELL-02, SHELL-03)
  </read_first>
  <action>
    1. Create `src/constants/tabs.js` as the single source of truth for tab identifiers and palette keys:
       ```js
       // Tab identifiers and palette keys.
       // App.jsx and TabBar.jsx both import from here so the wiring stays consistent.

       export const TABS = {
         MARS: {
           id: 'mars',
           label: 'Mars',
           paletteKey: 'mars',
         },
         MOON: {
           id: 'moon',
           label: 'Moon',
           paletteKey: 'moon',
         },
       }

       export const TAB_LIST = [TABS.MARS, TABS.MOON]

       export const DEFAULT_TAB = TABS.MARS.id
       ```

    2. Create `src/components/StarField.jsx` — a CSS-only subtle star-field background using a fixed-position div with a Tailwind-driven radial-gradient pattern. The component renders nothing in the visible content tree above the data; it sits at `inset-0` with low z-index and subtle opacity so it doesn't compete with data panels.
       ```jsx
       // CSS-only star-field background. Two layered radial-gradient patterns at low opacity.
       // Fixed position so the texture stays put while content scrolls.
       // Sits behind all content (z-0) — App.jsx places tab content at z-10.

       function StarField() {
         return (
           <div
             aria-hidden="true"
             className="pointer-events-none fixed inset-0 z-0 bg-space-950"
             style={{
               backgroundImage: `
                 radial-gradient(circle at 20% 30%, rgba(255,255,255,0.4) 0.5px, transparent 1px),
                 radial-gradient(circle at 75% 60%, rgba(255,255,255,0.3) 0.5px, transparent 1px),
                 radial-gradient(circle at 45% 80%, rgba(255,255,255,0.35) 0.5px, transparent 1px),
                 radial-gradient(circle at 90% 15%, rgba(255,255,255,0.25) 0.5px, transparent 1px),
                 radial-gradient(circle at 10% 70%, rgba(255,255,255,0.3) 0.5px, transparent 1px)
               `,
               backgroundSize: '120px 120px, 180px 180px, 150px 150px, 200px 200px, 160px 160px',
               opacity: 0.6,
             }}
           />
         )
       }

       export default StarField
       ```

    3. Create `src/components/TabBar.jsx` — the two-tab switcher. Receives `activeTab` (string id) and `onTabChange` (callback) as props. Renders Mars + Moon buttons, applies the active body's palette to the active tab using Tailwind utility classes. The component MUST NOT manage its own state — App owns activeTab so switching is pure state-only (SHELL-02: "no route reload"; no `<a>`, no router, no fetch).
       ```jsx
       import { TAB_LIST } from '../constants/tabs.js'

       // Palette-aware styles per tab id.
       // Active tab gets a strong body-color background + accent border.
       // Inactive tab gets a muted slate look so the active one reads as clearly distinct.
       const TAB_STYLES = {
         mars: {
           active: 'bg-mars-700 text-mars-50 border-mars-accent shadow-[0_0_24px_-6px_#f59e0b]',
           inactive: 'bg-slate-900/60 text-slate-400 border-slate-700 hover:text-mars-50 hover:border-mars-700',
         },
         moon: {
           active: 'bg-moon-800 text-moon-50 border-moon-accent shadow-[0_0_24px_-6px_#cbd5e1]',
           inactive: 'bg-slate-900/60 text-slate-400 border-slate-700 hover:text-moon-50 hover:border-moon-700',
         },
       }

       function TabBar({ activeTab, onTabChange }) {
         return (
           <nav
             role="tablist"
             aria-label="Planetary body"
             className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full"
           >
             {TAB_LIST.map((tab) => {
               const isActive = activeTab === tab.id
               const styles = TAB_STYLES[tab.id]
               return (
                 <button
                   key={tab.id}
                   role="tab"
                   type="button"
                   aria-selected={isActive}
                   onClick={() => onTabChange(tab.id)}
                   className={[
                     'flex-1 px-6 py-4 text-lg font-semibold tracking-wide',
                     'border-2 rounded-lg transition-colors duration-150',
                     'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-space-950 focus-visible:ring-white',
                     isActive ? styles.active : styles.inactive,
                   ].join(' ')}
                 >
                   {tab.label}
                 </button>
               )
             })}
           </nav>
         )
       }

       export default TabBar
       ```

    4. Create `src/tabs/MarsTab.jsx` — empty placeholder. Phase 3 fills this in.
       ```jsx
       // Mars tab placeholder. Data hooks and panels arrive in Phase 3.
       function MarsTab() {
         return (
           <section role="tabpanel" aria-label="Mars conditions" className="text-mars-50">
             <h2 className="text-3xl font-bold mb-2">Mars</h2>
             <p className="text-mars-50/70">Curiosity rover surface data lands here in Phase 3.</p>
           </section>
         )
       }

       export default MarsTab
       ```

    5. Create `src/tabs/MoonTab.jsx` — empty placeholder. Phase 4 fills this in.
       ```jsx
       // Moon tab placeholder. Lunar context + SWPC + DONKI sections arrive in Phase 4.
       function MoonTab() {
         return (
           <section role="tabpanel" aria-label="Moon conditions" className="text-moon-50">
             <h2 className="text-3xl font-bold mb-2">Moon</h2>
             <p className="text-moon-50/70">Lunar context, solar wind, and event alerts land here in Phase 4.</p>
           </section>
         )
       }

       export default MoonTab
       ```

    Why this order: Constants first (TabBar and App both depend on them). Visual primitives (StarField, TabBar) next. Empty tab placeholders last — they're the smallest pieces and depend on nothing.
  </action>
  <verify>
    <automated>test -f src/constants/tabs.js && test -f src/components/TabBar.jsx && test -f src/components/StarField.jsx && test -f src/tabs/MarsTab.jsx && test -f src/tabs/MoonTab.jsx && grep -q "TABS" src/constants/tabs.js && grep -q "MARS" src/constants/tabs.js && grep -q "MOON" src/constants/tabs.js && grep -q "role=\"tablist\"" src/components/TabBar.jsx && grep -q "aria-selected" src/components/TabBar.jsx && grep -q "bg-mars-700" src/components/TabBar.jsx && grep -q "bg-moon-800" src/components/TabBar.jsx && grep -q "fixed inset-0" src/components/StarField.jsx && grep -q "bg-space-950" src/components/StarField.jsx && grep -q "role=\"tabpanel\"" src/tabs/MarsTab.jsx && grep -q "role=\"tabpanel\"" src/tabs/MoonTab.jsx</automated>
  </verify>
  <acceptance_criteria>
    - `src/constants/tabs.js` exports `TABS` with `MARS` and `MOON` keys, each having `id`, `label`, `paletteKey`
    - `src/constants/tabs.js` exports `TAB_LIST` (array) and `DEFAULT_TAB` (string)
    - `src/components/TabBar.jsx` is a function component, takes `activeTab` and `onTabChange` props
    - `TabBar.jsx` contains `role="tablist"` and `aria-selected={isActive}`
    - `TabBar.jsx` uses Tailwind classes `bg-mars-700` (Mars active) and `bg-moon-800` (Moon active)
    - `TabBar.jsx` does NOT contain `useState`, `<a `, `href=`, `fetch`, or any router import (pure props-driven, state-only switching)
    - `src/components/StarField.jsx` contains `pointer-events-none fixed inset-0` and uses `bg-space-950`
    - `src/components/StarField.jsx` includes `aria-hidden="true"` (decorative element)
    - `src/tabs/MarsTab.jsx` and `src/tabs/MoonTab.jsx` both render with `role="tabpanel"`
    - File-presence and content greps pass (build smoke test deferred to Task 2 final verify since these files are not yet wired into App.jsx)
  </acceptance_criteria>
  <done>Tab constants exist; TabBar, StarField, MarsTab, and MoonTab components all created and importable; greps confirm structure. Components are wired in Task 2, where the production build is the end-of-plan smoke test.</done>
</task>

<task type="auto">
  <name>Task 2: Wire App.jsx with tab state, star-field, responsive layout, and Inter typography baseline</name>
  <files>src/App.jsx, src/index.css</files>
  <read_first>
    - src/components/TabBar.jsx, src/components/StarField.jsx, src/tabs/MarsTab.jsx, src/tabs/MoonTab.jsx, src/constants/tabs.js (the files created in Task 1)
    - tailwind.config.js (confirm font-sans uses Inter)
    - .planning/REQUIREMENTS.md (SHELL-01, SHELL-02, SHELL-04, SHELL-05)
    - Discussion.md (§2 Visual Style, §4 Tab Layout)
  </read_first>
  <action>
    1. Overwrite `src/App.jsx` with EXACTLY (replaces the Plan 01 placeholder):
       ```jsx
       import { useState } from 'react'
       import TabBar from './components/TabBar.jsx'
       import StarField from './components/StarField.jsx'
       import MarsTab from './tabs/MarsTab.jsx'
       import MoonTab from './tabs/MoonTab.jsx'
       import { DEFAULT_TAB, TABS } from './constants/tabs.js'

       function App() {
         const [activeTab, setActiveTab] = useState(DEFAULT_TAB)

         return (
           <div className="relative min-h-screen w-full font-sans text-slate-100 antialiased">
             <StarField />

             <main className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 md:px-8 py-8 md:py-12">
               <header className="mb-8 md:mb-12">
                 <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">
                   Planetary Conditions
                 </h1>
                 <p className="text-slate-400 text-sm md:text-base">
                   Real-time surface and space environment data from Mars and the Moon.
                 </p>
               </header>

               <div className="mb-8 md:mb-10">
                 <TabBar activeTab={activeTab} onTabChange={setActiveTab} />
               </div>

               <div className="rounded-lg border border-slate-800/60 bg-slate-950/40 backdrop-blur-sm p-6 md:p-8">
                 {activeTab === TABS.MARS.id && <MarsTab />}
                 {activeTab === TABS.MOON.id && <MoonTab />}
               </div>
             </main>
           </div>
         )
       }

       export default App
       ```

       Key wiring notes (for the executor):
       - `relative min-h-screen` on the outer wrapper so StarField (which is `fixed inset-0`) can sit underneath without disturbing flow.
       - `font-sans` applies the Inter font family (from tailwind.config.js).
       - `<main>` uses `relative z-10` to sit above the StarField's `z-0`.
       - `max-w-6xl mx-auto` constrains desktop width.
       - `px-4 sm:px-6 md:px-8` and `py-8 md:py-12` give responsive padding — narrow viewport still has breathing room.
       - The TabBar already collapses to vertical on narrow screens (`flex-col sm:flex-row`) — that's the single-column fallback for SHELL-05.
       - Conditional render of MarsTab / MoonTab based on `activeTab` is pure state — instant switch, no route reload (SHELL-02).

    2. Append to `src/index.css` (after the three @tailwind directives) a small body-level rule to lock Inter as the default in case any element lacks Tailwind's `font-sans` class, plus a deep-black base body color for paint-before-React loads:
       ```css

       body {
         font-family: 'Inter', ui-sans-serif, system-ui, sans-serif;
         background-color: #020617;
       }
       ```

       The body color #020617 matches `space-950` from tailwind.config.js so there's no flash of unstyled white before React mounts.

    Why this order: App.jsx wires together all Task 1 components and is the user-facing payload. The CSS body rule is a small safety net so first-paint already feels right. `npm run build` in <verify> here is the end-of-plan smoke test — it covers everything Task 1 produced plus the App wiring in one shot.
  </action>
  <verify>
    <automated>grep -q "useState" src/App.jsx && grep -q "import TabBar" src/App.jsx && grep -q "import StarField" src/App.jsx && grep -q "import MarsTab" src/App.jsx && grep -q "import MoonTab" src/App.jsx && grep -q "DEFAULT_TAB" src/App.jsx && grep -q "font-sans" src/App.jsx && grep -q "activeTab === TABS.MARS.id" src/App.jsx && grep -q "activeTab === TABS.MOON.id" src/App.jsx && grep -q "z-10" src/App.jsx && grep -q "max-w-6xl" src/App.jsx && grep -q "sm:px-6" src/App.jsx && grep -q "font-family: 'Inter'" src/index.css && grep -q "background-color: #020617" src/index.css && ! grep -q "href=" src/App.jsx && ! grep -q "<a " src/App.jsx && npm run build</automated>
  </verify>
  <acceptance_criteria>
    - `src/App.jsx` imports `useState` from react and uses it to hold `activeTab`
    - `src/App.jsx` imports `TabBar`, `StarField`, `MarsTab`, `MoonTab`, and `TABS`/`DEFAULT_TAB` from the Task 1 files
    - `src/App.jsx` renders `<StarField />` and `<TabBar activeTab={activeTab} onTabChange={setActiveTab} />`
    - `src/App.jsx` conditionally renders `<MarsTab />` and `<MoonTab />` based on `activeTab === TABS.MARS.id` / `activeTab === TABS.MOON.id`
    - `src/App.jsx` applies `font-sans` to the root wrapper (so Inter cascades app-wide)
    - `src/App.jsx` uses `max-w-6xl` and responsive padding `px-4 sm:px-6 md:px-8` (desktop-first with mobile fallback)
    - `src/App.jsx` does NOT contain `<a ` or `href=` — tab switching is state-only, no routes
    - `src/index.css` contains `font-family: 'Inter'` and `background-color: #020617`
    - `npm run build` exits with code 0 — end-of-plan smoke test confirming Task 1 components + Task 2 wiring compile together
    - `npm run dev` starts and serves the page without errors
  </acceptance_criteria>
  <done>App.jsx renders the full shell: header, star-field background, tab bar, and active tab panel. Inter typography cascades from html/body. Responsive padding works from narrow viewports to desktop. Tab switching is instant and pure-state. Production build succeeds.</done>
</task>

<task type="checkpoint:human-verify" gate="blocking">
  <name>Task 3: Visual verification of the shell</name>
  <read_first>
    - .planning/REQUIREMENTS.md (SHELL-01..05)
    - .planning/ROADMAP.md (Phase 1 Success Criteria)
  </read_first>
  <what-built>
    A two-tab dark cinematic shell:
    - Star-field background applied behind both tabs
    - Inter sans-serif typography app-wide
    - Two prominent tabs (Mars / Moon) with palette-aware active styling
    - State-only tab switching (instant, no route reload)
    - Responsive padding; narrow viewport renders single-column fallback
    - Empty MarsTab / MoonTab placeholders (data lands in Phase 3 / 4)
  </what-built>
  <how-to-verify>
    1. Run `npm run dev` and open the printed local URL (typically http://localhost:5173) in a browser.
    2. Console shows no 404 errors. No red errors in the browser console; a hard React/module error is disqualifying.
    3. **SHELL-03 (star-field):** The page background is deep black with a faint, evenly-distributed dot pattern visible — subtle, not loud. The dots should not visually compete with the tab content.
    4. **SHELL-04 (typography):** The "Planetary Conditions" headline renders in Inter (clean technical sans-serif). On a system without Inter installed, the Google Fonts CDN load should still kick in. Hard-refresh and confirm the typeface looks right (not Times New Roman, not the OS default serif).
    5. **SHELL-01 + SHELL-02 (tab styling + instant switch):**
       - On first paint, the Mars tab is active. The active Mars button has a warm reddish background (`bg-mars-700` = #991b1b) with an amber accent border (#f59e0b). The Moon button is muted slate.
       - Click the Moon button. The Moon button becomes active with a cool slate-dark background (`bg-moon-800` = #1e293b) and a silver accent border (#cbd5e1). The Mars button becomes muted.
       - The switch is instant — no page flash, no spinner, no URL change.
       - Click back to Mars — same instant behavior.
    6. **SHELL-05 (responsive baseline):** Open browser devtools, switch to a narrow viewport (e.g., 375px iPhone SE). Confirm:
       - The TabBar collapses to vertical (Mars on top, Moon below) instead of side-by-side.
       - Content is not horizontally scrolling.
       - Tab buttons remain clickable and the active tab is still clearly distinct.
       - Text wraps cleanly; no element overflows the viewport.
    7. Resize back to desktop (e.g., 1280px wide). Confirm the layout returns to a single-column max-w-6xl centered layout with the TabBar horizontal.

    If any item fails, report which one and stop — do not paper over visual regressions.
  </how-to-verify>
  <acceptance_criteria>
    - All seven verification points pass
    - No console errors (including no 404s) that would indicate a broken module import, missing asset, or runtime crash
    - User explicitly confirms tab switching is instant and palette-distinct
  </acceptance_criteria>
  <resume-signal>Type "approved" to finalize Phase 1, or describe specific visual issues (e.g., "star-field too bright", "Mars button color wrong", "narrow viewport breaks at 400px") so they can be fixed before close.</resume-signal>
</task>

</tasks>

<verification>
End-to-end phase verification:

1. `npm run build` exits 0; bundle in `dist/`
2. `npm run dev` serves the shell at localhost with no console errors (including no 404s)
3. Grep checks:
   - `grep -rn "import.*tabs.js" src/components/TabBar.jsx` → matches (TabBar reads constants)
   - `grep -rn "<StarField" src/App.jsx` → matches (StarField rendered)
   - `grep -rn "onTabChange=" src/App.jsx` → matches (App wires setActiveTab to TabBar)
   - `! grep -rn "href=" src/App.jsx src/components/TabBar.jsx` → no anchors / routes
4. Manual checkpoint (Task 3) confirms the visual deliverables.
</verification>

<success_criteria>
- [ ] `src/constants/tabs.js` defines Mars/Moon tab metadata as single source of truth
- [ ] `src/components/TabBar.jsx` renders palette-aware tabs with `role="tablist"` + `aria-selected`
- [ ] `src/components/StarField.jsx` paints a fixed-position, low-opacity dot field over `bg-space-950`
- [ ] `src/tabs/MarsTab.jsx` and `src/tabs/MoonTab.jsx` exist as empty `role="tabpanel"` placeholders
- [ ] `src/App.jsx` holds tab state with `useState`, conditionally renders the active tab, and applies Inter via `font-sans`
- [ ] Tab switching is state-only (no `<a>`, no `href`, no router) — instant
- [ ] Responsive padding and TabBar `flex-col sm:flex-row` give a working narrow-viewport fallback
- [ ] `npm run build` succeeds
- [ ] Visual checkpoint (Task 3) is approved by the user
</success_criteria>

<output>
After completion, create `.planning/phases/01-scaffold-shell/01-02-SUMMARY.md` capturing:
- Final tab-styling decisions (any palette tweaks made during the visual checkpoint)
- Any responsive-layout adjustments made during Task 3 feedback
- Notes for Phase 2 (Shared UI Primitives): file locations, where Phase 2 should expect to import the active-tab context, anything Phase 3 / 4 should know about MarsTab / MoonTab placeholder shape
</output>
</content>
</invoke>