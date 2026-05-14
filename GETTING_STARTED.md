# Getting Started with Claude Code

Welcome! This starter kit sets up your project for effective collaboration with Claude Code. Follow this guide to get up and running.

---

## What's in This Kit

```
your-project/
├── GETTING_STARTED.md      ← You are here
├── CLAUDE.md               ← AI context file (customize this)
├── README.md               ← Project overview template
│
├── .claude/                ← Claude Code configuration
│   ├── commands/           ← Slash commands (/status, /decision, etc.)
│   ├── rules/              ← Always-on guidelines
│   ├── skills/             ← Specialized capabilities
│   └── templates/          ← Fill-in-the-blank documents
│
└── logs/                   ← Session and learning tracking
    ├── sessions_log.md
    └── learnings_log.md
```

---

## Quick Setup (2 minutes)

### Recommended: Run `/init`

1. Open Claude Code in your project directory
2. Type `/init`
3. Answer 3-4 quick questions about your project
4. Claude fills out `CLAUDE.md` and `README.md` for you

That's it. You're ready to work.

### Alternative: Manual Setup

If you prefer to edit files directly:

1. **CLAUDE.md** — Update the Project Summary, In Scope, and Out of Scope sections
2. **README.md** — Fill in project name, status, and priorities

### Start Working

Once setup is complete, try:
- "Help me draft a project epic"
- "What's in this codebase?"
- `/status` to create a status update
- `/decision` to document a decision

---

## How It Works

### CLAUDE.md
This file gives Claude context about your project. It's automatically read at the start of each conversation. Keep it concise (<300 lines) — detailed guidance lives in `.claude/`.

### .claude/commands/
These create slash commands. Type `/status` and Claude will follow the instructions in `.claude/commands/status.md`. Add your own by creating new `.md` files.

**Included commands:**
- `/init` — Set up project via guided interview
- `/status` — Create a status update
- `/decision` — Document a decision
- `/log` — Update session logs

### .claude/rules/
Rules are automatically included in every conversation. Use for guidelines that always apply (safety, quality standards, workflow rules).

**Included rules:**
- `initialization.md` — Detects uninitialized projects, prompts for setup
- `safety.md` — Data handling, human accountability
- `quality.md` — Standards for documents and analysis
- `workflows.md` — Session management, do's and don'ts

### .claude/skills/
Skills are specialized capabilities Claude can use when relevant. They're auto-discovered via YAML frontmatter.

**Included skills:**
- `project-init` — Setting up a new project via interview
- `user-interview` — Gathering context efficiently
- `status-updates` — Writing concise stakeholder updates
- `decision-docs` — Documenting decisions with rationale
- `meeting-synthesis` — Turning meeting notes into actions

### .claude/templates/
Fill-in-the-blank starting points for common documents. Commands reference these when generating output.

### logs/
Track what happens across sessions:
- `sessions_log.md` — Chronological activity log
- `learnings_log.md` — Curated insights worth remembering

---

## Customization Guide

### Adding a New Command

1. Create `.claude/commands/my-command.md`
2. Write instructions for what Claude should do
3. Use `/my-command` in conversation

**Example:**
```markdown
# /weekly-report — Generate Weekly Report

## Instructions
1. Ask what week this covers
2. Gather accomplishments, blockers, and plans
3. Generate report using @.claude/templates/TEMPLATE_weekly.md

## Output
A formatted weekly report ready to send.
```

### Adding a New Skill

1. Create `.claude/skills/my-skill/SKILL.md`
2. Add YAML frontmatter with `name` and `description`
3. Write the skill content

**Example:**
```markdown
---
name: my-skill
description: Use this skill when [specific situation]
---

# My Skill

[Guidance content here]
```

### Adding a New Rule

1. Create `.claude/rules/my-rule.md`
2. Write the guideline
3. It's automatically included in all conversations

**Best for:** Safety requirements, quality standards, always-applicable guidelines.

### Adding a New Template

1. Create `.claude/templates/TEMPLATE_my-template.md`
2. Write the fill-in-the-blank structure
3. Reference from commands: `@.claude/templates/TEMPLATE_my-template.md`

---

## Tips for Effective Collaboration

### Do
- **Update CLAUDE.md** when your project evolves
- **Use /log** at the end of sessions to capture what happened
- **Check learnings_log.md** periodically for patterns worth sharing
- **Create commands** for tasks you do repeatedly
- **Be specific** in requests — context helps Claude help you

### Don't
- **Don't skip the CLAUDE.md setup** — even minimal context helps
- **Don't put sensitive data** in logs or context files
- **Don't let CLAUDE.md exceed 300 lines** — move details to .claude/ files
- **Don't treat Claude as infallible** — verify important information

---

## Troubleshooting

### "Claude doesn't know about my project"
- Check that CLAUDE.md exists in your project root
- Make sure you're running Claude Code from the project directory

### "My command isn't working"
- Verify the file is in `.claude/commands/`
- Check the filename matches what you're typing (e.g., `status.md` → `/status`)

### "Skills aren't being used"
- Ensure YAML frontmatter has both `name` and `description`
- Check file is named `SKILL.md` (exact case) in a subfolder of `.claude/skills/`

### "Too much context, Claude seems confused"
- Trim CLAUDE.md to essentials (<150 lines ideal)
- Move detailed guidance to rules or skills
- Remove outdated information

---

## Getting Help

- **Claude Code docs:** https://docs.anthropic.com/claude-code
- **Report issues:** https://github.com/anthropics/claude-code/issues

---

## Next Steps

1. ✅ Read this guide
2. ⬜ Run `/init` to set up your project (or edit CLAUDE.md manually)
3. ⬜ Try a slash command (`/status` or `/decision`)
4. ⬜ Run `/log` at end of your first session

You're ready to go. Happy collaborating!
