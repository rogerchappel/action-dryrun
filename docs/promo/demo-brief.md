# Demo Brief: Review Agent Actions Before They Happen

## Audience

Developers building agent workflows that need a local review layer before any external action executes.

## Core claim

action-dryrun validates and renders local action plans as review artifacts. It does not execute the action.

## 60-second video flow

1. Open `fixtures/valid-plan.json` and point out the intent, connector, operation, risk, fields, and evidence.
2. Run `node src/cli.js validate fixtures/valid-plan.json` and show the `ok: true` result.
3. Run `node src/cli.js render fixtures/valid-plan.json` and show the Markdown report.
4. Open `fixtures/unsafe-plan.json`.
5. Run `node src/cli.js validate fixtures/unsafe-plan.json` and show the approval error.
6. Close on the safety model: local-first parsing, deterministic fixtures, and human review before generated plans are used externally.

## Social hooks

- "Before an agent touches a live connector, make it produce a reviewable action plan."
- "A tiny CLI demo: one draft email plan passes, one external publish plan is blocked for approval."
- "action-dryrun is for the boring safety step between agent intent and external side effects."

## Boundaries

- Do not claim that action-dryrun sends, approves, or executes actions.
- Do not claim production deployment status.
- Keep demos focused on the included fixtures unless adding a new reviewed fixture.
