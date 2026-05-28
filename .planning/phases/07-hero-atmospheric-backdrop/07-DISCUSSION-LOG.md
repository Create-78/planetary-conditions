# Phase 7: Hero + Atmospheric Backdrop - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-28
**Phase:** 07-hero-atmospheric-backdrop
**Areas discussed:** Image provenance & credit, Hero framing/crop, Backdrop intensity, Data panel over backdrop

---

## Image provenance & credit

| Option | Description | Selected |
|--------|-------------|----------|
| Real imagery + subtle credit | Real photos / NASA public-domain; small credit caption | |
| Real imagery, no caption | Real imagery, decorative, no credit line | |
| AI/stylized — label it | AI/artistic renders; add 'artist's impression' label so it never reads as live data | ✓ |

**User's choice:** AI/stylized — label it
**Notes:** Images are AI-generated/artistic. Must be labeled to preserve the "real data, clearly explained" ethos. Drives alt text too.

---

## Hero framing/crop

| Option | Description | Selected |
|--------|-------------|----------|
| Center-crop tight | Body fills the ~16/7 frame (object-cover, centered) | ✓ |
| Full disc with breathing room | Whole body with negative space (object-contain) | |
| You decide | Pick during implementation | |

**User's choice:** Center-crop tight
**Notes:** Bold/cinematic over portrait-with-space.

---

## Backdrop intensity

| Option | Description | Selected |
|--------|-------------|----------|
| Near-black whisper | Heavy blur + ~20-25% brightness; safest for contrast | |
| Subtle visible presence | Moderate blur + ~35-40% brightness; recognizable body | ✓ |
| You decide | Tune during implementation | |

**User's choice:** Subtle visible presence
**Notes:** More immersive; tighter contrast headroom. Governed by the HERO-04 legibility guardrail.

---

## Data panel over backdrop

| Option | Description | Selected |
|--------|-------------|----------|
| Fully opaque | Solid/blur panel, max contrast | |
| Slight glass translucency | Backdrop subtly bleeds through (glassmorphism) | ✓ |
| You decide | Choose based on legibility test | |

**User's choice:** Slight glass translucency
**Notes:** Immersive; small contrast risk. Combined with "subtle visible presence" backdrop, legibility must be verified — HERO-04 wins if it conflicts (CONTEXT D-06/D-08).

---

## Claude's Discretion

- Label wording/placement/styling; LQIP technique; exact blur/brightness values within envelope; component file structure.

## Deferred Ideas

- Motion/cross-fade/parallax → Phase 8. Card/type refresh → Phase 9. Real (non-AI) imagery → out of scope unless stylized direction tests poorly.
