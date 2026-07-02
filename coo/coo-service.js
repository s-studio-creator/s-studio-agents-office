#!/usr/bin/env node
/**
 * COO — Chief Operating Officer Service
 * 
 * Polls GitHub, decides next actions, orchestrates agents.
 * Runs forever. Only sleeps when everything is done.
 */

import fetch from 'node-fetch';
import { decide } from './decision.js';
import { syncOffice } from './sync-office.js';

const GITHUB_TOKEN = process.env.GITHUB_TOKEN || '';
const OWNER = process.env.GITHUB_OWNER || 's-studio-creator';
const REPO = process.env.GITHUB_REPO || 's-studio-agents-office';
const POLL_INTERVAL = process.env.POLL_INTERVAL || 60_000; // 1 minute
const OFFICE_URL = process.env.OFFICE_URL || 'http://localhost:3100';

const GITHUB_API = `https://api.github.com/repos/${OWNER}/${REPO}`;

const headers = {
  'Authorization': `token ${GITHUB_TOKEN}`,
  'Accept': 'application/vnd.github.v3+json',
  'User-Agent': 'coo-service/0.1',
};

const LABEL_TRANSITIONS = {
  'status: ready':       'status: in-progress',
  'status: in-progress': 'status: review',
  'status: review':      'status: approved',
  'status: approved':    'status: done',
};

async function getIssues() {
  try {
    const res = await fetch(`${GITHUB_API}/issues?state=open&per_page=30`, { headers });
    if (!res.ok) throw new Error(`GitHub API: ${res.status}`);
    return await res.json();
  } catch (e) {
    console.error(`[COO] Failed to fetch issues:`, e.message);
    return [];
  }
}

async function getPRs() {
  try {
    const res = await fetch(`${GITHUB_API}/pulls?state=open&per_page=10`, { headers });
    if (!res.ok) throw new Error(`GitHub API: ${res.status}`);
    return await res.json();
  } catch (e) {
    console.error(`[COO] Failed to fetch PRs:`, e.message);
    return [];
  }
}

async function assignIssue(issue, agent) {
  try {
    await fetch(`${GITHUB_API}/issues/${issue.number}/assignees`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ assignees: [agent] }),
    });
    console.log(`[COO] Assigned #${issue.number} to ${agent}`);
  } catch (e) {
    console.error(`[COO] Assign failed:`, e.message);
  }
}

async function updateLabels(issue, newLabel) {
  const currentLabels = issue.labels.map(l => l.name);
  const filteredLabels = currentLabels.filter(l => !l.startsWith('status:'));
  filteredLabels.push(newLabel);
  
  try {
    await fetch(`${GITHUB_API}/issues/${issue.number}/labels`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({ labels: filteredLabels }),
    });
    console.log(`[COO] Updated #${issue.number} → ${newLabel}`);
  } catch (e) {
    console.error(`[COO] Label update failed:`, e.message);
  }
}

async function notifyOffice(agent, status) {
  try {
    await fetch(`${OFFICE_URL}/api/agents/${agent}/status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
  } catch (_) {}
}

async function checkChecks(pr) {
  // Check CI status
  try {
    const res = await fetch(pr.statuses_url, { headers });
    const statuses = await res.json();
    const latest = statuses[0];
    if (latest && latest.state === 'success') return 'pass';
    if (latest && latest.state === 'failure') return 'fail';
    return 'running';
  } catch (_) {
    return 'unknown';
  }
}

async function cycle() {
  console.log(`\n[COO] 🔄 Cycle at ${new Date().toISOString()}`);
  
  const issues = await getIssues();
  const prs = await getPRs();
  
  // Merge PR data into issues
  for (const issue of issues) {
    const pr = prs.find(p => 
      p.number === issue.number || 
      p.head?.label?.includes(`#${issue.number}`)
    );
    if (pr) issue.pull_request = pr;
  }
  
  for (const issue of issues) {
    const action = decide(issue);
    if (!action) continue;
    
    console.log(`[COO] 🎯 #${issue.number}: ${action.action} → ${action.message}`);
    
    switch (action.action) {
      case 'assign_agent':
        await assignIssue(issue, action.agent);
        await updateLabels(issue, 'status: in-progress');
        await notifyOffice(action.agent, 'typing');
        break;
        
      case 'request_review':
        await updateLabels(issue, 'status: review');
        await notifyOffice('chatgpt', 'reviewing');
        break;
        
      case 'close_issue':
        await updateLabels(issue, 'status: done');
        // Close the issue
        await fetch(`${GITHUB_API}/issues/${issue.number}`, {
          method: 'PATCH',
          headers,
          body: JSON.stringify({ state: 'closed' }),
        });
        break;
        
      case 'escalate':
        console.log(`[COO] 📢 ESCALATION: ${action.message}`);
        // TODO: Send to Sammi via Telegram/Slack
        await notifyOffice('hermes', 'waiting');
        break;
    }
  }
  
  // Sync office visual
  await syncOffice(issues);
  
  console.log(`[COO] 💤 Sleeping ${POLL_INTERVAL/1000}s...`);
}

// ── Run forever ──
console.log(`
╔══════════════════════════════╗
║   🤖 S.STUDIO COO SERVICE   ║
║   Watching ${OWNER}/${REPO}  ║
║   Poll: ${POLL_INTERVAL/1000}s interval    ║
╚══════════════════════════════╝
`);

cycle();
setInterval(cycle, POLL_INTERVAL);
