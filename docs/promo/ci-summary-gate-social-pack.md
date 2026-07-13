# CI Summary Gate Social Pack

## Core angle

`action-dryrun` can produce compact summary JSON for CI or connector routing
while keeping a Markdown review brief and approval failures visible to humans.

## Short posts

1. Agent action plans need two views: compact JSON for automation and readable
   Markdown for approval. `action-dryrun` has both.

2. New demo: `bash demo/run-ci-summary-gate.sh` validates a safe fixture, writes
   summary JSON, renders a review brief, and confirms the unsafe publish fixture
   still fails validation.

3. The summary is not an approval bypass. The demo keeps write/publish approval
   boundaries visible by capturing the expected unsafe-plan failure as an
   artifact.

## Recording outline

- Show `fixtures/valid-plan.json` and `fixtures/unsafe-plan.json`.
- Run `bash demo/run-ci-summary-gate.sh`.
- Open `.tmp/demo-ci-summary-gate/valid-summary.json`.
- Open `.tmp/demo-ci-summary-gate/valid-review.md`.
- Close with `.tmp/demo-ci-summary-gate/unsafe-validation.json`.

## Grounding notes

- Demo command: `bash demo/run-ci-summary-gate.sh`
- Safe fixture: `fixtures/valid-plan.json`
- Unsafe fixture: `fixtures/unsafe-plan.json`
- Output directory: `.tmp/demo-ci-summary-gate/`
- Limitation: `action-dryrun` creates review artifacts; it does not execute live
  external actions.
