# action-dryrun

Use this skill when an agent needs to Validate, render, and audit agent side-effect plans before external actions happen.

## Required inputs

- Local files only for V1.
- No credentials are required.
- Fixture data is preferred for tests and demos.

## Side-effect boundaries

The skill may read local files and write local output artifacts. It must not call live external services, post content, send messages, create tickets, or mutate remote systems. Any future executor must require a separate human approval step.

## Verification

Run `npm test`, `npm run check`, `npm run build`, and `npm run smoke` before using release-candidate output.

For connector handoffs, run `node src/cli.js summary fixtures/valid-plan.json`.
The summary output excludes action field values while preserving risk,
approval, evidence, and validation status for downstream routers or dashboards.

## Example

```bash
npm run smoke
node src/cli.js summary fixtures/valid-plan.json
```
