# action-dryrun

Local protocol and CLI for reviewable agent action dry-run plans.

## Quickstart

```bash
npm install
npm run smoke
```

## CLI

```bash
node src/cli.js validate fixtures/valid-plan.json
node src/cli.js render fixtures/valid-plan.json
```

## Demo

Use the fixture-backed walkthrough in [docs/tutorials/review-a-dry-run-plan.md](docs/tutorials/review-a-dry-run-plan.md) to validate, render, and reject sample plans without calling external services.

Promotion notes and a short video outline live in [docs/promo/demo-brief.md](docs/promo/demo-brief.md).

## Safety notes

This project is local-first. It does not execute external actions or write to live accounts. Outputs are review artifacts that another approval-controlled layer may consume.

## Limitations

- V1 uses deterministic local parsing.
- Fixtures are intentionally small.
- Human review is required before any generated plan or content is used externally.
