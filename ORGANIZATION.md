# S.STUDIO — AI Software Studio Handbook

## Overview

S.STUDIO is a 12-person AI software studio. The human-founder leads, and a team of
specialist AI agents handles product, engineering, design, and research.

**Principle:** More AI ≠ better. This is a startup, not a data center. Every agent has
a defined role, clear boundaries, and a specific reason to exist.

---

## Executive Team

| Role | Type | Agent |
|------|------|-------|
| Founder & CEO 🧑‍💼 | Human | Sammi |
| Virtual CTO 🧠 | AI | ChatGPT |
| Product Manager 📋 | AI | Hermes |
| Design Director 🎨 | AI | Claude |

## Product Team

| Role | Type | Agent | Responsibility |
|------|------|-------|---------------|
| Product Manager 📋 | AI | Hermes | Sprint planning, backlog, roadmap execution |
| Product Critic 🎯 | AI | ChatGPT | Challenges new features, protects MVP scope |

## Engineering Team

| Role | Type | Agent | Responsibility |
|------|------|-------|---------------|
| Senior Software Engineer 💻 | AI | OpenClaw | React Native, backend, features |
| Staff Engineer 🏗 | AI | Codex | Infrastructure, GitHub, CI/CD, DevOps |
| QA Engineer 🧪 | AI | ChatGPT | Code review, bug review, performance |

## Design Team

| Role | Type | Agent | Responsibility |
|------|------|-------|---------------|
| Design Director 🎨 | AI | Claude | UX, UI, Design System, Motion |

## Research Team

| Role | Type | Agent | Responsibility |
|------|------|-------|---------------|
| Research Analyst 🔍 | AI | Gemini | Competitors, APIs, SDKs, market research |

## Marketing Team (Later)

| Role | Type | Agent | Responsibility |
|------|------|-------|---------------|
| Growth Manager 📈 | AI | Claude/Gemini | SEO, ASO, referrals |
| Content Strategist ✍️ | AI | Claude | Social content, blogs, copywriting |

---

## Org Chart

```
                  👩🏻 Sammi
                Founder & CEO
                     │
      ┌──────────────┼──────────────┐
      │              │              │
      ▼              ▼              ▼
   🧠 CTO         📋 Product PM   🎨 Design Director
  ChatGPT          Hermes           Claude
      │              │
      └──────┬───────┘
             ▼
      💻 Senior Engineer
         OpenClaw
             │
      ┌──────┴──────┐
      ▼             ▼
  🏗 Staff Eng    🧪 QA Engineer
    Codex           ChatGPT
      │
      ▼
    👩🏻 Sammi
  Final Approval
```

---

## Roles & Responsibilities

### 👩🏻 Founder & CEO (Human — Sammi)

**Owns:**
- Vision
- Product strategy
- Priority
- Final approval
- Release approval

**Cannot:**
- Delegate vision decisions
- Skip final quality check

---

### 🧠 Virtual CTO (ChatGPT)

**Owns:**
- Technical architecture
- Engineering standards
- Product trade-offs
- AI workflow design
- Code review
- Technical QA

**Cannot:**
- Change product vision
- Approve releases alone

---

### 📋 Product Manager (Hermes)

**Owns:**
- Sprint planning
- Backlog grooming
- Task breakdown
- Sprint reports
- Risk tracking
- Coordination between agents

**Cannot:**
- Write production code
- Change product vision
- Approve feature decisions independently

---

### 💻 Senior Software Engineer (OpenClaw)

**Owns:**
- Feature development
- Bug fixes
- Refactoring
- Tests
- Implementation

**Cannot:**
- Decide roadmap
- Invent features
- Redesign UX

---

### 🏗 Staff Engineer (Codex)

**Owns:**
- GitHub structure
- Repository organization
- CI/CD pipelines
- DevOps automation
- Engineering documentation
- Infrastructure decisions

**Cannot:**
- Change product requirements
- Merge without CEO approval

---

### 🎨 Design Director (Claude)

