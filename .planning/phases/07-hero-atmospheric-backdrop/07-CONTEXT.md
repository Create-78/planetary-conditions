# Phase 7: Hero + Atmospheric Backdrop - Context

**Gathered:** 2026-05-28
**Status:** Ready for planning

<domain>
## Phase Boundary

Deliver, on both tabs: (1) a sharp, framed hero image of the active body between the tab toggle and the data panel, and (2) a treated full-bleed atmospheric backdrop of that body behind the page — fed by a committed, pre-optimized image pipeline (WebP + PNG fallback + LQIP), without regressing data legibility. Motion/transitions are Phase 8; card/type refresh is Phase 9; this phase is the static layered frame + image pipeline.

Requirements: HERO-01, HERO-02, HERO-03, HERO-04, IMG-01, IMG-02, IMG-03.
</domain>

<decisions>
## Implementation Decisions

### Image provenance & credit (HERO-01)
- **D-01:** The mars/moon images are **AI-generated / stylized renders, not real observational imagery.** They MUST be labeled so they never read as live data — show a small, unobtrusive label on/near the hero such as "Artist's impression" (exact wording at Claude's discretion). This protects the product's "real data, clearly explained" ethos.
- **D-02:** The hero's `alt` text reflects this — e.g., "Mars — artist's impression" (not implying a photograph).
- **D-03:** The label is visual chrome on the hero only; it does not appear on the atmospheric backdrop.

### Hero framing (HERO-01)
- **D-04:** Center-crop tight — the body fills the ~16/7 hero frame edge-to-edge (`object-cover`, centered). Bold/cinematic over portrait-with-negative-space.

### Backdrop intensity (HERO-02)
- **D-05:** "Subtle visible presence" — moderate blur + ~35–40% brightness so the body is recognizable behind the content (more immersive than a near-black whisper).
- **D-06:** **Guardrail:** D-05 and D-08 (glass panel) are the *target* look, but **HERO-04 (no contrast regression / data fully legible) wins.** Backdrop brightness/blur and panel opacity are the tuning levers — if a live contrast check fails, dial the backdrop darker and/or the panel more opaque until data text passes. Verify during execution, do not assume.

### Data panel over backdrop (HERO-04)
- **D-07:** Data panel gets **slight glass translucency** (glassmorphism) so the backdrop subtly bleeds through — building on the existing `bg-slate-950/40 backdrop-blur-sm`, pushed slightly more translucent.
- **D-08:** Subject to the D-06 guardrail — translucency is reduced if legibility suffers.

### Layering & switching (HERO-02, HERO-03)
- **D-09:** Z-order: AtmosphericBackdrop (fixed, `inset-0`, z-0) → StarField (above backdrop, opacity reduced ~40%) → `main` content (z-10). Hero is in-flow between TabBar and the data panel.
- **D-10:** Both backdrop and hero swap with `activeTab` (mars ↔ moon). In Phase 7 the swap is an instant change (cross-fade is Phase 8).

### Image pipeline (IMG-01, IMG-02, IMG-03)
- **D-11:** Pre-optimized committed assets, no new build dependency (generate once with a CLI like cwebp/sharp, document the command). Output per body: ~1600px WebP + same-size PNG fallback + a tiny (~24px) blurred LQIP. Hero uses `<picture>` (WebP + PNG). Backdrop reuses the 1600 WebP via CSS filters (no separate backdrop asset).
- **D-12:** Commit optimized assets under `src/assets/bodies/`; **gitignore the multi-MB source PNGs** (`mars-image.png`, `moon-image.png` at repo root) — never commit the sources.
- **D-13:** LQIP shows instantly and the hero reserves width/height (set dimensions / aspect-ratio) so there is no layout shift (CLS ≈ 0). LQIP delivery (inline base64 vs tiny file) is Claude's discretion.
- **D-14:** Performance budget: added image weight served per tab ≤ ~300 KB on the WebP path. Measure against v1.0's ~211 KB JS baseline.

### Claude's Discretion
- Exact "artist's impression" label wording, placement, and styling.
- LQIP technique (inline data-URI vs separate file).
- Exact blur radius / brightness values within the D-05/D-06 envelope.
- Component file structure (e.g., `AtmosphericBackdrop.jsx`, `BodyHero.jsx`) and where image-asset mapping lives.
</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### v2 design (primary)
- `docs/superpowers/specs/2026-05-28-v2-visual-upgrade-design.md` — The approved v2 spec. Locks the layered layout, component sketch (AtmosphericBackdrop, BodyHero), image-pipeline strategy, asset naming under `src/assets/bodies/`, and the contrast/perf risks. Read first.

### Requirements & roadmap
- `.planning/REQUIREMENTS.md` — HERO-01..04, IMG-01..03 (the 7 requirements this phase satisfies) + v2.0 Out of Scope.
- `.planning/ROADMAP.md` (Phase 7 section) — goal + 5 success criteria (hero placement, backdrop swap, no contrast regression, CLS ≈ 0, optimized assets within budget).

### Reference implementation (v1.0)
- `.planning/milestones/v1.0-phases/` — archived v1.0 phase history (patterns to stay consistent with).

No other external specs — requirements fully captured above.
</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/App.jsx` — Layout owner: `header → TabBar → data panel` inside `<main className="relative z-10 mx-auto max-w-6xl ...">`. `activeTab` state (mars/moon) lives here — the natural place to mount `<AtmosphericBackdrop>` (sibling of StarField) and `<BodyHero>` (between the TabBar div and the data panel div), both driven by `activeTab`.
- `src/components/StarField.jsx` — Existing `fixed inset-0 z-0 pointer-events-none aria-hidden` backdrop. Phase 1 established the z-index contract (content z-10). New AtmosphericBackdrop goes *below* StarField; reduce StarField opacity so both read.
- `src/constants/tabs.js` — `TABS` / `DEFAULT_TAB` ids (mars/moon). Map these ids → body image assets.
- Data panel today: `rounded-lg border border-slate-800/60 bg-slate-950/40 backdrop-blur-sm p-6 md:p-8` — already semi-translucent + blurred, so D-07's glass treatment is a small adjustment, not a rewrite.

### Established Patterns
- Tailwind utility styling throughout; dark cinematic palette; per-body palette (amber/rust Mars, blue/silver Moon) reserved for accents.
- Components are small, single-purpose `.jsx` files under `src/components/`.

### Integration Points
- Source images currently at repo root: `mars-image.png`, `moon-image.png` (2816×1536, ~6 MB each) → optimize into `src/assets/bodies/`, gitignore sources.
- No client router; tab switching is `useState` in App.jsx — image switching keys off the same state.
</code_context>

<specifics>
## Specific Ideas

- Immersive direction chosen deliberately (visible backdrop + glass panel + tight crop), but legibility is non-negotiable (D-06). The executor should treat backdrop brightness and panel opacity as a contrast budget, not fixed values.
- Honesty matters: AI/stylized imagery must be labeled, consistent with how v1.0 labels modeled lunar temperature as "Estimated."
</specifics>

<deferred>
## Deferred Ideas

- Cross-fade / motion on tab switch and hero parallax → **Phase 8** (locked there).
- Card/typography restyle, palette intensification → **Phase 9**.
- Real (non-AI) body imagery or NASA photo integration → out of scope; revisit only if the stylized direction tests poorly.

None of the above are in Phase 7 scope.
</deferred>

---

*Phase: 07-hero-atmospheric-backdrop*
*Context gathered: 2026-05-28*
