#!/usr/bin/env node
import { existsSync, readFileSync } from "node:fs";

const statePath = process.argv[2] || "docs/harness/STATE.json";
const required = [
  "schema_version",
  "project",
  "repo",
  "calibrated_at",
  "current_branch",
  "head_sha",
  "main_synced",
  "track",
  "next_ready_task",
  "done_bar",
  "open_flags",
  "gates_pending",
  "verification"
];

function fail(message, code = 2) {
  console.error(message);
  process.exit(code);
}

if (!existsSync(statePath)) fail(`[state-check] BLOCKED: ${statePath} not found.`);

let state;
try {
  state = JSON.parse(readFileSync(statePath, "utf8"));
} catch (error) {
  fail(`[state-check] BLOCKED: invalid JSON: ${error.message}`);
}

const missing = required.filter((key) => !(key in state));
if (missing.length > 0) fail(`[state-check] BLOCKED: missing required field(s): ${missing.join(", ")}`);
if (!Array.isArray(state.done_bar)) fail("[state-check] BLOCKED: done_bar must be an array.");
if (!Array.isArray(state.open_flags)) fail("[state-check] BLOCKED: open_flags must be an array.");
if (!Array.isArray(state.gates_pending)) fail("[state-check] BLOCKED: gates_pending must be an array.");
if (typeof state.main_synced !== "boolean") fail("[state-check] BLOCKED: main_synced must be boolean.");
if (!state.next_ready_task) fail("[state-check] BLOCKED: next_ready_task must be set.");

console.log("[state-check] clean");
