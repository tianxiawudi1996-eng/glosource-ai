#!/usr/bin/env node
import { existsSync, readFileSync } from "node:fs";
import { execSync } from "node:child_process";

const blocklistPath = process.argv[2] || process.env.HARNESS_BLOCKLIST_FILE || ".harness-blocklist.local";

function fail(message, code = 2) {
  console.error(message);
  process.exit(code);
}

if (!existsSync(blocklistPath)) {
  fail(`[sensitive-check] BLOCKED: ${blocklistPath} not found. Create a gitignored local blocklist first.`);
}

const terms = readFileSync(blocklistPath, "utf8")
  .split(/\r?\n/)
  .map((line) => line.trim())
  .filter((line) => line && !line.startsWith("#"));

if (terms.length === 0) {
  fail(`[sensitive-check] BLOCKED: ${blocklistPath} has no active entries.`);
}

function capture(command) {
  try {
    return execSync(command, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
  } catch {
    return "";
  }
}

const diff = `${capture("git diff --cached -- .")}\n${capture("git diff -- .")}`;
if (!diff.trim()) {
  console.log("[sensitive-check] clean: no diff to scan");
  process.exit(0);
}

let hitCount = 0;
for (const term of terms) {
  if (term.length >= 3 && diff.includes(term)) hitCount += 1;
}

if (hitCount > 0) {
  fail(`[sensitive-check] BLOCKED: ${hitCount} sensitive term(s) detected. Terms are intentionally hidden.`);
}

console.log("[sensitive-check] clean");
