# Contributing

Thanks for helping improve action-dryrun.

Keep changes small and reviewable. For behavior changes, include fixture-backed tests and update README or docs when commands or output shapes change.

Install dependencies for local development with `npm install`. To reproduce the
locked dependency installation used by CI, use `npm ci`.

Before opening a pull request, run:

```sh
npm ci
npm run release:check
```

Use the pull request body to summarize the change, verification, risk level, and rollback plan.
