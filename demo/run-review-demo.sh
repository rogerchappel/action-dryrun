#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUT="$ROOT/.tmp/demo-review"

cd "$ROOT"
rm -rf "$OUT"
mkdir -p "$OUT"

npm run build >/dev/null

node src/cli.js validate fixtures/valid-plan.json > "$OUT/valid-result.json"
node src/cli.js render fixtures/valid-plan.json > "$OUT/valid-plan.md"
node src/cli.js audit fixtures/valid-plan.json --actor demo-reviewer > "$OUT/audit.json"

if node src/cli.js validate fixtures/unsafe-plan.json > "$OUT/unsafe-result.json"; then
  echo "unsafe fixture unexpectedly validated" >&2
  exit 1
fi

grep -q '"ok": true' "$OUT/valid-result.json"
grep -q 'demo-reviewer' "$OUT/audit.json"
grep -q '"ok": false' "$OUT/unsafe-result.json"

echo "Demo artifacts written to $OUT"
sed -n '1,60p' "$OUT/valid-plan.md"
