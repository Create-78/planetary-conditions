---
phase: 8
slug: motion-transitions
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-05-28
---

# Phase 8 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | npm run build (Vite) + grep/manual |
| **Config file** | vite.config.js (already exists) |
| **Quick run command** | `npm run build` |
| **Full suite command** | `npm run build && grep -r 'reducedMotion\|prefers-reduced-motion\|useScrollParallax' src/` |
| **Estimated runtime** | ~5 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm run build`
- **After every plan wave:** Run full suite command
- **Before `/gsd-verify-work`:** Full suite must be green + human-verify checkpoint passed
- **Max feedback latency:** 10 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 8-01-01 | 01 | 1 | MOTION-03 | — | N/A | grep | `grep -q 'reducedMotion\|prefers-reduced-motion' src/hooks/useScrollParallax.js` | ✅ plan | ⬜ pending |
| 8-01-02 | 01 | 1 | MOTION-01 | — | N/A | grep | `grep -q 'opacity.*activeTab\|activeTab.*opacity' src/components/AtmosphericBackdrop.jsx` | ✅ plan | ⬜ pending |
| 8-01-03 | 01 | 1 | MOTION-02 | — | N/A | grep | `grep -q 'useScrollParallax' src/components/BodyHero.jsx` | ✅ plan | ⬜ pending |
| 8-02-01 | 02 | 2 | MOTION-01,02,03 | — | N/A | build | `npm run build` | ✅ always | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

None — no test framework install required. All verification is grep + build + human-visual.

*Existing infrastructure covers all phase requirements.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Cross-fade reads as smooth (not pop) | MOTION-01 | Visual animation quality | Switch tabs — both backdrop and hero should dissolve, not snap |
| Parallax feels like depth, not jitter | MOTION-02 | Perceptual quality of ~10px scroll effect | Scroll slowly — hero should drift slightly, not jump |
| Cross-fade duration feels right (500ms) | MOTION-01 | Subjective timing preference | Switch tabs — transition should feel snappy but not instant |
| Reduced-motion: instant tab switch | MOTION-03 | Requires OS setting change | Enable "Reduce Motion" in macOS Accessibility → System Settings |
| Reduced-motion: no parallax | MOTION-03 | Same OS setting | Scroll with Reduce Motion enabled — hero should be perfectly static |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 10s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
