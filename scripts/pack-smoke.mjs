#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { readFile } from "node:fs/promises";

const expectedFiles = [
  "src/cli.js",
  "src/index.js",
  "fixtures/valid-plan.json",
  "demo/run-fixture-review.sh",
  "examples/README.md",
  "docs/tutorials/review-a-dry-run-plan.md",
  "SKILL.md",
  "README.md",
  "LICENSE",
  "CHANGELOG.md",
  "CONTRIBUTING.md",
  "SECURITY.md"
];

const output = execFileSync("npm", ["pack", "--dry-run", "--json"], {
  encoding: "utf8",
  stdio: ["ignore", "pipe", "inherit"]
});

const [pack] = JSON.parse(output);
const publishedFiles = new Set(pack.files.map((file) => file.path));
const missing = expectedFiles.filter((file) => !publishedFiles.has(file));

if (missing.length > 0) {
  console.error("action-dryrun package smoke failed; missing expected file(s):");
  for (const file of missing) {
    console.error(`- ${file}`);
  }
  process.exit(1);
}

const packageJson = JSON.parse(await readFile("package.json", "utf8"));
if (packageJson.bin?.["action-dryrun"] !== "src/cli.js") {
  console.error("action-dryrun package smoke failed; expected action-dryrun bin in package metadata.");
  process.exit(1);
}

console.log(`action-dryrun package smoke passed with ${pack.files.length} packed file(s).`);
