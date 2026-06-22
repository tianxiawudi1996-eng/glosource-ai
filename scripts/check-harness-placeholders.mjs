#!/usr/bin/env node
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const root = process.argv[2] || "docs/harness";
const allowedTodoPrefix = "TODO_USER_INPUT:";

function fail(message, code = 2) {
  console.error(message);
  process.exit(code);
}

function walk(path) {
  if (!existsSync(path)) return [];
  const stat = statSync(path);
  if (stat.isFile()) return [path];
  const out = [];
  for (const entry of readdirSync(path)) {
    const full = join(path, entry);
    const current = statSync(full);
    if (current.isDirectory()) out.push(...walk(full));
    else out.push(full);
  }
  return out;
}

if (!existsSync(root)) fail(`[placeholder-check] BLOCKED: ${root} not found.`);

const files = walk(root).filter((file) => !file.endsWith(".tmpl") && !file.includes("node_modules"));
const placeholderPattern = /\{\{[A-Z0-9_\- .]+\}\}/g;
const findings = [];

for (const file of files) {
  const text = readFileSync(file, "utf8");
  const placeholders = text.match(placeholderPattern) || [];
  if (placeholders.length > 0) {
    findings.push(`${file}: unresolved placeholder(s) ${placeholders.slice(0, 5).join(", ")}`);
  }

  text.split(/\r?\n/).forEach((line, index) => {
    if (line.includes("TODO") && !line.includes(allowedTodoPrefix)) {
      findings.push(`${file}:${index + 1}: TODO must be written as ${allowedTodoPrefix}`);
    }
  });
}

if (findings.length > 0) {
  console.error("[placeholder-check] BLOCKED:");
  for (const finding of findings.slice(0, 30)) console.error(`- ${finding}`);
  if (findings.length > 30) console.error(`- ... ${findings.length - 30} more`);
  process.exit(2);
}

console.log("[placeholder-check] clean");
