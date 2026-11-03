import { expect, test } from '@playwright/test';

test('Resend setup needs only owned credentials and sender with standard notification content', async ({
  page,
  context,
  baseURL,
}) => {
  await context.addCookies([
    { name: 'access_token', value: 'e2e-token-member', url: baseURL! },
    { name: 'user_id', value: '202', url: baseURL! },
    { name: 'current_team_id', value: 'team-e2e', url: baseURL! },
  ]);
  await page.goto('/forms/new');
  await page
    .getByRole('button', { name: 'Add Email Integration', exact: true })
    .click();
  await page.getByLabel('Provider', { exact: true }).selectOption('resend');
  await expect(page.getByLabel('API Key', { exact: true })).toHaveAttribute(
    'type',
    'password'
  );
  await expect(
    page.getByText(/Save or reverify sends one test to delivered@resend.dev/)
  ).toBeVisible();
  await expect(page.getByLabel('Template ID', { exact: true })).toHaveCount(0);
  await expect(
    page.getByText(/Form Delegate sends its standard notification/)
  ).toBeVisible();
  await page
    .getByLabel('From Address', { exact: true })
    .fill('hello@mail.example.test');
  await page.getByLabel('API Key', { exact: true }).fill('synthetic-owned-key');
  await page.screenshot({
    path: '/tmp/resend-form-setup-desktop.png',
    fullPage: true,
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(500);
  await expect(page.getByLabel('Template ID', { exact: true })).toHaveCount(0);
  await expect(page.getByLabel('From Address', { exact: true })).toHaveValue(
    'hello@mail.example.test'
  );
  await expect(page.getByLabel('API Key', { exact: true })).toHaveValue(
    'synthetic-owned-key'
  );
  await page.screenshot({
    path: '/tmp/resend-form-setup-mobile.png',
    fullPage: true,
  });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth
    )
  ).toBe(true);
});