**Owns:**
- Design system
- UI execution
- UX flows
- Motion design
- Product copy

**Cannot:**
- Implement production code

---

### 🔍 Research Analyst (Gemini)

**Owns:**
- Competitor research
- API/SDK research
- Industry trend monitoring
- Technical documentation
- Architecture recommendations

**Cannot:**
- Make product decisions

---

### 🧪 QA Engineer (ChatGPT)

**Owns:**
- Code review
- UX review
- Performance review
- Bug validation
- Quality gates

**Cannot:**
- Merge code
- Change feature scope

---

### 🎯 Product Critic (ChatGPT)

**Owns:**
- Protecting MVP scope
- Challenging unnecessary features
- Preventing feature creep
- Ensuring focus

**Cannot:**
- Approve new features independently

---

## Decision Authority Matrix

| Decision | Who Decides | Who Consults |
|----------|-------------|--------------|
| Product vision | Sammi | CTO, PM |
| Sprint goals | Sammi + PM | CTO |
| Technical architecture | CTO | Staff Eng |
| Feature details | PM | CTO, Engineer |
| Design system | Design Dir | PM, CTO |
| Release approval | Sammi | CTO, QA |
| Infrastructure | Staff Eng | CTO |
| Research direction | Research Analyst | CTO, PM |
| Bug severity | QA | Engineer |

---

## Daily Workflow

```
CEO 👩🏻
  │ Provides vision & priorities
  ▼
PM 📋 (Hermes)
  │ Plans sprint, breaks down tasks
  ▼
Engineer 💻 (OpenClaw)
  │ Builds features
  ▼
Infra 🏗 (Codex) — only if needed
  │ Sets up pipelines, repos
  ▼
QA 🧪 + CTO 🧠 (ChatGPT)
  │ Reviews code, UX, performance
  ▼
CEO 👩🏻
  │ Final approval
  ▼
Merge & Ship 🚀
```

---

## When to Bring In Specialists

| Agent | Trigger | Context Cost |
|-------|---------|-------------|
| **Claude 🎨** | New UI/UX work, design system updates, motion | High — only for design tasks |
| **Gemini 🔍** | Competitor analysis, API research, SDK eval | Medium — batch research requests |
| **Codex 🏗** | New repo, CI/CD changes, infra decisions | Low — as-needed |
| **ChatGPT 🧪** | Every PR needs QA review | Always active |

**Rule:** Claude and Gemini are specialists. Only call them when the task genuinely
requires design or research. This keeps context switching low and avoids paying the
cost of involving more agents than necessary.

---

## Communication Flow

```
Daily Standup (Hermes → Sammi)
  What was done yesterday
  What's happening today
  What's blocked

Sprint Planning (Sammi + Hermes)
  Priorities for next sprint
  Task breakdown

Tech Review (CTO + Engineer)
  Architecture decisions
  Code quality

Design Review (Design Dir + PM)
  UX/UI alignment
  Brand consistency

Release Gate (Sammi + CTO + QA)
  Final quality check
  Go/no-go decision
```

---

## Git Workflow

```
main (protected)
  └── develop (CI runs)
       ├── feature/xxx → PR → QA review → merge to develop
       └── hotfix/xxx  → PR → QA review → merge to main

Branches:
  main        — Production, only Sammi merges
  develop     — Integration branch, CI runs
  feature/*   — Feature work
  hotfix/*    — Urgent fixes
```

---

## Principles

1. **Human-led, AI-augmented.** Sammi owns the vision. Agents execute within boundaries.
2. **Scope discipline.** Product Critic exists to say "no" to scope creep.
3. **Quality gates.** No code ships without QA + CTO review + CEO approval.
4. **Small team, big leverage.** 1 human + ~6 active agents = maximum leverage.
5. **Specialize carefully.** Claude and Gemini are valuable but expensive context-wise.
   Use them only when the task genuinely needs them.

---

*Last updated: 2026-07-02*
*Maintained by: OpenClaw*
