#!/usr/bin/env node
import { existsSync, readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

function fail(message, code = 2) {
  console.error(message);
  process.exit(code);
}

export function extractAddedContent(diff) {
  return diff
    .split(/\r?\n/)
    .filter((line) => line.startsWith("+") && !line.startsWith("+++"))
    .map((line) => line.slice(1))
    .join("\n");
}

function captureGit(args) {
  try {
    return execFileSync("git", args, {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
      maxBuffer: 512 * 1024 * 1024,
    });
  } catch (err) {
    fail(`[sensitive-check] BLOCKED: could not read git worktree state (${err.code ?? err.message}). Refusing to report clean on a scan that did not run.`);
  }
}

function readUntrackedContent() {
  const paths = captureGit(["ls-files", "--others", "--exclude-standard", "-z"])
    .split("\0")
    .filter(Boolean);

  return paths.map((path) => {
    try {
      return readFileSync(path, "utf8");
    } catch (err) {
      fail(`[sensitive-check] BLOCKED: could not read an untracked file (${err.code ?? err.message}).`);
    }
  }).join("\n");
}

export function collectCandidateContent() {
  const staged = extractAddedContent(captureGit(["diff", "--cached", "--unified=0", "--", "."]));
  const unstaged = extractAddedContent(captureGit(["diff", "--unified=0", "--", "."]));
  const untracked = readUntrackedContent();
  return `${staged}\n${unstaged}\n${untracked}`;
}

function main() {
  const blocklistPath = process.argv[2] || process.env.HARNESS_BLOCKLIST_FILE || ".harness-blocklist.local";
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

  const content = collectCandidateContent();
  if (!content.trim()) {
    console.log("[sensitive-check] clean: nothing added, staged, or untracked");
    return;
  }

  const hitCount = terms.filter((term) => term.length >= 3 && content.includes(term)).length;
  if (hitCount > 0) {
    fail(`[sensitive-check] BLOCKED: ${hitCount} sensitive term(s) detected. Terms are intentionally hidden.`);
  }

  console.log("[sensitive-check] clean");
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  main();
}
