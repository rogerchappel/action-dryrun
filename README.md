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
node src/cli.js summary fixtures/valid-plan.json
action-dryrun --version
```

Commands:

- `validate` checks required fields, evidence, risk level, and approval boundaries.
- `render` creates a Markdown review brief for a human approver.
- `audit` emits an append-only JSON audit record that stays unapproved by design.
- `summary` emits compact JSON for connector routers, dashboards, or CI gates.

## Approval policy

| Risk | Approval | Typical approvers |
| --- | --- | --- |
| `read` | no | none |
| `draft` | no | none |
| `internal_write` | yes | owner |
| `external_write` | yes | owner, operator |
| `public_publish` | yes | owner, publisher |

The policy is intentionally conservative. Plans can request stricter local review,
but they cannot bypass required approval for write or publish actions.

## Demo

Use the fixture-backed walkthrough in [docs/tutorials/review-a-dry-run-plan.md](docs/tutorials/review-a-dry-run-plan.md) to validate, render, and reject sample plans without calling external services.

For a single repeatable command that writes review artifacts under `.tmp/demo-review-loop/`, run:

```bash
bash demo/run-review-loop.sh
```

Promotion notes and a short video outline live in [docs/promo/demo-brief.md](docs/promo/demo-brief.md).
A launch-note draft for the scripted review loop lives in [docs/launch-notes/review-loop-demo.md](docs/launch-notes/review-loop-demo.md).

For a one-command local demo, run:

```bash
bash demo/run-fixture-review.sh
```

The script writes validation JSON, a Markdown review, and an audit record under `.tmp/demo-fixture-review/`.

Social hooks for promoting the demo live in [docs/promo/social-hooks.md](docs/promo/social-hooks.md).

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
- `npm run package:smoke` - assert npm pack contents
- `npm run release:check` - npm run check && npm test && npm run smoke && npm run package:smoke
