# action-dryrun

Local protocol and CLI for reviewable agent action dry-run plans.

## Quickstart

```bash
npm install
npm run smoke
```

After publication, install the CLI with npm:

```bash
npm install -g action-dryrun
```

## CLI

```bash
node src/cli.js validate fixtures/valid-plan.json
node src/cli.js render fixtures/valid-plan.json
action-dryrun --version
```

## Demo

Use the fixture-backed walkthrough in [docs/tutorials/review-a-dry-run-plan.md](docs/tutorials/review-a-dry-run-plan.md) to validate, render, and reject sample plans without calling external services.

Promotion notes and a short video outline live in [docs/promo/demo-brief.md](docs/promo/demo-brief.md).

## Safety notes

This project is local-first. It does not execute external actions or write to live accounts. Outputs are review artifacts that another approval-controlled layer may consume.

## Release checks

```bash
npm test
npm run check
npm run smoke
npm run package:smoke
npm run release:check
```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

## Security

See [SECURITY.md](SECURITY.md).

## Limitations

- V1 uses deterministic local parsing.
- Fixtures are intentionally small.
- Human review is required before any generated plan or content is used externally.

## Development

Run the same checks locally before opening a PR:

- `npm run check` - node --check src/*.js test/*.test.js
- `npm run build` - node scripts/validate.js
- `npm test` - node --test
- `npm run smoke` - bash scripts/smoke.sh
- `npm run package:smoke` - npm pack --dry-run
- `npm run release:check` - npm run check && npm test && npm run smoke && npm run package:smoke
