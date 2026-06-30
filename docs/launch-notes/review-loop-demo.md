# Launch Note Draft: Review Loop Demo

`action-dryrun` now has a fixture-backed review loop demo that validates, renders, audits, and rejects local action plans without calling external services.

## What Changed

- `demo/run-review-loop.sh` validates `fixtures/valid-plan.json`, renders the Markdown review, and writes an audit record for `demo-reviewer`.
- The same script validates `fixtures/unsafe-plan.json` and expects the approval boundary to fail with exit code `2`.
- Demo output is written under `.tmp/demo-review-loop/` so reviewers can inspect the generated JSON and Markdown artifacts.

## Demo Story

1. Start with `fixtures/valid-plan.json` to show the plan id, connector, operation, risk, and evidence fields.
2. Run `bash demo/run-review-loop.sh`.
3. Open `.tmp/demo-review-loop/valid-review.md` and `.tmp/demo-review-loop/audit-record.json`.
4. Show `.tmp/demo-review-loop/unsafe-result.json` to explain why public publish and external write plans require approval.

## Boundaries To Mention

- The CLI validates and renders local review artifacts.
- The CLI does not approve, send, publish, or execute the described action.
- Fixture claims should stay limited to the checked-in JSON files unless a new reviewed fixture is added.
