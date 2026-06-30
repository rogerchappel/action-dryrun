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

grep -q '"ok": true' "$OUT/valid-result.json"
grep -q 'plan_demo_001' "$OUT/valid-review.md"
grep -q '"actor": "demo-reviewer"' "$OUT/audit-record.json"
grep -q 'external writes and public publishes require approval' "$OUT/unsafe-result.json"

echo
echo "Demo artifacts written to $OUT"
