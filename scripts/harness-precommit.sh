#!/usr/bin/env sh
set -eu

BLOCKLIST_FILE="${HARNESS_BLOCKLIST_FILE:-.harness-blocklist.local}"

git diff --check
node scripts/check-sensitive-strings.mjs "$BLOCKLIST_FILE"
node scripts/check-harness-placeholders.mjs docs/harness
node scripts/check-state-json.mjs docs/harness/STATE.json
npm run harness:instructions
npm run lifecycle:validate
npx tsc --noEmit
npm run lint
