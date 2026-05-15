---
phase: 02-shared-ui-primitives
plan: 03
type: execute
wave: 3
depends_on:
  - 02-01
  - 02-02
files_modified:
  - src/tabs/MarsTab.jsx
  - src/tabs/MoonTab.jsx
autonomous: true
requirements:
  - UI-01
  - UI-02
  - UI-03
  - UI-04
  - UI-05
  - UI-06
  - UI-07
tags: [ui, demo, gallery, tabs, integration]

must_haves:
  truths:
    - "Opening the Mars tab shows a gallery of every Phase 2 primitive — DataCard (ok/loading/error), TooltipWrapper (on hover), StatusBadge (low/moderate/high), AlertCard (CME/FLR/GST), LastUpdated (just-now/3-mins/2-hours/undefined)"
    - "Opening the Moon tab shows the same gallery but with palette='moon' on DataCards and LastUpdated"
    - "Hovering any DataCard tooltip trigger surfaces text from constants/tooltips.js (mars.example or moon.example)"
    - "DataCard with state='loading' renders a skeleton while neighbour cards render normally — proving per-card independence"
    - "DataCard with state='error' renders 'Data temporarily unavailable' inline, not a full-page error"
    - "Hovering a LastUpdated chip surfaces an absolute UTC time"
    - "npm run build exits 0 — production bundle compiles cleanly"
  artifacts:
    - path: "src/tabs/MarsTab.jsx"
      provides: "Mars-palette demo gallery rendering every Phase 2 primitive"
      contains: "import DataCard"
    - path: "src/tabs/MoonTab.jsx"
      provides: "Moon-palette demo gallery rendering every Phase 2 primitive"
      contains: "import DataCard"
  key_links:
    - from: "src/tabs/MarsTab.jsx"
      to: "src/components/{DataCard,StatusBadge,AlertCard,LastUpdated}.jsx"
      via: "imports + JSX composition"
      pattern: "from ['\"].*(DataCard|StatusBadge|AlertCard|LastUpdated)"
    - from: "src/tabs/MoonTab.jsx"
      to: "src/components/{DataCard,StatusBadge,AlertCard,LastUpdated}.jsx"
      via: "imports + JSX composition"
      pattern: "from ['\"].*(DataCard|StatusBadge|AlertCard|LastUpdated)"
---

<objective>
Replace the Phase 1 MarsTab.jsx and MoonTab.jsx placeholder text with prop-driven demo galleries showcasing every Phase 2 primitive in every state. This proves end-to-end integration of the foundation (Plan 01) + composites (Plan 02) and gives Phase 3/4 a visible reference for how to compose primitives against real data.

Purpose: Validate the full primitive library renders without errors, satisfies all 5 phase success criteria visibly, and produces a clean production build. The demos are intentional scaffolding — Phase 3 (Mars data) and Phase 4 (Moon data) will REPLACE these galleries with real React Query-driven content.

Output: 2 modified files (MarsTab.jsx, MoonTab.jsx). No new components. A passing `npm run build`.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/STATE.md
@.planning/phases/02-shared-ui-primitives/02-CONTEXT.md
@.planning/phases/02-shared-ui-primitives/02-01-foundation-primitives-SUMMARY.md
@.planning/phases/02-shared-ui-primitives/02-02-composite-primitives-SUMMARY.md
@Discussion.md
@src/tabs/MarsTab.jsx
@src/tabs/MoonTab.jsx
@src/components/DataCard.jsx
@src/components/StatusBadge.jsx
@src/components/AlertCard.jsx
@src/components/LastUpdated.jsx
@src/constants/tooltips.js

<interfaces>
<!-- All four composite primitives — default exports from Plan 02 -->

`DataCard`: `function DataCard({ label, value, unit, tooltipKey, state = 'ok', palette })`
  - state: 'ok' | 'loading' | 'error'
  - palette: 'mars' | 'moon'

`StatusBadge`: `function StatusBadge({ severity, label, value, tooltipKey })`
  - severity: 'low' | 'moderate' | 'high'

`AlertCard`: `function AlertCard({ eventType, timeUtc, severity, description, tooltipKey })`
  - eventType: 'CME' | 'FLR' | 'GST'

`LastUpdated`: `function LastUpdated({ timestamp, prefix = 'Last updated', palette = 'neutral' })`
  - timestamp: Date | string | null | undefined

