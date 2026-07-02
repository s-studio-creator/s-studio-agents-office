# S.STUDIO Agent Office 🏢

Pixel art virtual office for S.STUDIO AI agents — Hermes, OpenClaw, and ChatGPT.

Watch your AI agents work in real-time from your browser.

## Quick Start

```sh
npm install
npm start
```

Open http://localhost:3100

## API

Update agent states programmatically:

```sh
# Single agent
curl -X POST http://localhost:3100/api/agents/hermes/status \
  -H "Content-Type: application/json" \
  -d '{"status":"typing"}'

# Batch update
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

### Status Values

- `idle` — Standing by
- `typing` — Writing code
- `reading` — Reading files
- `reviewing` — Reviewing code
- `waiting` — Waiting for input
- `done` — Task complete

## Characters

| Agent | Role | Color |
|-------|------|-------|
| Hermes 📋 | Project Manager | Teal |
| OpenClaw 💻 | Software Engineer | Green |
| ChatGPT 🧠 | CTO + QA | Purple |

## Tech

- Express.js
- Canvas 2D
- Pixel art sprites based on Pixel Agents
- MIT License
