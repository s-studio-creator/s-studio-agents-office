#!/usr/bin/env node
/**
 * S.STUDIO Agent Client
 * 
 * Call this from your AI agents (OpenClaw, Hermes, ChatGPT) to update
 * their status in the pixel art office.
 * 
 * Usage:
 *   node agent-client.js <agent-id> <status>
 * 
 * Examples:
 *   node agent-client.js hermes idle
 *   node agent-client.js openclaw typing
 *   node agent-client.js chatgpt reviewing
 * 
 *   node agent-client.js batch '{"hermes":{"status":"typing"},"openclaw":{"status":"reading"}}'
 * 
 * Status values: idle, typing, reading, reviewing, waiting, done
 */

const OFFICE_URL = process.env.OFFICE_URL || 'http://localhost:3100';

const agent = process.argv[2];
const status = process.argv[3];

async function main() {
  if (agent === 'batch') {
    const updates = JSON.parse(status);
    const res = await fetch(`${OFFICE_URL}/api/agents/batch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    const data = await res.json();
    console.log(`[Agent Client] Batch update:`, data);
    return;
  }

  if (!agent || !status) {
    console.log(`Usage: node agent-client.js <agent-id> <status>`);
    console.log(`       node agent-client.js batch '{"agent":{"status":"..."}}'`);
    console.log(`\nAgent IDs: hermes, openclaw, chatgpt`);
    console.log(`Statuses: idle, typing, reading, reviewing, waiting, done`);
    process.exit(1);
  }

  const res = await fetch(`${OFFICE_URL}/api/agents/${agent}/status`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  
  if (res.ok) {
    const data = await res.json();
    console.log(`[Agent Client] ${data.name} → ${data.status}: ${data.statusText}`);
  } else {
    console.error(`[Agent Client] Error: ${res.status} ${res.statusText}`);
    process.exit(1);
  }
}

main().catch(console.error);