<!-- Phase 1 MarsTab/MoonTab current state (about to be replaced) -->

Both files currently render a placeholder:
```jsx
<section role="tabpanel" aria-label="Mars conditions" className="text-mars-50">
  <h2>Mars</h2>
  <p>Curiosity rover surface data lands here in Phase 3.</p>
</section>
```

The `<section role="tabpanel">` wrapper must be preserved (App.jsx already places these inside the rounded-lg content panel; the tabpanel role is the accessibility contract).

<!-- Seeded tooltip keys available from Plan 01 -->
- `'mars.example'` — Mars atmosphere comparison
- `'moon.example'` — Moon temperature swing
- `'swpc.radiationRisk'` — Radiation risk derivation explainer
- `'donki.cme'` — CME explainer
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Replace MarsTab.jsx with a Mars-palette demo gallery of every Phase 2 primitive</name>
  <files>src/tabs/MarsTab.jsx</files>
  <read_first>
    - .planning/phases/02-shared-ui-primitives/02-CONTEXT.md (LOCKED — `## Demo / verification approach` section)
    - .planning/phases/02-shared-ui-primitives/02-02-composite-primitives-SUMMARY.md (exact composite prop shapes)
    - src/tabs/MarsTab.jsx (the file being overwritten — preserve the tabpanel wrapper)
    - src/components/DataCard.jsx (confirm palette prop accepted values)
    - src/constants/tooltips.js (confirm `'mars.example'`, `'swpc.radiationRisk'`, `'donki.cme'` keys exist)
  </read_first>
  <action>
    Completely rewrite `src/tabs/MarsTab.jsx` (do NOT preserve placeholder copy — replace it). Default export at bottom.

    **Imports (at top):**
    ```jsx
    import DataCard from '../components/DataCard.jsx'
    import StatusBadge from '../components/StatusBadge.jsx'
    import AlertCard from '../components/AlertCard.jsx'
    import LastUpdated from '../components/LastUpdated.jsx'
    ```

    **Compute demo timestamps once at module scope (above the component function) so they don't drift on re-render:**
    ```jsx
    const NOW = new Date()
    const TS_JUST_NOW = new Date(NOW.getTime() - 5 * 1000)               // 5 seconds ago
    const TS_3_MIN_AGO = new Date(NOW.getTime() - 3 * 60 * 1000)         // 3 minutes ago
    const TS_2_HR_AGO = new Date(NOW.getTime() - 2 * 60 * 60 * 1000)     // 2 hours ago
    const TS_CME_DEMO = new Date(NOW.getTime() - 3 * 60 * 60 * 1000).toISOString() // 3 hours ago — per CONTEXT `## Specific Ideas`
    ```

    **Structure (preserve `<section role="tabpanel">` wrapper):**

    ```jsx
    <section role="tabpanel" aria-label="Mars conditions" className="text-mars-50 space-y-8">
      <header>
        <h2 className="text-2xl font-bold mb-1">Mars — Primitive Demo Gallery</h2>
        <p className="text-mars-50/60 text-sm">
          Every Phase 2 primitive rendered in every state. Replaced with live Curiosity REMS data in Phase 3.
        </p>
      </header>

      {/* Section 1: DataCard states */}
      <section aria-label="DataCard states">
        <h3 className="text-sm uppercase tracking-wider text-slate-400 mb-3">DataCard — ok / loading / error</h3>
        <div className="flex flex-wrap gap-4">
          <DataCard label="Min Temp" value="-78" unit="°C" tooltipKey="mars.example" state="ok" palette="mars" />
          <DataCard label="Max Temp" value="-12" unit="°C" tooltipKey="mars.example" state="ok" palette="mars" />
          <DataCard label="Pressure" value="745" unit="Pa" tooltipKey="mars.example" state="ok" palette="mars" />
          <DataCard label="Wind Speed" value={null} unit="m/s" state="loading" palette="mars" />
          <DataCard label="Humidity" value={null} unit="%" state="error" palette="mars" />
        </div>
      </section>

      {/* Section 2: StatusBadge severities */}
      <section aria-label="StatusBadge severities">
        <h3 className="text-sm uppercase tracking-wider text-slate-400 mb-3">StatusBadge — low / moderate / high</h3>
        <div className="flex flex-wrap items-center gap-6">
          <StatusBadge severity="low" label="Dust Risk" value="Low" tooltipKey="swpc.radiationRisk" />
          <StatusBadge severity="moderate" label="Dust Risk" value="Moderate" tooltipKey="swpc.radiationRisk" />
          <StatusBadge severity="high" label="Dust Risk" value="High" tooltipKey="swpc.radiationRisk" />
        </div>
      </section>

      {/* Section 3: AlertCard event types */}
      <section aria-label="AlertCard event types">
        <h3 className="text-sm uppercase tracking-wider text-slate-400 mb-3">AlertCard — CME / FLR / GST</h3>
        <div className="flex flex-col gap-2 max-w-2xl">
          <AlertCard eventType="CME" timeUtc={TS_CME_DEMO} severity="Halo CME" description="Earth-directed plasma cloud" tooltipKey="donki.cme" />
          <AlertCard eventType="FLR" timeUtc={TS_CME_DEMO} severity="M2.3" description="Mid-class solar flare" />
          <AlertCard eventType="GST" timeUtc={TS_CME_DEMO} severity="G2" description="Moderate geomagnetic storm" />
        </div>
      </section>

      {/* Section 4: LastUpdated time variants */}
      <section aria-label="LastUpdated variants">
        <h3 className="text-sm uppercase tracking-wider text-slate-400 mb-3">LastUpdated — just now / 3 mins / 2 hours / undefined</h3>
        <div className="flex flex-wrap items-center gap-6">
          <LastUpdated timestamp={TS_JUST_NOW} palette="mars" />
          <LastUpdated timestamp={TS_3_MIN_AGO} palette="mars" />
          <LastUpdated timestamp={TS_2_HR_AGO} palette="mars" />
          <LastUpdated timestamp={undefined} palette="mars" />
        </div>
      </section>
    </section>
    ```

    Default export at bottom: `export default MarsTab`.

    **Constraints (per 02-CONTEXT.md):**
    - All DataCards use `palette="mars"` (per the locked decision that palette drives accent only).
    - All LastUpdated calls pass `palette="mars"` (per CONTEXT — dim text matches body palette).
    - At minimum one DataCard with `state="loading"` and one with `state="error"` MUST appear (proves per-card state independence).
    - All three StatusBadge severities MUST appear (low/moderate/high).
    - All three AlertCard event types MUST appear (CME/FLR/GST).
    - All four LastUpdated time variants MUST appear (just-now, 3 mins, 2 hours, undefined).
  </action>
  <verify>
    <automated>grep -q "export default MarsTab" src/tabs/MarsTab.jsx && grep -q "import DataCard" src/tabs/MarsTab.jsx && grep -q "import StatusBadge" src/tabs/MarsTab.jsx && grep -q "import AlertCard" src/tabs/MarsTab.jsx && grep -q "import LastUpdated" src/tabs/MarsTab.jsx && grep -qE 'state="ok"' src/tabs/MarsTab.jsx && grep -qE 'state="loading"' src/tabs/MarsTab.jsx && grep -qE 'state="error"' src/tabs/MarsTab.jsx && grep -qE 'severity="low"' src/tabs/MarsTab.jsx && grep -qE 'severity="moderate"' src/tabs/MarsTab.jsx && grep -qE 'severity="high"' src/tabs/MarsTab.jsx && grep -qE 'eventType="CME"' src/tabs/MarsTab.jsx && grep -qE 'eventType="FLR"' src/tabs/MarsTab.jsx && grep -qE 'eventType="GST"' src/tabs/MarsTab.jsx && grep -qE 'palette="mars"' src/tabs/MarsTab.jsx && grep -q 'role="tabpanel"' src/tabs/MarsTab.jsx && ! grep -q "Phase 3" src/tabs/MarsTab.jsx</automated>
  </verify>
  <done>
    - `src/tabs/MarsTab.jsx` has been rewritten — no Phase 1 placeholder copy remains.
    - All four composite components imported.
    - `<section role="tabpanel">` accessibility wrapper preserved.
    - DataCard appears in all three states (`'ok'`, `'loading'`, `'error'`).
    - StatusBadge appears with all three severities.
    - AlertCard appears with all three event types.
    - LastUpdated appears with timestamps: just-now (5s), 3 mins, 2 hours, undefined.
    - All instances use `palette="mars"` where applicable.
  </done>
</task>

<task type="auto">
  <name>Task 2: Replace MoonTab.jsx with a Moon-palette demo gallery + final npm run build verification</name>
  <files>src/tabs/MoonTab.jsx</files>
  <read_first>
    - .planning/phases/02-shared-ui-primitives/02-CONTEXT.md (LOCKED — same `## Demo / verification approach` section)
    - src/tabs/MoonTab.jsx (file being overwritten — preserve tabpanel wrapper)
    - src/tabs/MarsTab.jsx (the just-rewritten Mars gallery — mirror its structure with palette swapped to moon)
    - src/constants/tooltips.js (confirm `'moon.example'` and other keys still present)
  </read_first>
  <action>
    Completely rewrite `src/tabs/MoonTab.jsx`. Structure mirrors `MarsTab.jsx` exactly — same four sections, same demo states — but with **palette swapped to moon** and **tooltip keys swapped to moon-relevant**.

    **Imports:** same four components.

    **Module-scope timestamps:** same as MarsTab — `NOW`, `TS_JUST_NOW`, `TS_3_MIN_AGO`, `TS_2_HR_AGO`, `TS_CME_DEMO`.

    **Wrapper:**
    ```jsx
    <section role="tabpanel" aria-label="Moon conditions" className="text-moon-50 space-y-8">
    ```

    **Header copy:**
    ```jsx
    <h2 className="text-2xl font-bold mb-1">Moon — Primitive Demo Gallery</h2>
    <p className="text-moon-50/60 text-sm">
      Every Phase 2 primitive rendered in every state. Replaced with live SWPC + DONKI + lunar data in Phase 4.
    </p>
    ```

    **Section 1 — DataCards (palette="moon"):**
    ```jsx
    <DataCard label="Phase" value="Waxing Crescent" tooltipKey="moon.example" state="ok" palette="moon" />
    <DataCard label="Surface Temp" value="-120" unit="°C" tooltipKey="moon.example" state="ok" palette="moon" />
    <DataCard label="Solar Wind" value="412" unit="km/s" tooltipKey="swpc.radiationRisk" state="ok" palette="moon" />
    <DataCard label="Bz" value={null} unit="nT" state="loading" palette="moon" />
    <DataCard label="Kp Index" value={null} state="error" palette="moon" />
    ```

    **Section 2 — StatusBadge (severities — same as Mars):**
    ```jsx
    <StatusBadge severity="low" label="Radiation Risk" value="Low" tooltipKey="swpc.radiationRisk" />
    <StatusBadge severity="moderate" label="Radiation Risk" value="Moderate" tooltipKey="swpc.radiationRisk" />
    <StatusBadge severity="high" label="Radiation Risk" value="High" tooltipKey="swpc.radiationRisk" />
    ```

    **Section 3 — AlertCard (all three event types — same as Mars):**
    ```jsx
    <AlertCard eventType="CME" timeUtc={TS_CME_DEMO} severity="Halo CME" description="Earth-directed plasma cloud" tooltipKey="donki.cme" />
    <AlertCard eventType="FLR" timeUtc={TS_CME_DEMO} severity="M2.3" description="Mid-class solar flare" />
    <AlertCard eventType="GST" timeUtc={TS_CME_DEMO} severity="G2" description="Moderate geomagnetic storm" />
    ```

    **Section 4 — LastUpdated (palette="moon"):**
    ```jsx
    <LastUpdated timestamp={TS_JUST_NOW} palette="moon" />
    <LastUpdated timestamp={TS_3_MIN_AGO} palette="moon" />
    <LastUpdated timestamp={TS_2_HR_AGO} palette="moon" />
    <LastUpdated timestamp={undefined} palette="moon" />
    ```

    Use the same section H3 labels as MarsTab (`"DataCard — ok / loading / error"`, etc.).

    Default export at bottom: `export default MoonTab`.

    **After writing the file, run the production build to prove the full primitive library compiles cleanly:**
    ```bash
    npm run build
    ```
    The build MUST exit 0. If it fails, fix the failing import/JSX issue (typically a missing prop type or a malformed Tailwind class) before declaring done. This is the only task in Phase 2 that runs `npm run build` — earlier tasks rely on grep-level verification because the build only becomes meaningful once all primitives are wired into a renderable tree.
  </action>
  <verify>
    <automated>grep -q "export default MoonTab" src/tabs/MoonTab.jsx && grep -q "import DataCard" src/tabs/MoonTab.jsx && grep -q "import StatusBadge" src/tabs/MoonTab.jsx && grep -q "import AlertCard" src/tabs/MoonTab.jsx && grep -q "import LastUpdated" src/tabs/MoonTab.jsx && grep -qE 'state="ok"' src/tabs/MoonTab.jsx && grep -qE 'state="loading"' src/tabs/MoonTab.jsx && grep -qE 'state="error"' src/tabs/MoonTab.jsx && grep -qE 'severity="low"' src/tabs/MoonTab.jsx && grep -qE 'severity="moderate"' src/tabs/MoonTab.jsx && grep -qE 'severity="high"' src/tabs/MoonTab.jsx && grep -qE 'eventType="CME"' src/tabs/MoonTab.jsx && grep -qE 'eventType="FLR"' src/tabs/MoonTab.jsx && grep -qE 'eventType="GST"' src/tabs/MoonTab.jsx && grep -qE 'palette="moon"' src/tabs/MoonTab.jsx && grep -q 'role="tabpanel"' src/tabs/MoonTab.jsx && ! grep -q "Phase 4" src/tabs/MoonTab.jsx && npm run build</automated>
  </verify>
  <done>
    - `src/tabs/MoonTab.jsx` rewritten — no Phase 1 placeholder copy remains.
    - All four composite components imported.
    - `<section role="tabpanel">` wrapper preserved.
    - DataCard appears in all three states.
    - StatusBadge appears with all three severities.
    - AlertCard appears with all three event types.
    - LastUpdated appears with all four time variants.
    - All instances use `palette="moon"` where applicable.
    - `npm run build` exits 0 — production bundle compiles successfully.
  </done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| Demo data -> primitives | All demo values are hardcoded strings/numbers in this plan's source — no external input. No trust boundary crossed in Phase 2. Phase 3/4 will introduce the API -> component boundary. |

