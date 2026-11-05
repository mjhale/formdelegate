import { defineConfig } from '@playwright/test';

const port = 3100;
const apiPort = 3101;
const production = process.env.PLAYWRIGHT_PRODUCTION === '1';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: `http://127.0.0.1:${port}`,
    channel: process.env.PLAYWRIGHT_CHANNEL,
    trace: 'retain-on-failure',
  },
  webServer: [
    {
      command: 'node e2e/mock-api.mjs',
      reuseExistingServer: false,
      timeout: 120_000,
      url: `http://127.0.0.1:${apiPort}/health`,
    },
    {
      command: production
        ? `pnpm build && pnpm start --hostname 127.0.0.1 --port ${port}`
        : `pnpm dev --hostname 127.0.0.1 --port ${port}`,
      env: {
        NEXT_DIST_DIR: '.next/e2e',
        NEXT_PUBLIC_API_HOST: `http://127.0.0.1:${apiPort}`,
        NEXT_PUBLIC_CAPTCHA_SITE_KEY: 'test-site-key',
        NEXT_PUBLIC_CONTACT_FORM_ENDPOINT: `http://127.0.0.1:${apiPort}/forms/contact`,
        NEXT_PUBLIC_DEPLOYMENT_ENV: 'test',
        NEXT_PUBLIC_SUPPORT_TICKET_ENDPOINT: `http://127.0.0.1:${apiPort}/forms/support`,
        WATCHPACK_POLLING: 'true',
      },
      reuseExistingServer: false,
      timeout: production ? 180_000 : 120_000,
      url: `http://127.0.0.1:${port}`,
    },
  ],
});
