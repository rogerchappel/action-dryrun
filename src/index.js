export const RISK_LEVELS = ['read', 'draft', 'internal_write', 'external_write', 'public_publish'];

export function normalizeRisk(value) {
  if (!RISK_LEVELS.includes(value)) throw new Error(`Unknown risk level: ${value}`);
  return value;
}

export function validatePlan(plan) {
  const errors = [];
  if (!plan || typeof plan !== 'object') errors.push('plan must be an object');
  if (!plan.id) errors.push('id is required');
  if (!plan.intent) errors.push('intent is required');
  if (!plan.action || typeof plan.action !== 'object') errors.push('action object is required');
  if (plan.action) {
    if (!plan.action.connector) errors.push('action.connector is required');
    if (!plan.action.operation) errors.push('action.operation is required');
    if (!RISK_LEVELS.includes(plan.action.risk)) errors.push('action.risk must be one of ' + RISK_LEVELS.join(', '));
  }
  if (!Array.isArray(plan.evidence) || plan.evidence.length === 0) errors.push('evidence must contain at least one item');
  if (plan.requiresApproval !== true && ['external_write','public_publish'].includes(plan.action?.risk)) errors.push('external writes and public publishes require approval');
  if (plan.approved === true) errors.push('dry-run plans must not be pre-approved');
  return { ok: errors.length === 0, errors };
}

export function renderMarkdown(plan) {
  const status = validatePlan(plan);
  const lines = [
    `# Dry-run plan: ${plan.id || 'missing-id'}`, '',
    `Intent: ${plan.intent || 'missing intent'}`,
    `Connector: ${plan.action?.connector || 'missing'}`,
    `Operation: ${plan.action?.operation || 'missing'}`,
    `Risk: ${plan.action?.risk || 'missing'}`,
    `Approval required: ${plan.requiresApproval ? 'yes' : 'no'}`, '',
    '## Fields'
  ];
  for (const [key,value] of Object.entries(plan.action?.fields || {})) lines.push(`- ${key}: ${JSON.stringify(value)}`);
  lines.push('', '## Evidence');
  for (const item of plan.evidence || []) lines.push(`- ${item.source}: ${item.note}`);
  if (!status.ok) lines.push('', '## Validation errors', ...status.errors.map(e => `- ${e}`));
  return lines.join('\n') + '\n';
}

export function auditRecord(plan, actor='agent') {
  const validation = validatePlan(plan);
  return {
    type: 'action-dryrun.audit.v1',
    planId: plan.id,
    actor,
    risk: plan.action?.risk,
    connector: plan.action?.connector,
    operation: plan.action?.operation,
    approved: false,
    validation,
    createdAt: new Date().toISOString()
  };
}
