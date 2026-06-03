# Review a Dry-run Plan

This tutorial shows the smallest local review loop for an agent action plan. It uses the checked-in fixtures and does not send email, call APIs, or write to live accounts.

## Start with a valid draft action

Run validation against the safe draft fixture:

```bash
node src/cli.js validate fixtures/valid-plan.json
```

Expected result:

```json
{
  "ok": true,
  "errors": []
}
```

The fixture describes a Gmail `draft_email` operation with `risk` set to `draft` and `requiresApproval` set to `false`.

## Render the review artifact

Turn the same JSON plan into Markdown for a human reviewer:

```bash
node src/cli.js render fixtures/valid-plan.json
```

The rendered report includes:

- plan id `plan_demo_001`
- intent `draft a follow-up email`
- connector `gmail`
- operation `draft_email`
- recipient, subject, and body fields
- evidence from `meeting-notes.md`

## Compare an unsafe plan

Run validation against the unsafe fixture:

```bash
node src/cli.js validate fixtures/unsafe-plan.json
```

Expected result:

```json
{
  "ok": false,
  "errors": [
    "external writes and public publishes require approval"
  ]
}
```

Use this pair of fixtures in demos to show the core boundary: draft-like local review artifacts can pass, while external writes and public publish operations require approval.

## Smoke check

Run the repository smoke command before sharing a demo:

```bash
npm run smoke
```

The smoke script exercises fixture validation and rendering from the repository root.
