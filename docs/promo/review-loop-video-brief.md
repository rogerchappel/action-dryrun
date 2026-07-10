# Review Loop Video Brief

## Angle

Show how `action-dryrun` turns a proposed connector action into files a reviewer can validate, read, audit, and reject without contacting the connector.

## Demo Path

```sh
bash demo/run-fixture-review.sh
```

The script writes:

- `.tmp/demo-fixture-review/valid-plan-validation.json`
- `.tmp/demo-fixture-review/valid-plan-review.md`
- `.tmp/demo-fixture-review/valid-plan-audit.json`
- `.tmp/demo-fixture-review/unsafe-plan-validation.json`

## Shot List

1. Open `fixtures/valid-plan.json` and show the draft email operation.
2. Open `fixtures/unsafe-plan.json` and show the higher-risk publish operation.
3. Run `bash demo/run-fixture-review.sh`.
4. Show `"ok": true` in the valid plan validation output.
5. Show `valid-plan-review.md` as the human review surface.
6. Show `"ok": false` in the unsafe plan validation output.

## Guardrails

- Do not claim the CLI executes or blocks real connector operations.
- Do not imply approval is automatic; this is a review artifact handoff.
- Keep the pitch on local validation, readable plans, and audit records.
