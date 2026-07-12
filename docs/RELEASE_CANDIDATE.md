# Release candidate

## Scope

Initial public MVP for action-dryrun, plus the 2026-06-17 approval-policy
release-candidate refresh.

## RC delta

- Adds a built-in approval policy matrix for write and publish risks.
- Renders approval policy details in Markdown review briefs.
- Includes approval requirements in audit records.
- Adds `summary` output for connector-router handoffs and CI dashboards.
- Expands fixture and smoke coverage for internal write review plans.

## Verification

- npm test
- npm run check
- npm run build
- npm run smoke
- npm run package:smoke
- npm run release:check

## Classification

ship

## Final verification

Passed on 2026-07-12 (Australia/Brisbane): npm run release:check, including npm run check, npm test, npm run smoke, and installed package CLI smoke via npm run package:smoke.
