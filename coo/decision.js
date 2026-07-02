/**
 * COO Decision Engine
 * 
 * Pure logic. No LLM. Maps GitHub issue state → next action.
 * Knows ALL 6 agents: Hermes, OpenClaw, ChatGPT, Codex, Claude, Gemini
 */

const STATUS = {
  READY:       'status: ready',
  IN_PROGRESS: 'status: in-progress',
  REVIEW:      'status: review',
  APPROVED:    'status: approved',
  BLOCKED:     'status: blocked',
  DONE:        'status: done',
  INFRA_READY: 'status: infra-ready',  // Codex finished infra
};

const AGENT_LABELS = {
  'agent: hermes':   { id: 'hermes',   role: 'pm',       team: 'product' },
  'agent: openclaw': { id: 'openclaw', role: 'engineer', team: 'engineering' },
  'agent: chatgpt':  { id: 'chatgpt',  role: 'qa',       team: 'executive' },
  'agent: codex':    { id: 'codex',    role: 'infra',    team: 'engineering' },
  'agent: claude':   { id: 'claude',   role: 'design',   team: 'design' },
  'agent: gemini':   { id: 'gemini',   role: 'research', team: 'research' },
};

// ── Workflow templates for each agent role ──
const WORKFLOWS = {
  /** PM: Hermes plans, then dispatches to others */
  pm: {
    assignLabel: 'status: in-progress',
    estimateHours: 2,
  },
  /** Engineer: OpenClaw codes, opens PR, waits for review */
  engineer: {
    assignLabel: 'status: in-progress',
    nextOnPR: { action: 'request_review', agent: 'chatgpt', label: 'status: review' },
  },
  /** QA: ChatGPT reviews the PR */
  qa: {
    // QA is triggered by PR reviews, not issues
    skipAssignment: true,
  },
  /** Infra: Codex sets up pipelines, then hands off */
  infra: {
    assignLabel: 'status: in-progress',
    completionLabel: 'status: infra-ready',
    handoffMessage: '🏗 Infrastructure ready. Engineering can proceed.',
    /**
     * Codex flow:
     *   Issue with "agent: codex" + "status: ready"
     *   → Assign to Codex → Codex works → Codex finishes
     *   → COO detects "infra-ready" → Finds linked engineering issue → Assigns to OpenClaw
     */
  },
  /** Design: Claude creates Figma files */
  design: {
    assignLabel: 'status: in-progress',
    completionLabel: 'status: design-ready',
    handoffMessage: '🎨 Design ready. Engineering can proceed.',
  },
  /** Research: Gemini researches, writes summary */
  research: {
    assignLabel: 'status: in-progress',
    completionLabel: 'status: research-done',
    handoffMessage: '🔍 Research complete. Check the summary.',
  },
};

export function decide(issue) {
  const labels = issue.labels.map(l => l.name);
  const isPR = !!issue.pull_request;
  const isMerged = isPR && issue.pull_request?.merged_at;
  const hasAssignee = !!issue.assignee;
  const hoursSinceCreation = (Date.now() - new Date(issue.created_at)) / 3600000;
  const agentInfo = pickAgent(labels);
  const role = agentInfo?.role;
  const workflow = WORKFLOWS[role];

  // ── 0. Dependency chain: check for handoffs ──
  // If issue body references another issue (e.g. "depends on: #3")
  // and that issue is done, we can proceed
  const dependsMatch = issue.body?.match(/depends[:\s]+#(\d+)/i);
  const dependsOnIssue = dependsMatch ? parseInt(dependsMatch[1]) : null;

  // ── 1. New issue, needs assignment ──
  if (labels.includes(STATUS.READY) && !hasAssignee) {
    if (!agentInfo) {
      return {
        action: 'escalate',
        to: 'sammi',
        message: `⚠️ Issue #${issue.number} has no agent label!\nLabels: ${labels.join(', ')}`,
      };
    }

    const action = {
      action: 'assign_agent',
      agent: agentInfo.id,
      role: role,
      message: `🛠 Assigning #${issue.number} to ${agentInfo.id} (${role})`,
      newLabel: workflow?.assignLabel || 'status: in-progress',
    };

    // If this is an infra/design task, check if engineering task exists to handoff to
    if (role === 'infra' || role === 'design') {
      action.completionLabel = workflow?.completionLabel;
      action.handoffMessage = workflow?.handoffMessage;
    }

    return action;
  }

  // ── 2. Codex finished infra → handoff to OpenClaw ──
  if (labels.includes(STATUS.INFRA_READY) && role === 'infra') {
    return {
      action: 'handoff',
      from: 'codex',
      to: 'openclaw',
      message: `🏗 Codex finished infra for #${issue.number}. Handing to OpenClaw.`,
      newLabel: 'status: ready',
      newAgent: 'openclaw',
    };
  }

  // ── 3. Claude finished design → handoff to OpenClaw ──
  if (labels.includes('status: design-ready')) {
    return {
      action: 'handoff',
      from: 'claude',
      to: 'openclaw',
      message: `🎨 Design complete for #${issue.number}. Handing to OpenClaw.`,
      newLabel: 'status: ready',
      newAgent: 'openclaw',
    };
  }

  // ── 4. Engineer in progress, PR opened → request QA review ──
  if (role === 'engineer' && labels.includes(STATUS.IN_PROGRESS) && isPR && !isMerged) {
    return {
      action: 'request_review',
      agent: 'chatgpt',
      message: `🔍 PR #${issue.number} ready for review`,
      newLabel: 'status: review',
    };
  }

  // ── 5. Review done: PR merged → close ──
  if (labels.includes(STATUS.APPROVED) && isMerged) {
    return {
      action: 'close_issue',
      message: `✅ Issue #${issue.number} merged & done`,
      newLabel: 'status: done',
    };
  }

  // ── 6. Codex issue: detect completion ──
  // If Codex was assigned and issue is updated to "infra-ready"
  if (role === 'infra' && labels.includes(STATUS.DONE)) {
    return {
      action: 'handoff',
      from: 'codex',
      to: 'openclaw',
      message: `🏗 Codex done. Next: OpenClaw builds.`,
      newLabel: 'status: ready',
      disposeLabel: true,
    };
  }

  // ── 7. Blocked for >24h → escalate ──
  if (labels.includes(STATUS.BLOCKED) && hoursSinceCreation > 24) {
    const agent = agentInfo?.id || 'unknown';
    return {
      action: 'escalate',
      to: 'sammi',
      message: `🚨 Issue #${issue.number} blocked for >24h!\nAgent: ${agent}\nTitle: ${issue.title}`,
    };
  }

  // ── 8. Research complete → notify ──
  if (labels.includes('status: research-done')) {
    return {
      action: 'notify',
      to: 'hermes',
      message: `🔍 Research complete for #${issue.number}. Check Gemini's findings.`,
    };
  }

  return null; // nothing to do
}

function pickAgent(labels) {
  for (const label of labels) {
    if (AGENT_LABELS[label]) return AGENT_LABELS[label];
  }
  return null;
}

export function shouldActOn(issue) {
  return decide(issue) !== null;
}

export function getAgentForIssue(issue) {
  return pickAgent(issue.labels.map(l => l.name));
}

export function getAgentRole(agentId) {
  for (const [label, info] of Object.entries(AGENT_LABELS)) {
    if (info.id === agentId) return info.role;
  }
  return null;
}
