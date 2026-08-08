import { instant } from '@next/playwright';
import { expect, test } from '@playwright/test';

test.describe('marketing navigation', () => {
  test('pricing has meaningful UI in the initial shell', async ({
    page,
    baseURL,
  }) => {
    await instant(
      page,
      async () => {
        await page.goto('/pricing');
        await expect(
          page.getByRole('heading', { name: 'Pricing Information' })
        ).toBeVisible();
      },
      { baseURL }
    );
  });

  test('pricing is meaningful during a client navigation', async ({ page }) => {
    await page.goto('/');

    await instant(page, async () => {
      await page.locator('nav a[href="/pricing"]:visible').click();
      await page.waitForURL((url) => url.pathname === '/pricing');
      await expect(
        page.getByRole('heading', { name: 'Pricing Information' })
      ).toBeVisible();
    });
  });
});
