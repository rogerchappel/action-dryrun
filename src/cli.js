#!/usr/bin/env node
import fs from 'fs';
import { validatePlan, renderMarkdown, auditRecord } from './index.js';

function load(file) { return JSON.parse(fs.readFileSync(file, 'utf8')); }
const [cmd, file, ...rest] = process.argv.slice(2);
if (!cmd || cmd === '--help') {
  console.log('Usage: action-dryrun <validate|render|audit> plan.json [--actor name]');
  process.exit(cmd ? 0 : 1);
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
  throw new Error('Unknown command: ' + cmd);
} catch (err) { console.error(err.message); process.exit(1); }
