import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const failures = [];
const passes = [];

function read(relativePath) {
  try {
    return readFileSync(resolve(root, relativePath), 'utf8');
  } catch {
    failures.push(`${relativePath}: missing or unreadable`);
    return '';
  }
}

function requireText(relativePath, text, label = text) {
  const contents = files.get(relativePath) ?? read(relativePath);
  if (contents.includes(text)) passes.push(`${relativePath}: ${label}`);
  else failures.push(`${relativePath}: missing ${label}`);
}

const requiredFiles = [
  'AGENTS.md',
  'CLAUDE.md',
  'docs/agent-harness.md',
  'PROGRESS.md',
  'package.json',
  'package-lock.json',
  'scripts/harness-init.mjs',
  'scripts/verify-harness.mjs',
];
const files = new Map(requiredFiles.map((file) => [file, read(file)]));

for (const heading of [
  '## Startup gate',
  '## Invariantes globales',
  '## Ciclo de trabajo',
  '## Escalera de verificación',
  '## Definición de terminado',
]) requireText('AGENTS.md', heading);

requireText('CLAUDE.md', 'AGENTS.md', 'delegation to canonical contract');
if ((files.get('CLAUDE.md')?.length ?? Infinity) < 800) passes.push('CLAUDE.md: thin adapter');
else failures.push('CLAUDE.md: adapter duplicates too much guidance');

for (const heading of [
  '## Autoridad y router',
  '## Preparación reproducible',
  '## Estado entre sesiones',
  '## Contrato de una ejecución',
  '## Feedback, recuperación y parada',
]) requireText('docs/agent-harness.md', heading);

const progress = files.get('PROGRESS.md') ?? '';
const status = progress.match(/^- Status: (idle|active|blocked)$/m)?.[1];
if (status) passes.push(`PROGRESS.md: valid status (${status})`);
else failures.push('PROGRESS.md: Status must be idle, active, or blocked');
for (const field of ['Branch', 'HEAD', 'Worktree', 'Updated', 'Objective', 'Acceptance criteria',
  'Decisions', 'Completed', 'In progress', 'Blockers', 'Command outcomes', 'Next action']) {
  requireText('PROGRESS.md', `- ${field}:`, `${field} field`);
}

let pkg;
try {
  pkg = JSON.parse(files.get('package.json'));
  passes.push('package.json: valid JSON');
} catch {
  failures.push('package.json: invalid JSON');
}
for (const script of ['dev', 'build', 'test:e2e', 'test:focused', 'harness:init', 'harness:verify']) {
  if (pkg?.scripts?.[script]) passes.push(`package.json: script ${script}`);
  else failures.push(`package.json: missing script ${script}`);
}
if (pkg?.engines?.node === '>=22.12.0') passes.push('package.json: Node runtime declared');
else failures.push('package.json: engines.node must be >=22.12.0');

try {
  const lock = JSON.parse(files.get('package-lock.json'));
  const lockedEngine = lock.packages?.['']?.engines?.node;
  if (lockedEngine === pkg?.engines?.node) passes.push('package-lock.json: root runtime in sync');
  else failures.push('package-lock.json: root runtime differs from package.json');
} catch {
  failures.push('package-lock.json: invalid JSON');
}

const minimum = [22, 12, 0];
const current = process.versions.node.split('.').map(Number);
const compatible = current.some((part, index) => part > minimum[index] &&
  current.slice(0, index).every((value, previous) => value === minimum[previous])) ||
  current.every((part, index) => part === minimum[index]);
if (compatible) passes.push(`runtime: Node ${process.versions.node}`);
else failures.push(`runtime: Node ${process.versions.node}; require >=22.12.0`);

const generatedDocs = ['AGENTS.md', 'CLAUDE.md', 'docs/agent-harness.md', 'PROGRESS.md'];
const unsafe = [
  [/\/Users\//, 'absolute macOS user path'],
  [/[A-Za-z]:\\Users\\/, 'absolute Windows user path'],
  [/NODE_TLS_REJECT_UNAUTHORIZED\s*=\s*0/, 'disabled TLS verification'],
  [/TMDB_API_TOKEN\s*=\s*\S+/, 'embedded TMDB token'],
];
for (const file of generatedDocs) {
  const contents = files.get(file) ?? '';
  for (const [pattern, label] of unsafe) {
    if (pattern.test(contents)) failures.push(`${file}: ${label}`);
  }
}
if (!failures.some((failure) => unsafe.some(([, label]) => failure.includes(label)))) {
  passes.push('generated guidance: no unsafe path, TLS, or token patterns');
}

if (failures.length) {
  console.error('HARNESS FAIL');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exitCode = 1;
} else {
  console.log(`HARNESS PASS (${passes.length} checks)`);
  passes.forEach((pass) => console.log(`- ${pass}`));
}
