# 🏢 S.STUDIO Agent Office

Pixel art virtual office for S.STUDIO's 12-person AI software studio.

```
         👩🏻 Sammi (Founder & CEO)
            │
    ┌───────┼─────────┐
    │       │         │
  🧠 CTO  📋 PM    🎨 Design
  📋 📋   💻 🏗 🧪  🎨
```

## Active Agents

| Agent | Role | Team | Color |
|-------|------|------|-------|
| 📋 Hermes | Product Manager | Product | Teal |
| 💻 OpenClaw | Senior Engineer | Engineering | Green |
| 🧠 ChatGPT | CTO / QA / Critic | Executive | Purple |
| 🏗 Codex | Staff Engineer | Engineering | Orange |
| 🎨 Claude | Design Director | Design | Pink |
| 🔍 Gemini | Research Analyst | Research | Gold |

## Quick Start

```sh
npm install
npm start
```

Open http://localhost:3100

## Project Structure

```
📁 s-studio-agents-office
├── server.js            ← Express server + REST API
├── agent-client.js      ← CLI tool for agents to push state
├── ORGANIZATION.md      ← Full company handbook
├── public/
│   ├── index.html       ← Pixel art office canvas
│   └── sprites/         ← Character sprite sheets
├── vercel.json          ← Vercel deployment config
└── package.json
```

## API

```sh
# Single agent
curl -X POST http://localhost:3100/api/agents/hermes/status \
  -H "Content-Type: application/json" \
  -d '{"status":"typing"}'

# Batch update (all at once)
curl -X POST http://localhost:3100/api/agents/batch \
  -H "Content-Type: application/json" \
  -d '{
    "hermes": {"status": "typing"},
    "openclaw": {"status": "reading"},
    "chatgpt": {"status": "reviewing"}
  }'

# View all agents
curl http://localhost:3100/api/agents
```

### Agent Client CLI

```sh
# From any agent's context:
node agent-client.js openclaw typing
node agent-client.js batch '{"hermes":{"status":"reading"},"openclaw":{"status":"typing"}}'
```

### Status Values

| Status | Display |
|--------|--------|
| `idle` | Standing by |
| `typing` | Writing code... |
| `reading` | Reading files... |
| `reviewing` | Reviewing... |
| `waiting` | Waiting for input |
| `running` | Running... |
| `done` | Done ✓ |

## Orchestration Notes

- **Claude** and **Gemini** are specialists — only use for design/research tasks
- **Codex** handles infrastructure — called as-needed
- **ChatGPT** wears 3 hats (CTO, QA, Product Critic) — always active
- **Hermes** runs sprint planning and coordination
- **OpenClaw** is the primary engineer for feature work

## Deploy to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Import `s-studio-creator/s-studio-agents-office`
3. Framework preset: **Other**
4. Deploy 🚀

## Tech

- **Backend:** Express.js
- **Frontend:** Canvas 2D (no React, no build step)
- **Sprites:** Custom pixel art (based on Pixel Agents by OpenClaw)
- **Deploy:** Vercel-ready
