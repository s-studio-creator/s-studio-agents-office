# 🚂 Deploy n8n on Railway + Import S.STUDIO Workflows

## Step 1: Deploy n8n

1. Go to [railway.app](https://railway.app)
2. Sign up (GitHub login)
3. Click **"New Project"**
4. Select **"Deploy from template"**
5. Search: **n8n**
6. Click deploy
7. Wait ~2 mins for build
8. Railway gives you a URL like `https://n8n-production-xxxx.up.railway.app`

## Step 2: Set Environment Variables

In Railway dashboard → n8n project → Variables:

| Variable | Value | Why |
|----------|-------|-----|
| `N8N_ENCRYPTION_KEY` | (generate a random string) | Required by n8n |
| `WEBHOOK_URL` | `https://your-n8n-url.up.railway.app` | For webhook callbacks |

## Step 3: Import Workflows

Download these files from GitHub:
```
https://github.com/s-studio-creator/s-studio-agents-office/blob/main/.ai/workflows/n8n-issue-assign.json
https://github.com/s-studio-creator/s-studio-agents-office/blob/main/.ai/workflows/n8n-pr-review.json
https://github.com/s-studio-creator/s-studio-agents-office/blob/main/.ai/workflows/n8n-infra-dispatch.json
https://github.com/s-studio-creator/s-studio-agents-office/blob/main/.ai/workflows/n8n-blocked-escalate.json
```

In n8n UI:
1. Click **Workflows**
2. Click **Import from File**
3. Select each JSON file
4. Activate each workflow (toggle on)

## Step 4: Configure GitHub + Telegram Credentials

In n8n, create credentials:
- **GitHub:** Personal Access Token (`repo` scope)
- **Telegram:** Bot Token (from @BotFather)

## Step 5: Set GitHub Webhooks

In GitHub repo → Settings → Webhooks:
- Payload URL: `https://your-n8n-url.up.railway.app/webhook/coo/issue-opened`
- Content type: `application/json`
- Events: Issues, Pull requests

## Workflow Summary

| Workflow | Trigger | What It Does |
|----------|---------|-------------|
| Issue Assign | Issue opened | Detects `agent:` label → assigns → updates status → Telegram |
| PR Review | PR opened | Labels `status: review` → notifies ChatGPT → Telegram |
| Infra Dispatch | Issue with `agent: codex` | Assigns Codex → updates office → Telegram |
| Blocked Escalate | Every 6h (schedule) | Finds blocked >24h → Telegram you 🚨 |
