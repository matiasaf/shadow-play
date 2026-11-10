import { defineConfig, devices } from '@playwright/test';

const demoSize = { width: 1280, height: 720 };

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
    baseURL: 'http://127.0.0.1:4321',
    trace: 'on-first-retry',
  },
  webServer: {
    command: 'npm run dev -- --host 127.0.0.1',
    url: 'http://127.0.0.1:4321',
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
