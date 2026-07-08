/* eslint-disable @typescript-eslint/no-require-imports */
const { parsePostIndex } = require('./_post-index');
try { parsePostIndex(process.argv, 3); } catch (error) { console.error(error.message); process.exit(1); }
require('./threads-launch-handler');
