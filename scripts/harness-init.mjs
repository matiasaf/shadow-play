import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const playwrightCli = resolve(root, 'node_modules', '@playwright', 'test', 'cli.js');

function run(command, args) {
  console.log(`\n> ${command} ${args.join(' ')}`);
  const result = spawnSync(command, args, { cwd: root, stdio: 'inherit' });
  if (result.error) {
    console.error(`Could not start ${command}: ${result.error.message}`);
    process.exit(1);
  }
  if (result.status !== 0) process.exit(result.status ?? 1);
}

const [major, minor] = process.versions.node.split('.').map(Number);
if (major < 22 || (major === 22 && minor < 12)) {
  console.error(`Node ${process.versions.node} is unsupported; install Node >=22.12.0.`);
  process.exit(1);
}

run(npm, ['ci']);
const playwrightVersion = JSON.parse(
  readFileSync(resolve(root, 'node_modules', '@playwright', 'test', 'package.json'), 'utf8')
).version;
const installed = spawnSync(process.execPath, [playwrightCli, 'install', '--list'], {
  cwd: root,
  encoding: 'utf8',
});
const hasCurrentChromium = installed.status === 0 &&
  installed.stdout.includes(`Playwright version: ${playwrightVersion}`) &&
  installed.stdout.includes('chromium-');
if (hasCurrentChromium) console.log(`\n> Playwright ${playwrightVersion} Chromium already installed`);
else run(process.execPath, [playwrightCli, 'install', 'chromium']);
run(npm, ['run', 'harness:verify']);
run(npm, ['run', 'build']);
run(npm, ['run', 'test:focused']);

console.log('\nHarness readiness: PASS');
