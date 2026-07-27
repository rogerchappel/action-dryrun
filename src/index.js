export const RISK_LEVELS = ['read', 'draft', 'internal_write', 'external_write', 'public_publish'];

export const APPROVAL_POLICY = {
  read: { requiresApproval: false, approvers: [], reason: 'Read-only actions do not mutate systems.' },
  draft: { requiresApproval: false, approvers: [], reason: 'Draft actions create local or reviewable artifacts only.' },
  internal_write: { requiresApproval: true, approvers: ['owner'], reason: 'Internal writes change shared systems.' },
  external_write: { requiresApproval: true, approvers: ['owner', 'operator'], reason: 'External writes can affect third-party records.' },
  public_publish: { requiresApproval: true, approvers: ['owner', 'publisher'], reason: 'Public publishing needs explicit human review.' }
};

export function normalizeRisk(value) {
  if (!RISK_LEVELS.includes(value)) throw new Error(`Unknown risk level: ${value}`);
  return value;
}

function isRecord(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function policyForPlan(plan) {
  const risk = isRecord(plan?.action) ? plan.action.risk : undefined;
  return RISK_LEVELS.includes(risk) ? APPROVAL_POLICY[risk] : null;
}

function isValidEvidenceItem(item) {
  return isRecord(item) && isNonEmptyString(item.source) && isNonEmptyString(item.note);
}

export function validatePlan(plan) {
  const errors = [];
  if (!isRecord(plan)) return { ok: false, errors: ['plan must be an object'] };
  if (!isNonEmptyString(plan.id)) errors.push('id must be a non-empty string');
  if (!isNonEmptyString(plan.intent)) errors.push('intent must be a non-empty string');
  if (!isRecord(plan.action)) errors.push('action must be an object');
  if (isRecord(plan.action)) {
    if (!isNonEmptyString(plan.action.connector)) errors.push('action.connector must be a non-empty string');
    if (!isNonEmptyString(plan.action.operation)) errors.push('action.operation must be a non-empty string');
    if (!RISK_LEVELS.includes(plan.action.risk)) errors.push('action.risk must be one of ' + RISK_LEVELS.join(', '));
    if (!isRecord(plan.action.fields)) errors.push('action.fields must be an object');
  }
  if (!Array.isArray(plan.evidence) || plan.evidence.length === 0) {
    errors.push('evidence must contain at least one item');
  } else {
    plan.evidence.forEach((item, index) => {
      if (!isValidEvidenceItem(item)) {
        errors.push(`evidence[${index}] must contain non-empty source and note strings`);
      }
    });
  }
  const policy = policyForPlan(plan);
  if (policy?.requiresApproval && plan.requiresApproval !== true) errors.push(`${plan.action.risk} actions require approval`);
  if (plan.approved === true) errors.push('dry-run plans must not be pre-approved');
  return { ok: errors.length === 0, errors };
}

export function approvalPolicyFor(risk) {
  if (!risk) return null;
  return APPROVAL_POLICY[normalizeRisk(risk)];
}

export function renderMarkdown(plan) {
  const status = validatePlan(plan);
  const safePlan = isRecord(plan) ? plan : {};
  const action = isRecord(safePlan.action) ? safePlan.action : {};
  const policy = policyForPlan(safePlan);
  const lines = [
    `# Dry-run plan: ${isNonEmptyString(safePlan.id) ? safePlan.id : 'missing-id'}`, '',
    `Intent: ${isNonEmptyString(safePlan.intent) ? safePlan.intent : 'missing intent'}`,
    `Connector: ${isNonEmptyString(action.connector) ? action.connector : 'missing'}`,
    `Operation: ${isNonEmptyString(action.operation) ? action.operation : 'missing'}`,
    `Risk: ${isNonEmptyString(action.risk) ? action.risk : 'missing'}`,
    `Approval required: ${safePlan.requiresApproval ? 'yes' : 'no'}`, '',
    '## Approval policy',
    `Required by policy: ${policy?.requiresApproval ? 'yes' : 'no'}`,
    `Approvers: ${policy?.approvers?.length ? policy.approvers.join(', ') : 'none'}`,
    `Reason: ${policy?.reason || 'unknown risk level'}`, '',
    '## Fields'
  ];
  if (isRecord(action.fields)) {
    for (const [key,value] of Object.entries(action.fields)) lines.push(`- ${key}: ${JSON.stringify(value)}`);
  }
  lines.push('', '## Evidence');
  if (Array.isArray(safePlan.evidence)) {
    for (const item of safePlan.evidence) {
      lines.push(isValidEvidenceItem(item) ? `- ${item.source}: ${item.note}` : '- Invalid evidence item');
    }
  }
  if (!status.ok) lines.push('', '## Validation errors', ...status.errors.map(e => `- ${e}`));
  return lines.join('\n') + '\n';
}

export function summarizePlan(plan) {
  const validation = validatePlan(plan);
  const policy = policyForPlan(plan);
  return {
    id: plan?.id ?? null,
    connector: plan?.action?.connector ?? null,
    operation: plan?.action?.operation ?? null,
    risk: plan?.action?.risk ?? null,
    ok: validation.ok,
    approvalRequired: policy?.requiresApproval ?? false,
    evidenceCount: Array.isArray(plan?.evidence) ? plan.evidence.filter(isValidEvidenceItem).length : 0,
    errorCount: validation.errors.length
  };
}

export function auditRecord(plan, actor='agent') {
  const validation = validatePlan(plan);
  const policy = policyForPlan(plan);
  return {
    type: 'action-dryrun.audit.v1',
    planId: plan?.id ?? null,
    actor,
    risk: plan?.action?.risk ?? null,
    connector: plan?.action?.connector ?? null,
    operation: plan?.action?.operation ?? null,
    approved: false,
    approvalRequired: policy?.requiresApproval ?? false,
    requiredApprovers: policy?.approvers ?? [],
    validation,
    createdAt: new Date().toISOString()
  };
}
