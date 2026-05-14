---
name: meeting-synthesis
description: Use this skill when turning meeting notes into actions and decisions.
---

# Meeting Synthesis

Extract what matters from meetings: decisions, actions, key points.

## Core Principle

**The value of a meeting is what changes afterward.**

## Structure

```
1. Summary      → 2-3 sentences: what happened
2. Decisions    → What was decided (most important)
3. Actions      → Who does what by when
4. Discussion   → Key points, open questions
```

## Action Item Format

Every action needs three things:

```
- [ ] [What] — **[Who]** by [When]
```

**Examples:**
- [ ] Draft proposal — **@alice** by Friday
- [ ] Review budget — **@bob** by EOD Monday

## Quick Format

```markdown
# [Meeting Topic] — [Date]

**Attendees:** [Names]

## Summary
[2-3 sentences]

## Decisions
1. **[Decision]** — [Brief rationale]

## Actions
- [ ] [Task] — **[Owner]** by [Date]

## Key Discussion
[Important points, open questions]
```

## Rules

- **Send within 24 hours** — Notes lose value fast
- **Every action has an owner** — No orphans
- **Every action has a date** — No "soon"
- **Synthesis ≤ meeting time** — Don't over-document

## Anti-Patterns

- **Transcript** — Writing everything said → Synthesize instead
- **Orphan action** — "Follow up on X" with no owner/date
- **Hidden decision** — Buried in paragraph 5 → Pull into Decisions section
