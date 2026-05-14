---
name: file-organization
description: Use when setting up or reviewing Claude Code project structure. Covers CLAUDE.md sizing, .claude/ directory organization, skills/commands/rules/templates setup.
---

# Claude Code File Organization Best Practices

## Core Principle

**Keep CLAUDE.md lean; put details in `.claude/` directory.**

Claude Code works best with a clear separation: high-level context in CLAUDE.md, detailed guidance in specialized files that are auto-loaded or referenced as needed.

---

## Recommended Structure

```
/
├── CLAUDE.md                      # Project context (<300 lines, ideal <60)
│
└── .claude/                       # All Claude Code configuration
    ├── commands/                  # Slash commands (*.md)
    │   └── <command-name>.md      # Creates /command-name
    │
    ├── rules/                     # Auto-loaded guidelines (*.md)
    │   └── <topic>.md             # Always included in context
    │
    ├── skills/                    # Auto-discovered skills
    │   └── <skill-name>/
    │       └── SKILL.md           # Requires YAML frontmatter
    │
    └── templates/                 # Fill-in-the-blank documents
        └── TEMPLATE_<name>.md     # Referenced by commands
```

---

## CLAUDE.md Guidelines

### Size Targets

| Complexity | Target Lines |
|------------|--------------|
| Simple project | <60 lines |
| Medium project | 60-150 lines |
| Complex project | 150-300 lines |
| **Never exceed** | 300 lines |

### What to Include

- Project summary (what it is, what it's for)
- File structure overview
- Key constraints or rules
- Links/references to detailed docs

### What to Move Out

- Detailed workflows → `.claude/rules/`
- Step-by-step processes → `.claude/commands/`
- Reusable competencies → `.claude/skills/`
- Fill-in templates → `.claude/templates/`

---

## Skills Setup

Skills are auto-discovered when they have proper YAML frontmatter.

### File Location

```
.claude/skills/<skill-name>/SKILL.md
```

### Required Format

```markdown
---
name: skill-name
description: One-line description of when to use this skill
---

# Skill Title

[Full skill content here]
```

### Key Points

- `name` and `description` fields are required for auto-discovery
- Put full content directly in SKILL.md (avoid @imports to external files)
- Description should answer "when would I use this?"

---

## Commands Setup

Commands create slash commands (e.g., `/decision`, `/status`).

### File Location

```
.claude/commands/<command-name>.md
```

### Format

```markdown
# /<command-name> — Brief Description

[Instructions for what Claude should do when this command is invoked]

## Instructions

1. [Step 1]
2. [Step 2]

## Output

[What to produce]
```

### Example

A file at `.claude/commands/status.md` creates the `/status` command.

---

## Rules Setup

Rules are auto-loaded into every conversation — use for always-applicable guidance.

### File Location

```
.claude/rules/<topic>.md
```

### Good Candidates for Rules

- Safety and compliance requirements
- Quality standards
- Workflow do's and don'ts
- Session management guidelines

### Keep Rules Focused

Each rule file should cover one topic. Better to have 3 small files than 1 large one.

---

## Templates Setup

Templates are fill-in-the-blank starting points, referenced by commands.

### File Location

```
.claude/templates/TEMPLATE_<name>.md
```

### Naming Convention

Prefix with `TEMPLATE_` for clarity.

### Reference from Commands

```markdown
Generate a document using the template at @.claude/templates/TEMPLATE_decision.md
```

---

## Anti-Patterns to Avoid

| Anti-Pattern | Problem | Fix |
|--------------|---------|-----|
| **Giant CLAUDE.md** | Too much context, gets ignored | Move details to .claude/ files |
| **@imports to external folders** | Breaks if folders move/delete | Put full content in .claude/ |
| **Skills without frontmatter** | Won't be auto-discovered | Add `name` and `description` YAML |
| **Everything in rules** | Bloats every conversation | Use skills/commands for situational guidance |
| **Scattered config** | Hard to maintain, copy, share | Consolidate in .claude/ |

---

## Portability

The `.claude/` directory should be **self-contained**:

- Copy `.claude/` to another project → everything works
- No dependencies on files outside `.claude/`
- All paths in commands/skills reference `.claude/` internally

---

## Quick Checklist

- [ ] CLAUDE.md is under 300 lines
- [ ] `.claude/` directory exists with subdirectories
- [ ] All skills have YAML frontmatter (`name`, `description`)
- [ ] Rules are split by topic, not one giant file
- [ ] Commands reference templates via `.claude/templates/`
- [ ] No @imports pointing outside `.claude/`
- [ ] Structure is documented in CLAUDE.md
