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
test('cli render prints review summary', () => {
  const out = execFileSync('node', ['src/cli.js','render','fixtures/valid-plan.json'], {encoding:'utf8'});
  assert.match(out, /Dry-run plan/);
});
test('cli prints package version', () => {
  const out = execFileSync('node', ['src/cli.js','--version'], {encoding:'utf8'});
  assert.equal(out.trim(), '0.1.0');
});
test('cli help documents supported commands', () => {
  const r = spawnSync('node', ['src/cli.js','--help'], {encoding:'utf8'});
  assert.equal(r.status, 0);
  assert.match(r.stdout, /Usage: action-dryrun/);
  assert.match(r.stdout, /validate\|render\|audit\|summary/);
});
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
