import { test as base, type Page } from '@playwright/test';
import { mkdir } from 'node:fs/promises';

// Recorded demos land here; `npm run demo` turns each .webm into a .gif.
export const DEMO_DIR = 'demos';

type DemoFixtures = {
  /** Holds the frame so the viewer can read what just happened. */
  pause: (ms?: number) => Promise<void>;
  /** Scrolls in small steps so the motion reads as a scroll, not a jump. */
  glide: (pixels: number) => Promise<void>;
};

const slugify = (title: string) =>
  title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

// Playwright videos show no mouse pointer, so draw one that follows the real mouse.
// Also hide Astro's dev toolbar, which is not part of the site.
function decorate() {
  addEventListener('DOMContentLoaded', () => {
    const style = document.createElement('style');
    style.textContent = `
      astro-dev-toolbar { display: none !important; }
      #demo-cursor {
        position: fixed; top: 0; left: 0; z-index: 2147483647; pointer-events: none;
        width: 18px; height: 18px; margin: -9px 0 0 -9px; border-radius: 50%;
        background: rgba(255, 255, 255, 0.85); border: 2px solid rgba(0, 0, 0, 0.6);
        transition: transform 0.25s ease-out, width 0.1s, height 0.1s, margin 0.1s;
      }
      #demo-cursor.down { width: 12px; height: 12px; margin: -6px 0 0 -6px; }
    `;
    const cursor = document.createElement('div');
    cursor.id = 'demo-cursor';
    document.head.append(style);
    document.body.append(cursor);
    addEventListener('mousemove', (e) => {
      cursor.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
    });
    addEventListener('mousedown', () => cursor.classList.add('down'));
    addEventListener('mouseup', () => cursor.classList.remove('down'));
  });
}

export const test = base.extend<DemoFixtures>({
  page: async ({ page }, use, testInfo) => {
    await page.addInitScript(decorate);
    await use(page);

    const video = page.video();
    await page.close();
    if (video && testInfo.status === testInfo.expectedStatus) {
      await mkdir(DEMO_DIR, { recursive: true });
      await video.saveAs(`${DEMO_DIR}/${slugify(testInfo.title)}.webm`);
    }
  },
  pause: async ({ page }, use) => {
    await use((ms = 900) => page.waitForTimeout(ms));
  },
  glide: async ({ page }, use) => {
    await use((pixels) => glide(page, pixels));
  },
});

async function glide(page: Page, pixels: number) {
  const steps = Math.max(1, Math.round(Math.abs(pixels) / 60));
  for (let i = 0; i < steps; i++) {
    await page.mouse.wheel(0, pixels / steps);
    await page.waitForTimeout(25);
  }
}

export { expect } from '@playwright/test';
