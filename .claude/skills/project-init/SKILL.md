---
name: project-init
description: Use this skill when initializing a new project folder. Conducts a brief user interview to populate CLAUDE.md and README.md with project-specific context.
---

# Skill: Project Initialization

How to set up a new project folder by interviewing the user for essential context.

---

## When to Use

Use this skill when:
- A project folder is newly created from the starter-kit
- CLAUDE.md contains TODO placeholders
- The user asks to "set up" or "initialize" the project
- You detect the project summary is still a placeholder

---

## Core Principle

**Gather minimum context to make the project usable, then get out of the way.**

Follow the user-interview skill methodology: ask one question at a time, offer defaults, and stop when you have enough to produce a useful first draft.

---

## The Interview Flow

### Phase 1: Essential Context (3-4 questions max)

These unlock everything else:

1. **What is this project?**
   > "In one sentence, what is this project and what problem does it solve?"

2. **Who is it for?**
   > "Who's the primary user or audience?"

3. **What should Claude help with?**
   > "What are the 2-3 most valuable things Claude could help you do in this project?"

4. **What's off-limits?** (often optional)
   > "Is there anything Claude should NOT do or that requires your explicit approval?"

### Phase 2: Fill the Templates

After gathering answers, populate:

**CLAUDE.md:**
- Project Summary (from Q1 + Q2)
- In Scope (from Q3)
- Out of Scope (from Q4, plus sensible defaults)
- High-Value Tasks (from Q3, expanded)
- Example Prompts (generate from Q3)

**README.md:**
- Project Name
- Brief description (from Q1)
- Status (default: "In Progress")
- Current Priorities (ask if not obvious, or leave as placeholders)

### Phase 3: Confirm and Save

Show the user what you've drafted. Ask:
> "Here's how I've filled out the project files. Does this capture it, or should I adjust anything?"

Make edits, then save.

---

## Question Patterns

Use these patterns from the user-interview skill:

### Offer Defaults
> "I'll assume this is for internal use unless you tell me otherwise. Is that right?"

### Closed Questions
> "Should Claude help with (A) drafting documents, (B) analysis and research, (C) both, or (D) something else?"

### Bundle Assumption + Question
> "It sounds like the main value is faster document drafting. Should I focus the setup on that, or is there something more important?"

---

## What NOT to Ask

Skip questions about:
- File structure (use the default unless they mention something specific)
- Detailed workflows (let these emerge from use)
- Edge cases (handle later)
- Preferences that don't affect setup (tone, format details)

---

## Output Checklist

After the interview, ensure:

- [ ] CLAUDE.md Project Summary is filled (not a TODO)
- [ ] CLAUDE.md In Scope has 2-4 items
- [ ] CLAUDE.md Out of Scope has at least 1 item
- [ ] CLAUDE.md High-Value Tasks lists concrete tasks
- [ ] README.md has project name and description
- [ ] README.md status is set

---

## Example Interview

**Claude:** "Let's set up this project folder. In one sentence, what is this project and what problem does it solve?"

**User:** "It's a customer research repository for our product team."

**Claude:** "Got it — a customer research repository. Who's the primary audience for this?"

**User:** "Product managers and designers on my team."

**Claude:** "Perfect. What are the 2-3 most valuable things Claude could help you do here?"

**User:** "Synthesize interview notes, spot patterns across conversations, draft insight summaries."

**Claude:** "Clear. I'll set up the project for research synthesis work. I'll assume Claude shouldn't make up data or invent customer quotes — anything else off-limits?"

**User:** "That's right. Also don't share raw notes externally."

**Claude:** "Got it. Here's how I've filled out CLAUDE.md and README.md: [shows draft]. Does this capture it?"

*Four questions, clear scope, ready to use.*

---

## After Setup

Once files are populated:
1. Confirm the user is satisfied
2. Suggest they start working — "What would you like to tackle first?"
3. Let the project context guide future sessions
