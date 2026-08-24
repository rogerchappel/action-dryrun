#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUT="$ROOT/.tmp/demo-review-loop"

mkdir -p "$OUT"

echo "== validate safe draft plan =="
node "$ROOT/src/cli.js" validate "$ROOT/fixtures/valid-plan.json" | tee "$OUT/valid-result.json"

echo
echo "== render review markdown =="
node "$ROOT/src/cli.js" render "$ROOT/fixtures/valid-plan.json" | tee "$OUT/valid-review.md" | sed -n '1,28p'

echo
echo "== capture audit record =="
node "$ROOT/src/cli.js" audit "$ROOT/fixtures/valid-plan.json" --actor demo-reviewer | tee "$OUT/audit-record.json"

echo
echo "== validate unsafe publish plan =="
set +e
node "$ROOT/src/cli.js" validate "$ROOT/fixtures/unsafe-plan.json" > "$OUT/unsafe-result.json"
status=$?
set -e
cat "$OUT/unsafe-result.json"
if [[ "$status" -ne 2 ]]; then
  echo "expected unsafe fixture to exit 2, got $status" >&2
  exit 1
fi

node -e '
  const fs = require("node:fs");
  const [validPath, auditPath, unsafePath] = process.argv.slice(1);
  const valid = JSON.parse(fs.readFileSync(validPath, "utf8"));
  const audit = JSON.parse(fs.readFileSync(auditPath, "utf8"));
  const unsafe = JSON.parse(fs.readFileSync(unsafePath, "utf8"));
  if (valid.ok !== true || !Array.isArray(valid.errors) || valid.errors.length !== 0) process.exit(1);
  if (audit.type !== "action-dryrun.audit.v1" || audit.planId !== "plan_demo_001" || audit.actor !== "demo-reviewer") process.exit(1);
  if (unsafe.ok !== false || !unsafe.errors?.includes("requiresApproval must be true for action.risk public_publish")) process.exit(1);
' "$OUT/valid-result.json" "$OUT/audit-record.json" "$OUT/unsafe-result.json"
grep -q 'plan_demo_001' "$OUT/valid-review.md"

echo
echo "Demo artifacts written to $OUT"
