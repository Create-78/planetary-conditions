---
name: agent-building
description: Use this skill when designing, building, or governing agentic AI systems. Covers missions, ontology, context, proof, and control layers.
---

# SKILL: Agent Building — Agentics (Enforced Specification)

A lintable, enforceable skill for designing, building, operating, and governing agentic systems. This skill encodes Kwame Nyanning's Agentics framework (missions, ontology, context, proof, and control), Pascal Bornet's staged autonomy model, Microsoft AutoGen multi-agent orchestration patterns, and Google Agent2Agent (A2A) interoperability principles.

This SKILL is a **normative specification**, not a narrative guide.
Any system claiming compliance **MUST** satisfy all MUST requirements herein.
Failure to do so means the system **MUST NOT** be described as agentic.

---

## 1. Normative language
- **MUST / MUST NOT**: mandatory, non-negotiable
- **SHOULD / SHOULD NOT**: strong recommendation
- **MAY**: optional

---

## 2. Canonical definitions

### 2.1 Agent
An **agent** is a system that:
- **MUST** pursue one or more explicit missions over time
- **MUST** maintain externalized, auditable state
- **MUST** plan and select actions
- **MUST** act through explicit, typed interfaces
- **MUST** observe outcomes and adapt
- **MUST** operate under bounded autonomy and controls

### 2.2 Agentic system
An **agentic system** is a composition of agents, humans, tools, ontologies,
and controls working together toward mission completion.

---

# 3. The Agentics Core (Kwame Nyanning)

## 3.1 Missions (Layer 1)
- Systems **MUST** define missions before implementation.
- Missions **MUST** include intent, constraints, values, success conditions,
  escalation criteria, and allowed actions.
- Missions **MUST NOT** be UI pages, tickets, or prompts.

---

## 3.2 Ontology (Layer 2)
- Systems **MUST** maintain a shared ontology across all agents.
- Ontologies **MUST** encode entities, relationships, constraints,
  jurisdiction, and temporal validity.
- Ontologies **MUST** be versioned and reviewed.

---

## 3.3 Context Capsules + MCP (Layer 3)
- Systems **MUST** externalize state into bounded, append-only context capsules.
- All agents **MUST** read/write state through a shared protocol.

---

## 3.4 Logic Blocks (Layer 4)
- Decision logic **MUST** be decomposed into planning, risk, compliance,
  and execution logic.
- Logic **MUST** be explainable post-hoc.

---

## 3.5 Roles & Autonomy (Layer 5)
- Each agent **MUST** have a mission, memory scope, tool boundary,
  and escalation clause.
- Human authority boundaries **MUST** be explicit.

---

## 3.6 Orchestration Runtime (Layer 6)
- Multi-agent systems **MUST** define coordination and termination rules.
- Tool execution **MUST** be guarded by budgets and timeouts.

---

## 3.7 Semantic Actions (Layer 7)
- Agents **MUST** act through typed semantic actions.
- Actions **MUST** define preconditions and postconditions.

---

## 3.8 Proof & Provenance (Layer 8)
- Systems **MUST** retain lineage for decisions and artifacts.
- Proofs **MUST** support expiry and revocation.

---

## 3.9 Observability & Drift (Layer 9)
- Systems **MUST** log actions, decisions, and escalations.
- Systems **MUST** define semantic KPIs.

---

## 3.10 Controls (Layer 10)
- Hard controls **MUST** exist for spend, jurisdiction, and irreversible actions.
- Controls **MUST** fail closed.

---

## 3.11 Co-design (Layer 11)
- Systems **SHOULD** provide explanations and override paths.
- Users **MUST** retain meaningful agency.

---

## 3.12 Simulation & Iteration (Layer 12)
- Systems **MUST** be simulated before autonomy increases.
- Ontologies and logic **MUST** be versioned continuously.

---

# 4. Autonomy Staging (Bornet)
- Systems **MUST** declare current autonomy level.
- Autonomy **MUST NOT** increase without evidence.

---

# 5. Interoperability (A2A)
- Systems **SHOULD** expose capability metadata.
- Systems **SHOULD** support task lifecycle contracts.

---

# 6. Minimum Compliance Checklist

- [ ] Mission catalog exists
- [ ] Ontology governed
- [ ] Context capsules implemented
- [ ] Logic blocks separated
- [ ] Roles and escalation defined
- [ ] Semantic actions enforced
- [ ] Proof retained
- [ ] Observability active
- [ ] Hard controls enforced
- [ ] Simulation completed

---

## 7. Non-compliance
Systems that fail any MUST requirement **MUST NOT** be described as agentic.
