import { defineConfig } from '@playwright/test';

const port = 3100;

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: `http://127.0.0.1:${port}`,
    trace: 'retain-on-failure',
  },
  webServer: {
    command: `npm run dev -- --hostname 127.0.0.1 --port ${port}`,
    env: {
      NEXT_PUBLIC_API_HOST: 'https://api.example.invalid',
      NEXT_PUBLIC_CAPTCHA_SITE_KEY: 'test-site-key',
      NEXT_PUBLIC_CONTACT_FORM_ENDPOINT: 'https://contact.example.invalid',
      NEXT_PUBLIC_DEPLOYMENT_ENV: 'test',
      NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: 'pk_test_playwright',
      NEXT_PUBLIC_SUPPORT_TICKET_ENDPOINT: 'https://support.example.invalid',
      WATCHPACK_POLLING: 'true',
    },
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    url: `http://127.0.0.1:${port}`,
  },
});
