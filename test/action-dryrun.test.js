import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import { execFileSync, spawnSync } from 'child_process';
import { validatePlan, renderMarkdown, auditRecord, approvalPolicyFor, summarizePlan } from '../src/index.js';

const valid = JSON.parse(fs.readFileSync('fixtures/valid-plan.json','utf8'));
const unsafe = JSON.parse(fs.readFileSync('fixtures/unsafe-plan.json','utf8'));

test('validates safe dry-run plans', () => assert.equal(validatePlan(valid).ok, true));
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
test('cli render prints review summary', () => {
  const out = execFileSync('node', ['src/cli.js','render','fixtures/valid-plan.json'], {encoding:'utf8'});
  assert.match(out, /Dry-run plan/);
});
test('cli prints package version', () => {
  const out = execFileSync('node', ['src/cli.js','--version'], {encoding:'utf8'});
  assert.equal(out.trim(), '0.1.0');
});
test('cli summary prints compact json', () => {
  const out = execFileSync('node', ['src/cli.js','summary','fixtures/valid-plan.json'], {encoding:'utf8'});
  assert.equal(JSON.parse(out).ok, true);
});
