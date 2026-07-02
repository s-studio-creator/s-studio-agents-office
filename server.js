import express from 'express';
import { readFileSync, existsSync, mkdirSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3100;
const app = express();

app.use(express.json());
app.use(express.static(join(__dirname, 'public')));

// ── Agent State Store ────────────────────────────────────────

const AGENTS = {
  hermes: {
    id: 'hermes',
    name: 'Hermes',
    role: 'Project Manager',
    color: '#00BCD4',
    status: 'idle',
    statusText: 'Standing by',
    desk: 0,
    palette: 0,
    emoji: '📋'
  },
  openclaw: {
    id: 'openclaw',
    name: 'OpenClaw',
    role: 'Software Engineer',
    color: '#4CAF50',
    status: 'idle',
    statusText: 'Standing by',
    desk: 1,
    palette: 1,
    emoji: '💻'
  },
  chatgpt: {
    id: 'chatgpt',
    name: 'ChatGPT',
    role: 'CTO + QA',
    color: '#9C27B0',
    status: 'idle',
    statusText: 'Standing by',
    desk: 2,
    palette: 2,
    emoji: '🧠'
  }
};

const STATUS_MAP = {
  idle: { text: 'Idle', anim: 'idle' },
  typing: { text: 'Writing code...', anim: 'type' },
  reading: { text: 'Reading files...', anim: 'read' },
  waiting: { text: 'Waiting for input', anim: 'wait' },
  running: { text: 'Running command...', anim: 'run' },
  reviewing: { text: 'Reviewing...', anim: 'read' },
  done: { text: 'Done ✓', anim: 'idle' }
};

// ── REST API ────────────────────────────────────────────────

// GET all agents
app.get('/api/agents', (req, res) => {
  res.json(Object.values(AGENTS));
});

// GET single agent
app.get('/api/agents/:id', (req, res) => {
  const agent = AGENTS[req.params.id];
  if (!agent) return res.status(404).json({ error: 'Agent not found' });
  res.json(agent);
});

// POST update agent status
app.post('/api/agents/:id/status', (req, res) => {
  const agent = AGENTS[req.params.id];
  if (!agent) return res.status(404).json({ error: 'Agent not found' });
  
  const { status, statusText } = req.body;
  if (status && STATUS_MAP[status]) {
    agent.status = status;
    agent.statusText = statusText || STATUS_MAP[status].text;
  } else if (statusText) {
    agent.statusText = statusText;
  }
  
  console.log(`[STATE] ${agent.name}: ${agent.status} — ${agent.statusText}`);
  res.json(agent);
});

// POST batch update all agents
app.post('/api/agents/batch', (req, res) => {
  const updates = req.body;
  for (const [id, data] of Object.entries(updates)) {
    const agent = AGENTS[id];
    if (!agent) continue;
    if (data.status && STATUS_MAP[data.status]) {
      agent.status = data.status;
      agent.statusText = data.statusText || STATUS_MAP[data.status].text;
    } else if (data.statusText) {
      agent.statusText = data.statusText;
    }
  }
  console.log('[STATE] Batch update applied');
  res.json({ ok: true });
});

// ── Character sprites API ───────────────────────────────────

app.get('/api/sprites/:id', (req, res) => {
  const charFile = join(__dirname, 'public', 'sprites', `char_${req.params.id}.png`);
  if (existsSync(charFile)) {
    res.sendFile(charFile);
  } else {
    res.status(404).end();
  }
});

// ── Start ───────────────────────────────────────────────────

app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n  🏢 S.STUDIO Agent Office`);
  console.log(`  ─────────────────────────`);
  console.log(`  Characters: Hermes 📋 | OpenClaw 💻 | ChatGPT 🧠`);
  console.log(`  API:        http://localhost:${PORT}/api/agents`);
  console.log(`  Office:     http://localhost:${PORT}/\n`);
});
