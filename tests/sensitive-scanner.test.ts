import assert from 'node:assert/strict';
import test from 'node:test';
import { extractAddedContent } from '../scripts/check-sensitive-strings.mjs';

test('sensitive scanner inspects additions but ignores diff metadata and removed content', () => {
  const diff = [
    'diff --git a/example.txt b/example.txt',
    '--- a/example.txt',
    '+++ b/example.txt',
    '@@ -1,2 +1,2 @@',
    '-removed-secret',
    ' unchanged-context',
    '+new-value',
  ].join('\n');

  assert.equal(extractAddedContent(diff), 'new-value');
});

test('sensitive scanner preserves every added line for blocklist matching', () => {
  const diff = '+first\n+candidate-secret\n+last';
  assert.equal(extractAddedContent(diff), 'first\ncandidate-secret\nlast');
});
