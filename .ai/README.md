# AICOS — AI Company Operating System

**AICOS** is an event-driven operating system for running an AI-powered software studio.
It decouples agents from tools and workflows, so every component can be swapped,
upgraded, or extended without rewriting the system.

## How It Works

```
  ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
  │ Agent emits  │ ──→ │  Event Bus  │ ──→ │ Agent picks  │
  │   event      │     │  (.ai/)     │     │  up event    │
  └─────────────┘     └─────────────┘     └──────┬──────┘
                                                  │
                                                  ▼
                                          ┌─────────────┐
                                          │  Uses tools  │
                                          │  from .ai/   │
                                          └─────────────┘
```

## Directory Layout

```
.ai/
├── agents/       ← Who the agents are (roles, tools, events)
├── tools/        ← What tools exist (capabilities, owners, limitations)
├── events/       ← Event contracts (schema, producers, subscribers)
├── workflows/    ← End-to-end process flows
├── policies/     ← Access control & governance
└── state/        ← Current system state (runtime)
```

## Core Principles

1. **No direct agent-to-agent communication.** Everything goes through events.
2. **One tool, one primary owner.** Every tool has exactly one agent responsible.
3. **Explicit contracts.** Every event has a schema. Every tool has capabilities.
4. **Default deny.** Agents cannot use tools they are not explicitly granted.
5. **Humans are agents too.** Sammi has `founder` agent definition with supreme authority.

## Adding a New Agent

1. Create `.ai/agents/<name>.yaml`
2. List tools they own and can use
3. Define which events they subscribe to and emit
4. Update relevant workflows if needed

## Adding a New Tool

1. Create `.ai/tools/<name>.yaml`
2. Define capabilities, owner, and limitations
3. Update the agent's tool list

## Adding a New Event

1. Create `.ai/events/<name>.yaml`
2. Define schema, producer, and subscribers
3. Update relevant workflows

---

*S.STUDIO — AI Software Studio*
