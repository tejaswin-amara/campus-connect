const fs = require('node:fs');

const commitFile = process.argv[2];
if (!commitFile) {
  process.exit(0);
}

const msg = fs.readFileSync(commitFile, 'utf-8').trim();
const firstLine = msg.split('\n')[0];
const conventionalPattern = /^(feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert)(\([a-zA-Z0-9_.-]+\))?!?: .+/;

if (!conventionalPattern.test(firstLine)) {
  console.error('ERROR: Commit message must follow Conventional Commits format (e.g., feat: description, fix: description, chore: description)');
  console.error(`Received: "${firstLine}"`);
  process.exit(1);
}
