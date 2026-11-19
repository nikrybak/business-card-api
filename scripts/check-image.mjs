import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const lock = JSON.parse(readFileSync(join(import.meta.dirname, '..', 'package-lock.json'), 'utf8'));

const image = process.argv[2] ?? 'business-card-api';
const devOnly = Object.entries(lock.packages)
  .filter(([path, entry]) => path.startsWith('node_modules/') && (entry.dev || entry.devOptional))
  .map(([path]) => path.slice('node_modules/'.length));

const inspect = `
  const fs = require('fs');
  const leaked = ${JSON.stringify(devOnly)}.filter((name) => fs.existsSync('/app/node_modules/' + name));
  const tools = ['/usr/local/bin', '/usr/bin', '/bin', '/nodejs/bin']
    .flatMap((dir) => ['npm', 'npx', 'yarn', 'corepack'].map((name) => dir + '/' + name))
    .filter((path) => fs.existsSync(path));
  const extra = fs.readdirSync('/app').filter((name) => !['dist', 'node_modules'].includes(name));
  console.log(JSON.stringify({ leaked, tools, extra }));
`;

const report = JSON.parse(
  execFileSync('docker', ['run', '--rm', '-i', image, '-'], { input: inspect }).toString(),
);
const problems = Object.entries(report).filter(([, items]) => items.length > 0);
if (problems.length > 0) {
  for (const [kind, items] of problems) console.error(`${kind}: ${items.join(', ')}`);
  process.exit(1);
}
console.log(`${image}: ${devOnly.length} dev-only packages checked, none leaked`);
