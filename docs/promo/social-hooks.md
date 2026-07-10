# Social Hooks

Short, fact-grounded post drafts for the fixture-backed demo in this repo.

## Hooks

1. Before an agent touches a connector, make it produce a reviewable dry-run plan. `action-dryrun` validates the plan, renders the human review, and writes an audit record locally.
2. The demo catches a public-publish action before anything leaves the machine: `fixtures/unsafe-plan.json` fails validation, while `fixtures/valid-plan.json` renders as a draft-only email plan.
3. Approval workflows get easier to inspect when the artifact is boring JSON plus Markdown. `action-dryrun` keeps connector intent, fields, evidence, and audit metadata in files reviewers can diff.
4. Local-first demo path: run `bash demo/run-fixture-review.sh` to validate, render, audit, and reject sample action plans without calling Gmail, LinkedIn, or any external API.
5. A useful approval artifact is boring on purpose: JSON validation, Markdown review, and an audit record you can diff before another layer performs any action.

## Short Video Beat

- Show `fixtures/valid-plan.json` and `fixtures/unsafe-plan.json` side by side.
- Run `bash demo/run-fixture-review.sh`.
- Open `.tmp/demo-fixture-review/valid-plan-review.md` for the human-readable review.
- Open `.tmp/demo-fixture-review/unsafe-plan-validation.json` and point to `"ok": false`.
- Use [review-loop-video-brief.md](review-loop-video-brief.md) for a longer shot list and guardrails.

## Guardrails

- Do not claim this executes or blocks real connector actions by itself.
- Keep the message focused on review artifacts, validation, and approval handoff.
- Mention that human review is still required before another layer consumes a plan.
