# PRD: action-dryrun

Status: in-progress
Decision: ready

## Scorecard

Total: 82/100
Band: build now
Last scored: 2026-06-02
Scored by: Neo

| Criterion | Points | Notes |
|---|---:|---|
| Problem pain | 18/20 | Agent side effects need preview, review, and audit trails. |
| Demand signal | 15/20 | Approval flows are central to trustworthy agent operations. |
| V1 buildability | 18/20 | Local plan files and validation are straightforward. |
| Differentiation | 12/15 | Generic dry-run protocol for agent actions. |
| Agentic workflow leverage | 14/15 | Can sit under many connector skills. |
| Distribution potential | 5/10 | Strong infrastructure piece. |

## Pitch

A tiny protocol and CLI for representing agent side effects as reviewable dry-run plans.

## Why It Matters

Before an agent emails, posts, creates tickets, or updates CRM, the human should see the exact intended action.

## V1 Scope

- JSON schema for action plans.
- CLI to validate and render human review summaries.
- Risk levels: read, draft, internal write, external write, public publish.
- Audit log format.

## Out of Scope

- Connector-specific execution.
- Hosted approval UI.

## CLI/API Sketch

```bash
action-dryrun validate plan.json
action-dryrun render plan.json --format markdown
```

## Verification

- Schema validation tests.
- Snapshot tests for rendered plans.

## Agent Prompt

Build `action-dryrun` as a reusable local protocol for safe agent action previews and audit logs.
