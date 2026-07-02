/**
 * Syncs current agent states to the pixel office.
 */
const OFFICE_URL = process.env.OFFICE_URL || 'http://localhost:3100';

const STATUS_TO_STATE = {
  'status: ready':       'idle',
  'status: in-progress': 'typing',
  'status: review':      'reviewing',
  'status: approved':    'done',
  'status: blocked':     'waiting',
  'status: done':        'done',
};

export async function syncOffice(issues) {
  // Map status labels to agent states
  const updates = {};
  
  for (const issue of issues) {
    const labels = issue.labels.map(l => l.name);
    const agentLabel = labels.find(l => l.startsWith('agent:'));
    const statusLabel = labels.find(l => l.startsWith('status:'));
    
    if (agentLabel && statusLabel) {
      const agentId = agentLabel.replace('agent:', '').trim();
      const state = STATUS_TO_STATE[statusLabel] || 'idle';
      updates[agentId] = { status: state };
    }
  }
  
  // Set idle agents back to idle if no issues
  const allAgents = ['hermes', 'openclaw', 'chatgpt', 'codex', 'claude', 'gemini'];
  for (const agent of allAgents) {
    if (!updates[agent]) {
      updates[agent] = { status: 'idle' };
    }
  }
  
  try {
    const res = await fetch(`${OFFICE_URL}/api/agents/batch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (res.ok) console.log('[COO] Office synced');
  } catch (e) {
    console.error('[COO] Office sync failed:', e.message);
  }
}
