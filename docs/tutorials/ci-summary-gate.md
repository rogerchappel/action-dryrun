# Add a CI summary gate

Use this recipe when a CI job or connector router needs a compact dry-run plan
summary, while still preserving a Markdown review artifact for humans.

## Run the demo

```bash
bash demo/run-ci-summary-gate.sh
```

The script validates `fixtures/valid-plan.json`, writes summary JSON, renders a
Markdown review, and confirms that `fixtures/unsafe-plan.json` still exits with
code `2`.

## Artifacts

The demo writes files under `.tmp/demo-ci-summary-gate/`:

- `valid-validation.json` records the validation result;
- `valid-summary.json` is the compact machine-readable summary;
- `valid-review.md` is the human review brief;
- `unsafe-validation.json` captures the blocked publish/write fixture.

## Review boundary

The summary is only a routing or dashboard aid. Write and publish actions still
need approval according to the plan policy, and the unsafe fixture demonstrates
that boundary with an expected validation failure.
