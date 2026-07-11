# Local Review Hooks

Grounded promotion notes for the fixture-backed action dry-run review loop.

## Short Posts

1. `action-dryrun` gives agent actions a local review loop: validate a plan, render it for a human, and record an audit event.
2. The demo uses two checked-in fixtures: one valid plan and one unsafe plan that must fail validation.
3. `bash demo/run-review-demo.sh` produces JSON and Markdown artifacts under `.tmp/demo-review/` without calling external services.
4. The useful story is boring on purpose: review the plan before any approval-controlled layer consumes it.

## Video Beat

- Open `fixtures/valid-plan.json` and `fixtures/unsafe-plan.json`.
- Run `bash demo/run-review-demo.sh`.
- Show `valid-result.json`, `valid-plan.md`, and `audit.json`.
- Show that the unsafe fixture produces `"ok": false`.
- Close with the safety note that this package reviews plans; it does not execute the planned actions.

## Guardrails

- Do not claim this tool approves, executes, or enforces external actions.
- Keep the demo local and fixture-backed.
- Mention that another approval-controlled layer may consume the reviewed output.
