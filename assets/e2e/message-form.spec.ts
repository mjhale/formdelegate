import { expect, test, type BrowserContext, type Page } from '@playwright/test';

const sentMessage = 'Your message has been sent. We’ll get back to you soon.';
const serviceErrorMessage =
  'We couldn’t send your message right now. Please try again in a moment.';
const preservedMessage = '  Symbols &=+ stay\non two lines  ';

async function fillMessageForm(
  page: Page,
  {
    email,
    message = 'Please help with my account.',
    name = 'Ada Lovelace',
  }: { email: string; message?: string; name?: string }
) {
  await page.getByLabel('Name').fill(name);
  await page.getByLabel('Email address').fill(email);
  await page.getByLabel('Message').fill(message);
}

async function authenticateSupport(context: BrowserContext, baseURL: string) {
  await context.addCookies([
    { name: 'access_token', value: 'e2e-token-member', url: baseURL },
    { name: 'user_id', value: '202', url: baseURL },
    { name: 'current_team_id', value: 'team-e2e', url: baseURL },
  ]);
}

test.describe('message forms', () => {
  test('shows and clears exact contact field errors', async ({ page }) => {
    await page.goto('/contact');
    await page.getByRole('button', { name: 'Send Message' }).click();

    await expect(page.locator('#message-form-email-error')).toHaveText(
      'Enter your email address.'
    );
    await expect(page.locator('#message-form-message-error')).toHaveText(
      'Enter a message.'
    );

    await page.getByLabel('Email address').fill('not-an-email');
    await expect(page.locator('#message-form-email-error')).toHaveCount(0);
    await expect(page.locator('#message-form-message-error')).toHaveCount(1);

    await page.getByLabel('Message').fill('Please help.');
    await page.getByRole('button', { name: 'Send Message' }).click();
    await expect(page.locator('#message-form-email-error')).toHaveText(
      'Enter a valid email address.'
    );
  });

  test('preserves request content and shows pending and success in place', async ({
    page,
  }) => {
    await page.goto('/contact');
    await fillMessageForm(page, {
      email: '  message-preserve@example.test  ',
      message: preservedMessage,
      name: '  Ada Lovelace  ',
    });

    const submit = page.locator(
      'form[aria-label="Contact form"] button[type="submit"]'
    );
    await submit.click();
    await expect(submit).toBeDisabled();
    await expect(submit).toHaveText('Sending…');
    await page.getByLabel('Name').fill('Grace Hopper');
    await expect(page.getByRole('status')).toHaveText(sentMessage);

    await expect(page).toHaveURL(/\/contact$/);
    await expect(page.getByLabel('Name')).toHaveValue('Grace Hopper');
    await expect(page.getByLabel('Email address')).toHaveValue('');
    await expect(page.getByLabel('Message')).toHaveValue('');
    await expect(
      page.getByRole('heading', { name: 'Something went wrong' })
    ).toHaveCount(0);
  });

  test('retains values after a service failure and clears stale feedback', async ({
    page,
  }) => {
    await page.goto('/contact');
    await fillMessageForm(page, {
      email: 'message-unavailable@example.test',
    });
    await page.getByRole('button', { name: 'Send Message' }).click();

    const alert = page.locator(
      'form[aria-label="Contact form"] [role="alert"]'
    );
    await expect(alert).toHaveText(serviceErrorMessage);
    await expect(page.getByLabel('Name')).toHaveValue('Ada Lovelace');
    await expect(page.getByLabel('Email address')).toHaveValue(
      'message-unavailable@example.test'
    );
    await expect(page.getByLabel('Message')).toHaveValue(
      'Please help with my account.'
    );
    await expect(
      page.getByRole('button', { name: 'Send Message' })
    ).toBeEnabled();

    await page.getByLabel('Message').fill('Updated message');
    await expect(alert).toHaveCount(0);
  });

  test('uses the same successful flow on authenticated support', async ({
    context,
    page,
    baseURL,
  }) => {
    await authenticateSupport(context, baseURL!);
    await page.goto('/support');
    await fillMessageForm(page, { email: 'support-success@example.test' });
    await page.getByRole('button', { name: 'Send Message' }).click();

    await expect(page.getByRole('status')).toHaveText(sentMessage);
    await expect(page).toHaveURL(/\/support$/);
    await expect(page.getByRole('heading', { name: 'Support' })).toBeVisible();
  });
});
