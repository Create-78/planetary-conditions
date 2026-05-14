# Initialization Rule

## Detecting Uninitialized Projects

If CLAUDE.md contains TODO placeholders in the Project Summary section, the project has not been initialized.

**When you detect this:**

1. Inform the user: "This project hasn't been set up yet."
2. Offer to run the initialization: "Would you like me to ask a few questions to fill out the project context? (Or run `/init`)"
3. If they agree, use the `project-init` skill to conduct the interview

**Do NOT:**
- Proceed with work that requires project context you don't have
- Make up project details
- Fill in placeholders without interviewing the user

## After Initialization

Once CLAUDE.md has real content (not TODOs), treat it as the source of truth for project scope and priorities.
