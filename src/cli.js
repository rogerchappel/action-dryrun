#!/usr/bin/env node
import fs from 'fs';
import { validatePlan, renderMarkdown, auditRecord, summarizePlan } from './index.js';

const VERSION = '0.1.0';

function load(file) { return JSON.parse(fs.readFileSync(file, 'utf8')); }
function parseArguments(cmd, file, rest) {
  if (!['validate', 'render', 'audit', 'summary'].includes(cmd)) throw new Error('Unknown command: ' + cmd);
  if (!file) throw new Error('Missing plan file');
  if (cmd !== 'audit' && rest.length) {
    throw new Error(rest[0].startsWith('-') ? 'Unknown option: ' + rest[0] : 'Unexpected argument: ' + rest[0]);
  }
  if (cmd === 'audit') {
    if (!rest.length) return { actor: 'agent' };
    if (rest[0] !== '--actor') {
      throw new Error(rest[0].startsWith('-') ? 'Unknown option: ' + rest[0] : 'Unexpected argument: ' + rest[0]);
    }
    if (!rest[1]) throw new Error('--actor requires a non-empty name');
    if (rest.length > 2) {
      throw new Error(rest[2].startsWith('-') ? 'Unknown option: ' + rest[2] : 'Unexpected argument: ' + rest[2]);
    }
    return { actor: rest[1] };
  }
  return {};
}
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
  const { actor } = parseArguments(cmd, file, rest);
  const plan = load(file);
  if (cmd === 'validate') {
    const result = validatePlan(plan);
    console.log(JSON.stringify(result, null, 2));
    process.exit(result.ok ? 0 : 2);
  }
  if (cmd === 'render') { process.stdout.write(renderMarkdown(plan)); process.exit(0); }
  if (cmd === 'audit') {
    console.log(JSON.stringify(auditRecord(plan, actor), null, 2)); process.exit(0);
  }
  if (cmd === 'summary') { console.log(JSON.stringify(summarizePlan(plan), null, 2)); process.exit(0); }
} catch (err) { console.error(err.message); process.exit(1); }
