# API

action-dryrun exposes a small ESM library from `src/index.js` and a CLI from `src/cli.js`. The public surface is intentionally local-first so agents can call it in dry-run workflows without credentials.

## Stability

The V1 API is suitable for release-candidate testing. Treat output shapes as versioned review artifacts before wiring them into external executors.

## Plan schema

`validatePlan(plan)` accepts a plain object with this shape:

```json
{
  "id": "plan_demo_001",
  "intent": "draft a follow-up email",
  "requiresApproval": false,
  "approved": false,
  "action": {
    "connector": "gmail",
    "operation": "draft_email",
    "risk": "draft",
    "fields": {
      "subject": "Follow-up"
    }
  },
  "evidence": [
    {
      "source": "meeting-notes.md",
      "note": "User requested a follow-up draft"
    }
  ]
}
```

The `id`, `intent`, `action.connector`, and `action.operation` values must be
non-empty strings. `action` and `action.fields` must be plain objects.
`action.risk` must be one of the exported `RISK_LEVELS`. `evidence` must be a
non-empty array, and every entry must be an object with non-empty string
`source` and `note` values. `requiresApproval` and `approved` are optional, but
must be booleans when provided. The risk policy is authoritative when
`requiresApproval` is declared: it must be `false` for `read` and `draft`, and
`true` for `internal_write`, `external_write`, and `public_publish`. A conflicting
value is rejected with a `requiresApproval` validation error. Omitting
`requiresApproval` is valid only for `read` and `draft`; approval-required plans
must declare it as `true`. A dry-run plan may set `approved` to `false` or omit it, but must
never set it to `true` because dry-run artifacts cannot grant approval.

The `fixtures/valid-plan.json` file is an executable example of the schema:

```bash
node src/cli.js validate fixtures/valid-plan.json
```

Rendering, summary, and audit APIs report invalid plans defensively, but their
output does not make an invalid plan safe to execute. Check `validatePlan()` or
the summary `ok` field before consuming any review artifact.

## Markdown rendering

`renderMarkdown(plan)` produces a fixed review-document structure. All
user-controlled scalar content is normalized to a single line before it is
interpolated: CR, LF, CRLF, U+2028, and U+2029 separators become spaces, and a
leading Markdown heading, quote, list, or fence marker is backslash-escaped.
The contract covers `id`, `intent`, connector and operation names, field keys
and JSON values (including nested string content), and evidence sources and
notes. Input text therefore stays readable without being able to create new
headings, sections, list items, block quotes, or fenced blocks in the rendered
artifact.
