# Run A Local Action Review Loop

This walkthrough uses the checked-in safe and unsafe fixtures to validate, render, and audit action dry-run plans without calling external services.

## Run The Demo

```sh
bash demo/run-review-demo.sh
```

The script writes review artifacts under `.tmp/demo-review/`:

- `valid-result.json` from validating `fixtures/valid-plan.json`
- `valid-plan.md` from rendering the valid plan
- `audit.json` from recording a demo reviewer audit
- `unsafe-result.json` from the rejected unsafe fixture

## Manual Flow

```sh
npm run build
node src/cli.js validate fixtures/valid-plan.json
node src/cli.js render fixtures/valid-plan.json
node src/cli.js audit fixtures/valid-plan.json --actor demo-reviewer
node src/cli.js validate fixtures/unsafe-plan.json
```

The unsafe validation command is expected to exit non-zero and print an `"ok": false` result.

## What To Show

- Validation separates acceptable fixture plans from unsafe ones.
- Rendering turns the valid plan into reviewer-friendly Markdown.
- Audit output records the actor used for the local review event.

## Verification

The demo checks for `"ok": true` on the valid fixture, `"ok": false` on the unsafe fixture, and the requested audit actor in `audit.json`.
