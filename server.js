import express from 'express';
import { readFileSync, existsSync, mkdirSync, writeFileSync, appendFileSync } from 'fs';
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
    role: 'Product Manager',
    team: 'Product',
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
    role: 'Senior Engineer',
    team: 'Engineering',
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
    role: 'CTO / QA / Critic',
    team: 'Executive',
    color: '#9C27B0',
    status: 'idle',
    statusText: 'Standing by',
    desk: 2,
    palette: 2,
    emoji: '🧠'
  },
  codex: {
    id: 'codex',
    name: 'Codex',
    role: 'Staff Engineer',
    team: 'Engineering',
    color: '#FF6B35',
    status: 'idle',
    statusText: 'Standing by',
    desk: 3,
    palette: 0,
    emoji: '🏗'
  },
  claude: {
    id: 'claude',
    name: 'Claude',
    role: 'Design Director',
    team: 'Design',
    color: '#E91E63',
    status: 'idle',
    statusText: 'Standing by',
    desk: 4,
    palette: 1,
    emoji: '🎨'
  },
  gemini: {
    id: 'gemini',
    name: 'Gemini',
    role: 'Research Analyst',
    team: 'Research',
    color: '#FFD700',
    status: 'idle',
    statusText: 'Standing by',
    desk: 5,
    palette: 2,
    emoji: '🔍'
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

// ── Dispatch Queue ─────────────────────────────────────────
// The COO writes dispatch tasks here. OpenClaw reads them.

const DISPATCH_LOG = join(__dirname, '..', 'coo', 'dispatch.log');

app.get('/api/dispatch/pending', (req, res) => {
  try {
    if (!existsSync(DISPATCH_LOG)) return res.json([]);
    const data = readFileSync(DISPATCH_LOG, 'utf-8').trim();
    const lines = data ? data.split('\n').filter(l => l) : [];
    const pending = lines
      .map(l => { try { return JSON.parse(l); } catch { return null; } })
      .filter(l => l && l.status === 'pending');
    res.json(pending);
  } catch (e) {
    res.json([]);
  }
});

app.post('/api/dispatch/acknowledge', (req, res) => {
  // Mark a dispatch as acknowledged (OpenClaw picked it up)
  const { dispatchId } = req.body;
  if (!dispatchId) return res.status(400).json({ error: 'dispatchId required' });
  
  try {
    if (!existsSync(DISPATCH_LOG)) return res.json({ ok: false });
    const data = readFileSync(DISPATCH_LOG, 'utf-8');
    const lines = data.split('\n');
    const updated = lines.map(l => {
      try {
        const d = JSON.parse(l);
        if (d.dispatchId === dispatchId) d.status = 'acknowledged';
        return JSON.stringify(d);
      } catch { return l; }
    }).join('\n');
    writeFileSync(DISPATCH_LOG, updated);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/dispatch/all', (req, res) => {
  try {
    if (!existsSync(DISPATCH_LOG)) return res.json([]);
    const data = readFileSync(DISPATCH_LOG, 'utf-8').trim();
    const lines = data ? data.split('\n').filter(l => l) : [];
    res.json(lines.map(l => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean));
  } catch (e) {
    res.json([]);
  }
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

// Ensure dispatch log exists
mkdirSync(join(__dirname, '..', 'coo'), { recursive: true });
if (!existsSync(DISPATCH_LOG)) {
  writeFileSync(DISPATCH_LOG, '');
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n  🏢 S.STUDIO Agent Office (12-Person Studio)`);
  console.log(`  ────────────────────────────────────────`);
  console.log(`  Exec:    👩🏻 Sammi (Founder & CEO)`);
  console.log(`  Product: 📋 Hermes`);
  console.log(`  Eng:     💻 OpenClaw  🏗 Codex  🧪 ChatGPT`);
  console.log(`  Design:  🎨 Claude`);
  console.log(`  Research:🔍 Gemini`);
  console.log(`  API:      http://localhost:${PORT}/api/agents`);
  console.log(`  Office:   http://localhost:${PORT}/\n`);
});
