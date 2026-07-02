/**
 * COO Decision Engine
 * 
 * Pure logic. No LLM. Maps GitHub issue state → next action.
 */

const STATUS = {
  READY:       'status: ready',
  IN_PROGRESS: 'status: in-progress',
  REVIEW:      'status: review',
  APPROVED:    'status: approved',
  BLOCKED:     'status: blocked',
  DONE:        'status: done',
};

const AGENT_LABELS = {
  'agent: hermes':   'hermes',
  'agent: openclaw': 'openclaw',
  'agent: chatgpt':  'chatgpt',
  'agent: codex':    'codex',
  'agent: claude':   'claude',
  'agent: gemini':   'gemini',
};

export function decide(issue) {
  const labels = issue.labels.map(l => l.name);
  const isPR = !!issue.pull_request;
  const isMerged = isPR && issue.pull_request?.merged_at;
  const hasAssignment = !!issue.assignee;
  const hoursSinceCreation = (Date.now() - new Date(issue.created_at)) / 3600000;

  // ── 1. New issue, needs assignment ──
  if (labels.includes(STATUS.READY) && !hasAssignment) {
    const agent = pickAgent(labels);
    if (agent) {
      return {
        action: 'assign_agent',
        agent,
        message: `🛠 Assigning to ${agent}`
      };
    }
    return {
      action: 'escalate',
      to: 'sammi',
      message: `⚠️ No agent label found for issue #${issue.number}`
    };
  }

  // ── 2. In progress, PR opened → request review ──
  if (labels.includes(STATUS.IN_PROGRESS) && isPR && !isMerged) {
    return {
      action: 'request_review',
      agent: 'chatgpt',
      message: `🔍 PR #${issue.number} ready for review`
    };
  }

  // ── 3. Review approved, PR merged → close ──
  if (labels.includes(STATUS.APPROVED) && isMerged) {
    return {
      action: 'close_issue',
      message: `✅ Issue #${issue.number} merged & done`
    };
  }

  // ── 4. Blocked for >24h → escalate to Sammi ──
  if (labels.includes(STATUS.BLOCKED) && hoursSinceCreation > 24) {
    return {
      action: 'escalate',
      to: 'sammi',
      message: `🚨 Issue #${issue.number} blocked for >24h`
    };
  }

  // ── 5. Review done → mark approved ──
  if (labels.includes(STATUS.REVIEW) && isPR && isMerged) {
    // Wait — should be handled above
    return null;
  }

  return null; // nothing to do
}

function pickAgent(labels) {
  for (const label of labels) {
    if (AGENT_LABELS[label]) return AGENT_LABELS[label];
  }
  // Fallback: try to infer from issue title/body
  return null;
}

export function shouldActOn(issue) {
  const action = decide(issue);
  return action !== null;
}
