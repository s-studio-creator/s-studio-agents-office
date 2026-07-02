# 🤖 S.STUDIO COO Service

The Chief Operating Officer — a persistent orchestration service that
runs your AI software studio while you sleep.

## How It Works

```
while(true):
  poll GitHub Issues
  check labels (status: ready / in-progress / review / approved / blocked)
  check PRs + CI status
  decide next action (decision tree, not LLM)
  execute action (assign, label, notify, escalate)
  sync office visual
  sleep(60s)
```

## Status Labels

| Label | Meaning |
|-------|---------|
| `status: ready` | Issue ready for assignment |
| `status: in-progress` | Agent working on it |
| `status: review` | PR open, waiting for QA |
| `status: approved` | Review passed |
| `status: blocked` | Something blocking progress |
| `status: done` | Merged and closed |

## Run

```bash
GITHUB_TOKEN=ghp_xxx \
GITHUB_OWNER=s-studio-creator \
GITHUB_REPO=s-studio-agents-office \
POLL_INTERVAL=60000 \
OFFICE_URL=http://localhost:3100 \
node coo-service.js
```

## Decision Rules

1. **New issue** → Assign to agent → Set `in-progress`
2. **In progress + PR** → Request review → Set `review`
3. **Review passed** → Mark `approved` → Ask founder
4. **Approved + merged** → Close → Set `done`
5. **Blocked >24h** → Escalate to Sammi
