#!/usr/bin/env node
import fs from 'fs';
import { validatePlan, renderMarkdown, auditRecord, summarizePlan } from './index.js';

const VERSION = '0.1.0';

function load(file) { return JSON.parse(fs.readFileSync(file, 'utf8')); }
const [cmd, file, ...rest] = process.argv.slice(2);
if (!cmd || cmd === '--help') {
  console.log('Usage: action-dryrun <validate|render|audit|summary> plan.json [--actor name]\n       action-dryrun --version');
  process.exit(cmd ? 0 : 1);
}
if (cmd === '--version' || cmd === '-v' || cmd === 'version') {
  console.log(VERSION);
  process.exit(0);
}
try {
  const plan = load(file);
  if (cmd === 'validate') {
    const result = validatePlan(plan);
    console.log(JSON.stringify(result, null, 2));
    process.exit(result.ok ? 0 : 2);
  }
  if (cmd === 'render') { process.stdout.write(renderMarkdown(plan)); process.exit(0); }
  if (cmd === 'audit') {
    const actor = rest[rest.indexOf('--actor') + 1] || 'agent';
    console.log(JSON.stringify(auditRecord(plan, actor), null, 2)); process.exit(0);
  }
  if (cmd === 'summary') { console.log(JSON.stringify(summarizePlan(plan), null, 2)); process.exit(0); }
  throw new Error('Unknown command: ' + cmd);
} catch (err) { console.error(err.message); process.exit(1); }
