# S.STUDIO Workflow Guide

*How features flow from idea to production.*

## The Golden Path: Feature Development

```
Sammi says "Build Draw Card"
        │
        ▼
Hermes creates Sprint + Issue in Linear
        │
        ├── if design needed ──→ Claude makes Figma
        │                            │
        │                            ▼
        │                       Design reviewed
        │
        ▼
OpenClaw starts engineering
        │
        ├── if infra needed ──→ Codex sets up pipelines
        │                            │
        │                            ▼
        │                       Infrastructure ready
        │
        ▼
OpenClaw writes code → creates PR
        │
        ▼
ChatGPT reviews (QA)
        │
        ├── changes needed ←── back to OpenClaw
        │
        ▼
ChatGPT approves (CTO mask)
        │
        ▼
Sammi approves release
        │
        ▼
OpenClaw merges & deploys
```

## Communication Rules

| Rule | Why |
|------|-----|
| **No agent talks directly to another agent** | Decoupling. Swap any agent without rewiring. |
| **All handoffs go through events** | Audit trail. Every decision is recorded. |
| **One tool, one primary owner** | No ambiguity. No fights over Figma. |
| **Human decides when AI disagrees** | Sammi is the tiebreaker. Always. |

## Event Quick Reference

| Event | Producer | Consumer(s) | Purpose |
|-------|----------|-------------|---------|
| `design_request` | Hermes | Claude | "Design this feature" |
| `design_completed` | Claude | Hermes, ChatGPT | "Design ready for review" |
| `engineering_request` | Hermes | OpenClaw | "Build this feature" |
| `pr_ready` | OpenClaw | ChatGPT | "Code ready for review" |
| `review_completed` | ChatGPT | Hermes, Sammi | "Review passed" |
| `release_ready` | ChatGPT | Sammi | "Ready for CEO approval" |
| `release_completed` | Sammi | OpenClaw, Hermes | "Ship it" |
| `bug_reported` | Hermes | OpenClaw | "Fix this bug" |
| `research_request` | Hermes | Gemini | "Research this topic" |
| `research_completed` | Gemini | Hermes, ChatGPT | "Research done" |

## When to Call Each Agent

| Agent | Call When | Don't Call For |
|-------|-----------|----------------|
| 🧠 ChatGPT | Every PR needs QA. Architecture decisions. Scope challenges. | Writing code. Approving your own work. |
| 📋 Hermes | Sprint planning. Task breakdown. Coordination. | Writing prod code. Changing vision. |
| 💻 OpenClaw | Feature builds. Bug fixes. Refactoring. | Roadmap decisions. UX redesigns. |
| 🏗 Codex | New repos. CI/CD. Infrastructure. | Feature code. Product decisions. |
| 🎨 Claude | New UI/UX. Design system. Motion. | Code. Infrastructure. |
| 🔍 Gemini | Competitor research. API research. Trends. | Product decisions. Code. |

## SLA Targets

| Work Type | Target Time |
|-----------|-------------|
| Critical bug | 4 hours |
| Standard feature | 72 hours |
| Research task | 24 hours |
| Minor bug | 1 week |

---

*S.STUDIO — AI Software Studio. Last updated: 2026-07-02.*
