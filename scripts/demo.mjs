#!/usr/bin/env node
// Records the Playwright demos in tests/demo and converts each video for PRs.
// Usage: npm run demo [-- <playwright args>]   e.g. npm run demo -- tests/demo/archive-tour.demo.ts
// Output (git-ignored), per demo: demos/<test-title>.webm (raw), .mp4 (small, sharp) and .gif.
import { spawnSync } from 'node:child_process';
import { existsSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const demoDir = join(root, 'demos');
const playwrightCli = join(root, 'node_modules', '@playwright', 'test', 'cli.js');
const fps = Number(process.env.DEMO_GIF_FPS ?? 10);
const width = Number(process.env.DEMO_GIF_WIDTH ?? 800);
const githubLimit = 10 * 1024 * 1024;

const startedAt = Date.now();
const run = spawnSync(
  process.execPath,
  [playwrightCli, 'test', '--project=demo', ...process.argv.slice(2)],
  { cwd: root, stdio: 'inherit' }
);
if (run.status !== 0) process.exit(run.status ?? 1);

const videos = existsSync(demoDir)
  ? readdirSync(demoDir).filter(
      (f) => f.endsWith('.webm') && statSync(join(demoDir, f)).mtimeMs >= startedAt
    )
  : [];
if (videos.length === 0) {
  console.error('\nNo demo videos were recorded. Is there a *.demo.ts in tests/demo?');
  process.exit(1);
}

if (spawnSync('ffmpeg', ['-version']).error) {
  console.warn('\nffmpeg not found: kept the .webm videos only. Install ffmpeg to get MP4 and GIF.');
  for (const v of videos) console.log(`  demos/${v}`);
  process.exit(0);
}

// Two-pass palette keeps text and dark frames clean in the GIF.
const gifFilter =
  `fps=${fps},scale=${width}:-1:flags=lanczos,split[a][b];` +
  '[a]palettegen=stats_mode=diff[p];[b][p]paletteuse=dither=bayer:bayer_scale=5:diff_mode=rectangle';
const outputs = [
  { ext: 'mp4', args: ['-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '26', '-preset', 'slow', '-movflags', '+faststart'] },
  { ext: 'gif', args: ['-vf', gifFilter] },
];

console.log('\nDemos (drag the .mp4 or .gif into the PR description):');
for (const video of videos) {
  for (const { ext, args } of outputs) {
    const out = video.replace(/\.webm$/, `.${ext}`);
    const ff = spawnSync(
      'ffmpeg',
      ['-y', '-loglevel', 'error', '-i', join(demoDir, video), ...args, join(demoDir, out)],
      { stdio: 'inherit' }
    );
    if (ff.status !== 0) {
      console.error(`  failed to write demos/${out}`);
      process.exitCode = 1;
      continue;
    }
    const size = statSync(join(demoDir, out)).size;
    const tooBig = size > githubLimit
      ? '  (over GitHub’s 10 MB limit: shorten the demo or lower DEMO_GIF_WIDTH / DEMO_GIF_FPS)'
      : '';
    console.log(`  demos/${out}  ${(size / 1024 / 1024).toFixed(1)} MB${tooBig}`);
  }
}
