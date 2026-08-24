#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUT="$ROOT/.tmp/demo-ci-summary-gate"

rm -rf "$OUT"
mkdir -p "$OUT"

echo "== validate reviewable plan =="
node "$ROOT/src/cli.js" validate "$ROOT/fixtures/valid-plan.json" | tee "$OUT/valid-validation.json"

echo
echo "== write compact summary =="
node "$ROOT/src/cli.js" summary "$ROOT/fixtures/valid-plan.json" | tee "$OUT/valid-summary.json"

echo
echo "== capture human-readable review =="
node "$ROOT/src/cli.js" render "$ROOT/fixtures/valid-plan.json" > "$OUT/valid-review.md"
sed -n '1,24p' "$OUT/valid-review.md"

echo
echo "== keep unsafe publish blocked =="
set +e
node "$ROOT/src/cli.js" validate "$ROOT/fixtures/unsafe-plan.json" > "$OUT/unsafe-validation.json"
unsafe_status=$?
set -e
cat "$OUT/unsafe-validation.json"
test "$unsafe_status" -eq 2

node -e '
  const fs = require("node:fs");
  const [validPath, summaryPath, unsafePath] = process.argv.slice(1);
  const valid = JSON.parse(fs.readFileSync(validPath, "utf8"));
  const summary = JSON.parse(fs.readFileSync(summaryPath, "utf8"));
  const unsafe = JSON.parse(fs.readFileSync(unsafePath, "utf8"));
  if (valid.ok !== true || !Array.isArray(valid.errors) || valid.errors.length !== 0) process.exit(1);
  if (summary.id !== "plan_demo_001" || summary.ok !== true || summary.errorCount !== 0) process.exit(1);
  if (unsafe.ok !== false || !unsafe.errors?.includes("requiresApproval must be true for action.risk public_publish")) process.exit(1);
' "$OUT/valid-validation.json" "$OUT/valid-summary.json" "$OUT/unsafe-validation.json"
grep -q 'plan_demo_001' "$OUT/valid-review.md"

echo
echo "CI summary gate artifacts written to $OUT"
echo "  $OUT/valid-validation.json"
echo "  $OUT/valid-summary.json"
echo "  $OUT/valid-review.md"
echo "  $OUT/unsafe-validation.json"