## STRIDE Threat Register

| Threat ID | Category | Component | Disposition | Mitigation Plan |
|-----------|----------|-----------|-------------|-----------------|
| T-02-08 | Information Disclosure | Demo content | accept | Demo values (`-78 °C`, `Waxing Crescent`, `Halo CME`) are illustrative public-domain numbers. No PII, no secrets, no real telemetry. |
| T-02-09 | Tampering | Demo galleries -> primitives | accept | All primitive prop inputs are author-controlled string literals in source; no runtime injection surface. |
</threat_model>

<verification>
End-to-end gates:
- `npm run build` exits 0 (final task verify).
- `grep -E "DataCard|StatusBadge|AlertCard|LastUpdated" src/tabs/MarsTab.jsx | wc -l` >= 4 (every primitive referenced).
- `grep -E "DataCard|StatusBadge|AlertCard|LastUpdated" src/tabs/MoonTab.jsx | wc -l` >= 4.
- No Phase 1 placeholder copy survives: `! grep -E "Curiosity rover surface data lands here|Lunar context, solar wind, and event alerts land here" src/tabs/*.jsx`.
</verification>

<success_criteria>
All five Phase 2 ROADMAP success criteria are visibly demonstrable after this plan:
1. **Tooltip with Earth comparison**: hovering any `mars.example` / `moon.example` DataCard surfaces the seeded explainer text.
2. **"Last updated X mins ago"**: four LastUpdated chips per tab render `just now`, `3 mins ago`, `2 hours ago`, `—`.
3. **Independent per-card skeleton**: the `state="loading"` DataCard in section 1 renders a skeleton while its neighbours render real values — same row, same render pass, no neighbour blanking.
4. **Colored status badges + alert cards**: section 2 shows green/amber/red badges side-by-side; section 3 shows indigo/orange/fuchsia event-type badges side-by-side.
5. **tooltips.js single source-of-truth**: every tooltipKey passed is a string referencing `src/constants/tooltips.js` — changing the text there changes it everywhere. (Verified by Plan 01's grep checks; this plan consumes the contract.)

Plus: `npm run build` passes — the entire primitive library + demo galleries compile cleanly.
</success_criteria>

<output>
After completion, create `.planning/phases/02-shared-ui-primitives/02-03-demo-galleries-SUMMARY.md` documenting:
- The exact demo content rendered in each tab (so Phase 3/4 know what they're replacing).
- The production build size delta vs Phase 1's 174.38 kB baseline.
- Visual coverage: which primitive + which state appears in which tab section.
- Confirmation that all five Phase 2 ROADMAP success criteria are met.
</output>
