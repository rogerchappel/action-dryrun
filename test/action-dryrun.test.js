import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import { execFileSync, spawnSync } from 'child_process';
import { validatePlan, renderMarkdown, auditRecord, approvalPolicyFor, summarizePlan } from '../src/index.js';

const valid = JSON.parse(fs.readFileSync('fixtures/valid-plan.json','utf8'));
const unsafe = JSON.parse(fs.readFileSync('fixtures/unsafe-plan.json','utf8'));

test('validates safe dry-run plans', () => assert.equal(validatePlan(valid).ok, true));
test('returns validation errors for a null plan', () => {
  assert.deepEqual(validatePlan(null), { ok: false, errors: ['plan must be an object'] });
});
test('rejects malformed public plan fields', () => {
  const cases = [
    [{ ...valid, id: 123 }, 'id must be a non-empty string'],
    [{ ...valid, id: '   ' }, 'id must be a non-empty string'],
    [{ ...valid, intent: [] }, 'intent must be a non-empty string'],
    [{ ...valid, action: [] }, 'action must be an object'],
    [{ ...valid, action: { ...valid.action, connector: 7 } }, 'action.connector must be a non-empty string'],
    [{ ...valid, action: { ...valid.action, operation: true } }, 'action.operation must be a non-empty string'],
    [{ ...valid, action: { ...valid.action, fields: [] } }, 'action.fields must be an object'],
  ];

  for (const [plan, error] of cases) assert.ok(validatePlan(plan).errors.includes(error));
});
test('rejects malformed evidence entries', () => {
  for (const evidence of [
    ['citation'],
    [{}],
    [{ source: '', note: 'usable' }],
    [{ source: 'fixture', note: '   ' }],
  ]) {
    const result = validatePlan({ ...valid, evidence });
    assert.equal(result.ok, false);
    assert.match(result.errors.join('\n'), /evidence\[0\]/);
  }
});
test('accepts the documented plan schema', () => {
  assert.deepEqual(validatePlan(valid), { ok: true, errors: [] });
});
test('accepts boolean or omitted approval fields according to policy', () => {
  assert.equal(validatePlan({ ...valid, requiresApproval: false, approved: false }).ok, true);
  const { requiresApproval, approved, ...withoutApprovalFields } = valid;
  assert.equal(validatePlan(withoutApprovalFields).ok, true);
});
test('rejects non-boolean approval fields with field-specific errors', () => {
  for (const [field, value] of [
    ['requiresApproval', 'false'],
    ['requiresApproval', 1],
    ['approved', 'yes'],
    ['approved', null],
  ]) {
    const result = validatePlan({ ...valid, [field]: value });
    assert.equal(result.ok, false);
    assert.ok(result.errors.includes(`${field} must be a boolean when provided`));
  }
});
test('rejects unsafe external writes without approval', () => {
  const result = validatePlan(unsafe); assert.equal(result.ok, false); assert.match(result.errors.join(' '), /require approval/);
});
test('renders markdown with evidence', () => assert.match(renderMarkdown(valid), /## Evidence/));
test('maps risk levels to approval policy', () => {
  const policy = approvalPolicyFor('public_publish');
  assert.equal(policy.requiresApproval, true);
  assert.deepEqual(policy.approvers, ['owner', 'publisher']);
});
test('renders approval policy in markdown', () => {
  assert.match(renderMarkdown(valid), /## Approval policy/);
});
test('emits audit records that remain unapproved', () => assert.equal(auditRecord(valid, 'ci').approved, false));
test('summarizes plans for router handoff', () => {
  const summary = summarizePlan(valid);
  assert.equal(summary.ok, true);
  assert.equal(summary.evidenceCount, 1);
});
test('render, summary, and audit safely describe invalid input', () => {
  for (const plan of [null, { ...valid, action: null, evidence: ['citation'] }]) {
    assert.doesNotThrow(() => renderMarkdown(plan));
    assert.doesNotThrow(() => summarizePlan(plan));
    assert.doesNotThrow(() => auditRecord(plan));
  }

  const markdown = renderMarkdown({ ...valid, evidence: ['citation'] });
  assert.doesNotMatch(markdown, /undefined/);
  assert.match(markdown, /Invalid evidence item/);
  assert.equal(summarizePlan({ ...valid, evidence: ['citation'] }).evidenceCount, 0);
  assert.equal(auditRecord(null).planId, null);
});
test('render, summary, and audit do not treat malformed strings as approval state', () => {
  const plan = { ...valid, requiresApproval: 'false', approved: 'yes' };
  assert.match(renderMarkdown(plan), /Approval required: no/);
  assert.equal(summarizePlan(plan).approvalRequired, false);
  assert.equal(auditRecord(plan).approved, false);
  assert.equal(auditRecord(plan).approvalRequired, false);
});
test('render, summary, and audit safely handle an unknown risk', () => {
  const plan = { ...valid, action: { ...valid.action, risk: 'surprise' } };
  assert.doesNotThrow(() => renderMarkdown(plan));
  assert.doesNotThrow(() => summarizePlan(plan));
  assert.doesNotThrow(() => auditRecord(plan));
});
test('cli validate returns nonzero for invalid plans', () => {
  const r = spawnSync('node', ['src/cli.js','validate','fixtures/unsafe-plan.json'], {encoding:'utf8'});
  assert.equal(r.status, 2); assert.match(r.stdout, /public_publish actions require approval/);
});
test('cli validate returns validation errors for a null plan', () => {
  const r = spawnSync('node', ['src/cli.js','validate','fixtures/null-plan.json'], {encoding:'utf8'});
  assert.equal(r.status, 2);
  assert.deepEqual(JSON.parse(r.stdout), { ok: false, errors: ['plan must be an object'] });
  assert.equal(r.stderr, '');
});
test('cli validate rejects malformed approval booleans', () => {
  const r = spawnSync('node', ['src/cli.js','validate','fixtures/malformed-approval-plan.json'], {encoding:'utf8'});
  assert.equal(r.status, 2);
  assert.deepEqual(JSON.parse(r.stdout).errors, [
    'requiresApproval must be a boolean when provided',
    'approved must be a boolean when provided',
  ]);
  assert.equal(r.stderr, '');
});
test('cli render prints review summary', () => {
  const out = execFileSync('node', ['src/cli.js','render','fixtures/valid-plan.json'], {encoding:'utf8'});
  assert.match(out, /Dry-run plan/);
});
for (const versionCommand of ['--version', '-v', 'version']) {
  test(`cli prints package version for ${versionCommand}`, () => {
    const out = execFileSync('node', ['src/cli.js', versionCommand], {encoding:'utf8'});
    assert.equal(out.trim(), '0.1.0');
  });
}
test('cli help documents supported commands', () => {
  const r = spawnSync('node', ['src/cli.js','--help'], {encoding:'utf8'});
  assert.equal(r.status, 0);
  assert.match(r.stdout, /Usage: action-dryrun/);
  assert.match(r.stdout, /validate\|render\|audit\|summary/);
});
for (const [command, trailing, diagnostic] of [
  ['--help', 'extra', /Unexpected argument: extra/],
  ['--help', '--unknown', /Unknown option: --unknown/],
  ['--version', 'extra', /Unexpected argument: extra/],
  ['-v', '--unknown', /Unknown option: --unknown/],
  ['version', 'extra', /Unexpected argument: extra/],
]) {
  test(`cli rejects trailing input for ${command}`, () => {
    const r = spawnSync('node', ['src/cli.js', command, trailing], {encoding:'utf8'});
    assert.equal(r.status, 1);
    assert.equal(r.stdout, '');
    assert.match(r.stderr, diagnostic);
  });
}
test('cli summary prints compact json', () => {
  const out = execFileSync('node', ['src/cli.js','summary','fixtures/valid-plan.json'], {encoding:'utf8'});
  assert.equal(JSON.parse(out).ok, true);
});
test('cli audit accepts an explicit actor', () => {
  const out = execFileSync('node', ['src/cli.js','audit','fixtures/valid-plan.json','--actor','reviewer'], {encoding:'utf8'});
  assert.equal(JSON.parse(out).actor, 'reviewer');
});
test('cli audit defaults to the agent actor when absent', () => {
  const out = execFileSync('node', ['src/cli.js','audit','fixtures/valid-plan.json'], {encoding:'utf8'});
  assert.equal(JSON.parse(out).actor, 'agent');
});
for (const [name, args, diagnostic] of [
  ['stray positional input', ['audit','fixtures/valid-plan.json','unexpected'], /Unexpected argument: unexpected/],
  ['unknown options', ['audit','fixtures/valid-plan.json','--unknown'], /Unknown option: --unknown/],
  ['a missing actor value', ['audit','fixtures/valid-plan.json','--actor'], /--actor requires a non-empty name/],
  ['an empty actor value', ['audit','fixtures/valid-plan.json','--actor',''], /--actor requires a non-empty name/],
]) {
  test(`cli rejects ${name} without emitting an audit record`, () => {
    const r = spawnSync('node', ['src/cli.js', ...args], {encoding:'utf8'});
    assert.equal(r.status, 1);
    assert.equal(r.stdout, '');
    assert.match(r.stderr, diagnostic);
  });
}
