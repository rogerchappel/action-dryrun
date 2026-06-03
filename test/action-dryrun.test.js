import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import { execFileSync, spawnSync } from 'child_process';
import { validatePlan, renderMarkdown, auditRecord } from '../src/index.js';

const valid = JSON.parse(fs.readFileSync('fixtures/valid-plan.json','utf8'));
const unsafe = JSON.parse(fs.readFileSync('fixtures/unsafe-plan.json','utf8'));

test('validates safe dry-run plans', () => assert.equal(validatePlan(valid).ok, true));
test('rejects unsafe external writes without approval', () => {
  const result = validatePlan(unsafe); assert.equal(result.ok, false); assert.match(result.errors.join(' '), /require approval/);
});
test('renders markdown with evidence', () => assert.match(renderMarkdown(valid), /## Evidence/));
test('emits audit records that remain unapproved', () => assert.equal(auditRecord(valid, 'ci').approved, false));
test('cli validate returns nonzero for invalid plans', () => {
  const r = spawnSync('node', ['src/cli.js','validate','fixtures/unsafe-plan.json'], {encoding:'utf8'});
  assert.equal(r.status, 2); assert.match(r.stdout, /external writes/);
});
test('cli render prints review summary', () => {
  const out = execFileSync('node', ['src/cli.js','render','fixtures/valid-plan.json'], {encoding:'utf8'});
  assert.match(out, /Dry-run plan/);
});
test('cli prints package version', () => {
  const out = execFileSync('node', ['src/cli.js','--version'], {encoding:'utf8'});
  assert.equal(out.trim(), '0.1.0');
});
