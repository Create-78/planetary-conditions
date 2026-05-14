---
name: user-interview
description: Use this skill when gathering context from the user. Ask minimum questions, one at a time, to unblock work efficiently.
---

# Skill: Interviewing for Context

How to gather necessary information from the user effectively.

---

## Core Principle

**Ask the minimum number of questions to get the necessary context, one question at a time.**

Users are busy. Every question costs attention. The goal is to unblock work, not to satisfy curiosity or cover every edge case.

---

## When to Interview

Interview when:
- The request is ambiguous and multiple interpretations would lead to different work
- Critical information is missing that would cause rework if assumed wrong
- A decision point requires user input (their preference matters)

Do NOT interview when:
- You can make a reasonable assumption and state it
- The detail is minor and easily corrected later
- You're asking "just to be thorough"

**Default behavior:** Make reasonable assumptions, state them clearly, and proceed. Only stop to ask when the risk of being wrong is high.

---

## The Interview Framework

### 1. Assess What You Actually Need

Before asking anything, identify:
- What specific information is missing?
- What's the minimum needed to proceed?
- What can be reasonably assumed?

**Filter questions through:** "If I don't know this, what goes wrong?"

### 2. One Question at a Time

Never ask multiple questions in a single message. This:
- Overwhelms the user
- Often results in partial answers
- Makes the conversation harder to track

**Wrong:**
> "What format do you want the output in? And who's the audience? Also, is there a deadline?"

**Right:**
> "Who's the primary audience for this document?"

Then wait. Ask the next question only after receiving the answer.

### 3. Start with the Highest-Impact Question

Ask the question that will most reduce uncertainty or most change your approach.

**Priority order:**
1. Purpose / Goal — Why does this exist?
2. Audience — Who is this for?
3. Constraints — What limits apply?
4. Preferences — How do they want it?

Often, knowing the purpose and audience answers many other questions implicitly.

### 4. Use Closed Questions When Possible

Closed questions (with specific options) are faster to answer than open questions.

**Open (slower):**
> "What tone do you want?"

**Closed (faster):**
> "Should this be formal or conversational?"

**With options (fastest):**
> "For the tone: (A) Formal/professional, (B) Conversational, or (C) Something else?"

### 5. Offer a Default

When asking for preferences, suggest a default. This lets users simply approve rather than decide from scratch.

**Without default:**
> "How long should this summary be?"

**With default:**
> "I'll aim for a one-page summary unless you'd prefer something different?"

Users can accept the default or redirect. Either way, you move forward faster.

---

## Question Types

### Clarifying Questions
Used when the request is ambiguous.

> "When you say 'improve the process,' are you looking for documentation of the current state, recommendations for changes, or both?"

### Scoping Questions
Used to understand boundaries.

> "Should this cover all regions or just North America?"

### Priority Questions
Used when tradeoffs exist.

> "If we can't have both speed and thoroughness, which matters more for this?"

### Validation Questions
Used to confirm understanding before significant work.

> "Before I draft this, let me confirm: the goal is [X], for audience [Y], and it needs to [Z]. Correct?"

---

## Techniques

### State What You Know First

Before asking, show what you've understood. This:
- Demonstrates you've engaged with the request
- Often triggers clarification without asking
- Reduces the question to just the gap

**Example:**
> "I understand you need a project summary for the leadership team, covering Q3 progress. What I'm not sure about is whether you want recommendations included or just status reporting."

### Bundle Assumption with Question

Make your best guess and ask for confirmation in one move.

**Example:**
> "I'll assume this is for internal use only unless you tell me otherwise. Is that right?"

This is faster than asking "Is this internal or external?" because it requires only a yes/no.

### Recognize When to Stop

Stop interviewing when:
- You have enough to produce a useful first draft
- Additional questions have diminishing returns
- The user seems fatigued or impatient

It's often better to draft something based on partial information and iterate than to over-interview upfront.

---

## Anti-Patterns

### The Interrogation
Asking 5+ questions before doing any work. This frustrates users and delays value.

### The Obvious Question
Asking things clearly stated in the request or project files. Read first.

### The Hedge Question
Asking questions to avoid accountability. "Are you sure you want...?" is often unnecessary.

### The Premature Question
Asking about details that only matter later. Focus on what's needed now.

### The Compound Question
Multiple questions disguised as one. "What's the format, length, and audience?" Split these up.

---

## Examples

### Good Interview Flow

**User:** "Can you help me write an update for my project?"

**Claude:** "Happy to help. Who will be reading this update?"

**User:** "My director and the project sponsor."

**Claude:** "Got it — leadership audience, so I'll keep it concise and focus on outcomes. Should this cover just progress, or do you also need to flag risks or decisions needed?"

**User:** "Progress and one decision I need from them."

**Claude:** "Perfect. I'll draft a short update with a progress summary and a clear ask for the decision. Let me review what I know about the project and put together a first draft."

*Three questions, focused, moved to action.*

### Efficient Assumption + Confirm

**User:** "Create a meeting agenda for the kickoff."

**Claude:** "I'll draft a 60-minute kickoff agenda covering introductions, project overview, roles, timeline, and next steps. I'll assume 6-8 attendees and a mix of people familiar and unfamiliar with the project. Does that framing work, or should I adjust?"

**User:** "That's right, go ahead."

*One confirmation question, clear assumptions stated, immediate progress.*

---

## Summary

1. **Minimum questions** — Only ask what you truly need
2. **One at a time** — Never batch questions
3. **Highest impact first** — Purpose and audience unlock the most
4. **Offer defaults** — Let users approve rather than decide
5. **State assumptions** — Show your thinking, confirm as needed
6. **Know when to stop** — Draft and iterate beats over-interviewing
