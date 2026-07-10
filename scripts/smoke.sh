#!/usr/bin/env bash
set -euo pipefail
node src/cli.js --help >/dev/null
node src/cli.js validate fixtures/valid-plan.json >/dev/null
node src/cli.js render fixtures/valid-plan.json >/dev/null
node src/cli.js summary fixtures/valid-plan.json >/dev/null
node src/cli.js validate fixtures/internal-write-plan.json >/dev/null
echo smoke ok
