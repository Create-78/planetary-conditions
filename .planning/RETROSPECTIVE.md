# Retrospective — Planetary Conditions

## Milestone: v1.0 — MVP

**Shipped:** 2026-05-28
**Phases:** 6 | **Plans:** 15 | **Commits:** 84 | **src:** ~1,954 LOC

### What Was Built
A live, cinematic Mars/Moon conditions dashboard from real NASA/NOAA APIs: scaffold + shell, a shared UI primitive library, a Mars tab (Curiosity REMS), a three-section Moon tab (lunar context, NOAA solar wind + radiation badge, NASA DONKI alerts), reliability/UX polish, and a Vercel production deployment.

### What Worked
- **Foundation-first phasing.** Primitives (Phase 2) before data tabs (3–4) meant the cardState/loading/error pattern was reused cleanly across both tabs — zero rework.
- **Phase-per-shippable-slice.** Each phase reached prod-ready independently; the Mars tab was demoable before the Moon tab existed.
- **UAT caught the real bugs.** The two genuine defects (MAAS2 prod CORS, NOAA Kp array-of-objects crash) only surfaced against live data — exactly what `/gsd-verify-work` is for. Neither was visible in local warm-state dev.
- **Honest data discipline.** "Estimated" labels, per-card freshness, and graceful "Data temporarily unavailable" states held up under real outages.

### What Was Inefficient
- **Verification chain left open.** Phases 1–5 shipped with `VERIFICATION.md` at `human_needed` and human-UAT `partial`, and `requirements-completed` frontmatter was never populated — so the milestone audit had to reconstruct coverage from three lagging sources instead of reading clean state.
- **Traceability drift.** The REQUIREMENTS list checkboxes (`[x]`) and the traceability table status column diverged (15 rows stuck "Pending") — pure bookkeeping debt that needed a cleanup pass at close.
- **No nyquist validation** despite the feature being enabled — never run on any phase.

### Patterns Established
- Edge-proxy pattern for CORS-less upstreams (`api/maas2.js`) — reusable for any future blocked source.
- Per-endpoint parse strategy (tabular vs array-of-objects) inside one data hook.
- `node:test` + `npm test` (zero-dep, Node built-in) introduced in v1.0 — TDD path now exists for v2.

### Key Lessons
1. **Close the verification loop per phase, not at milestone end.** Flip requirement status and resolve VERIFICATION/UAT during `/gsd-transition`, or the audit inherits the debt.
2. **Assume upstream shapes vary.** Both data bugs were "the API isn't shaped like we assumed." Validate live response shapes during phase work, not at deploy.
3. **A live, verified MVP justifies accepting process debt** — backfilling human-UAT/nyquist retroactively is low-value; record and move on.

### Cost Observations
- Sessions: multiple over 14 days (2026-05-14 → 2026-05-28).
- Model mix: GSD profile "balanced" (opus planning/orchestration, sonnet checkers).
- Notable: the heaviest single spend was the milestone integration check + audit; the bug fixes were cheap because UAT localized them precisely.

---

## Cross-Milestone Trends

| Milestone | Phases | Plans | Commits | Verdict | Notable debt |
|-----------|--------|-------|---------|---------|--------------|
| v1.0 MVP | 6 | 15 | 84 | tech_debt | process (UAT/verification/nyquist), SWPC fragility → v2 |
