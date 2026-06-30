#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUT="$ROOT/.tmp/demo-fixture-review"

mkdir -p "$OUT"

echo "== validate safe draft plan =="
node "$ROOT/src/cli.js" validate "$ROOT/fixtures/valid-plan.json" | tee "$OUT/valid-plan-validation.json"

echo
echo "== render human review =="
node "$ROOT/src/cli.js" render "$ROOT/fixtures/valid-plan.json" | tee "$OUT/valid-plan-review.md"

echo
echo "== write audit record =="
node "$ROOT/src/cli.js" audit "$ROOT/fixtures/valid-plan.json" --actor demo-reviewer | tee "$OUT/valid-plan-audit.json"

echo
echo "== confirm unsafe publish plan fails validation =="
if node "$ROOT/src/cli.js" validate "$ROOT/fixtures/unsafe-plan.json" >"$OUT/unsafe-plan-validation.json"; then
  echo "Expected unsafe fixture to fail validation" >&2
  exit 1
fi
cat "$OUT/unsafe-plan-validation.json"

grep -q '"ok": true' "$OUT/valid-plan-validation.json"
grep -q 'Dry-run plan: plan_demo_001' "$OUT/valid-plan-review.md"
grep -q '"actor": "demo-reviewer"' "$OUT/valid-plan-audit.json"
grep -q '"ok": false' "$OUT/unsafe-plan-validation.json"

echo
echo "Demo artifacts written to $OUT"
