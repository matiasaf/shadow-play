import { defineConfig, devices } from '@playwright/test';

const demoSize = { width: 1280, height: 720 };
// Set PLAYWRIGHT_PORT when another checkout's dev server already uses 4321.
const port = Number(process.env.PLAYWRIGHT_PORT ?? 4321);
const baseURL = `http://127.0.0.1:${port}`;

export default defineConfig({
  timeout: 30_000,
  expect: {
    timeout: 5_000,
  },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL,
    trace: 'on-first-retry',
  },
  webServer: {
    command: `npm run dev -- --host 127.0.0.1 --port ${port}`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
  projects: [
    {
      // Behavioural e2e suite (`npm run test:e2e`).
      name: 'chromium',
      testDir: './tests/e2e',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      // Recorded walkthroughs for PRs (`npm run demo`); not a test gate.
      name: 'demo',
      testDir: './tests/demo',
      testMatch: /.*\.demo\.ts/,
      timeout: 120_000,
      use: {
        ...devices['Desktop Chrome'],
        viewport: demoSize,
        video: { mode: 'on', size: demoSize },
        launchOptions: { slowMo: 120 },
      },
    },
  ],
});
