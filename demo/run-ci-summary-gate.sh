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

grep -q '"ok": true' "$OUT/valid-validation.json"
grep -q 'plan_demo_001' "$OUT/valid-summary.json"
grep -q 'plan_demo_001' "$OUT/valid-review.md"
grep -q 'public_publish actions require approval' "$OUT/unsafe-validation.json"

echo
echo "CI summary gate artifacts written to $OUT"
echo "  $OUT/valid-validation.json"
echo "  $OUT/valid-summary.json"
echo "  $OUT/valid-review.md"
echo "  $OUT/unsafe-validation.json"
