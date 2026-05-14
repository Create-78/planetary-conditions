---
name: decision-docs
description: Use this skill when documenting decisions with rationale. Captures why, not just what.
---

# Decision Documentation

Document decisions so future readers understand why, not just what.

## Core Principle

**A decision doc answers: "Why did they do it this way?"**

## Structure

```
1. Title & Status   → What decision, current state
2. Context          → Why now? What problem?
3. Options          → What alternatives? (include "do nothing")
4. Decision         → What was chosen?
5. Rationale        → Why this over others?
6. Consequences     → What follows?
```

## When to Document

Document when:
- Affects multiple people
- Hard to reverse
- Involves meaningful tradeoffs
- Someone might ask "why?" later

## Quick Format

```markdown
# Decision: [Title]

**Status:** Accepted | **Date:** [Date] | **Decider:** [Name]

## Context
[Why this decision is needed — 2-3 sentences]

## Options
1. **[Option A]** — [One sentence]
2. **[Option B]** — [One sentence]
3. **Do nothing** — [What happens]

## Decision
We will [specific choice].

## Rationale
[Why this option over others — key reasons]

## Next Steps
- [ ] [Action] — [Owner] by [Date]
```

## Anti-Patterns

- **No rationale** — "We decided X" without why
- **Strawman options** — Only listing bad alternatives
- **Missing context** — Decision without "why now"
