import assert from 'node:assert/strict';
import test from 'node:test';
import postIndex from '../scripts/growth/_post-index.js';

test('post index accepts an omitted or valid value', () => {
  assert.equal(postIndex.parsePostIndex(['node', 'script'], 3), null);
  assert.equal(postIndex.parsePostIndex(['node', 'script', '--post-index=2'], 3), 2);
});

test('post index rejects malformed and out-of-range values', () => {
  for (const value of ['abc', '0', '-1', '1.5', '4', '']) {
    assert.throws(() => postIndex.parsePostIndex(['node', 'script', `--post-index=${value}`], 3), /Invalid --post-index/);
  }
});
