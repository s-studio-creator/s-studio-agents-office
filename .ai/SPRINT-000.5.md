# Sprint 000.5 — Mission Control

**Goal:** Build the first version of Mission Control — the CEO dashboard + COO infra.
No product work. This is the runway.

## Deliverables

### 1. n8n Workflows (dispatcher, not thinker)

```
GitHub Webhook
     │
     ▼
n8n (COO Dispatcher)
     │
     ├── Agent Registry → Pick agent
     ├── Dispatch Task  → POST /api/agents/:id/dispatch
     ├── Wait for result
     ├── Update GitHub  → labels, comments
     └── Telegram       → notify Sammi
```

4 workflows:
- **Workflow 1:** `issue-opened` → assign agent → label `in-progress` → Telegram
- **Workflow 2:** `pr-opened` → label `review` → dispatch ChatGPT QA → Telegram
- **Workflow 3:** `pr-merged` → label `done` → close issue → Telegram
- **Workflow 4:** 24h-blocked check → escalate → Telegram button

### 2. Agent Registry

```
GET /api/agents           → list all agents + status
POST /api/agents/dispatch → assign task to best agent
POST /api/agents/:id/task → send task, receive result
```

### 3. Telegram Interface

```
🤖 COO Notification
───
🟢 Hermes started: "Build Draw Card"
🔍 ChatGPT reviewing PR #27
🚨 Issue #3 blocked >24h
───
[Approve] [View Sprint]
```

One tap → approve via Telegram. No GitHub needed.

### 4. Mission Control Dashboard

```
┌─────────────────────────────────────┐
│  🌸 MISSION CONTROL    Sprint 003   │
├─────────────────────────────────────┤
│  🟢 Hermes     Building Draw Card  │
│  🟢 OpenClaw   PR #27 in review    │
│  🟡 ChatGPT    Reviewing...        │
│  ⚪ Claude     Idle                │
│  ⚪ Codex      Idle                │
│  ⚪ Gemini     Idle                │
├─────────────────────────────────────┤
│  📊 Sprint: 42% │ 🚫 Blocked: 1   │
│  📋 Pending: 3  │ ✅ Done: 12     │
└─────────────────────────────────────┘
```

Phase 1: React dashboard + the pixel office (already done)
Phase 2: Add sprint stats, blocked list, approve buttons

### 5. Always-On Hosting

| Service | Role | Cost |
|---------|------|------|
| n8n Cloud | COO dispatcher | Free tier starts |
| Railway | Backend API + Dashboard | $5/mo |
| Supabase | Memory store | Free tier |
| GitHub | Source of truth | Free |

## Architecture

```
GitHub (Issues, PRs, Labels)
  │  Webhook
  ▼
n8n Cloud (COO Dispatcher)
  │  POST /api/agents/:id/task
  ▼
Agent API (Railway)
  │  Dispatch to appropriate agent
  ▼
Hermes / OpenClaw / ChatGPT / Claude / Codex / Gemini
  │  Result
  ▼
n8n → GitHub Update + Telegram Notify
         │
         ▼
      Mission Control Dashboard
```

## Key Principle

n8n does NOT think.
n8n only DISPATCHES.
AI agents do the THINKING.
Sammi does the APPROVING.

---

*Sprint 000.5 — Approved by CTO ChatGPT 🧠*
