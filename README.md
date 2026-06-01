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

## Safety notes

This project is local-first. It does not execute external actions or write to live accounts. Outputs are review artifacts that another approval-controlled layer may consume.

## Limitations

- V1 uses deterministic local parsing.
- Fixtures are intentionally small.
- Human review is required before any generated plan or content is used externally.
