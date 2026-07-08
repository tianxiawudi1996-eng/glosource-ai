function parsePostIndex(argv, postCount) {
  const arg = argv.find(value => value.startsWith('--post-index='));
  if (!arg) return null;
  const raw = arg.slice('--post-index='.length);
  if (!/^\d+$/.test(raw)) throw new Error(`Invalid --post-index=${raw}. Choose 1-${postCount}.`);
  const index = Number(raw);
  if (!Number.isSafeInteger(index) || index < 1 || index > postCount) {
    throw new Error(`Invalid --post-index=${raw}. Choose 1-${postCount}.`);
  }
  return index;
}
module.exports = { parsePostIndex };
