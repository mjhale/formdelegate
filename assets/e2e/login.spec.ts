import { expect, test, type Page } from '@playwright/test';

const invalidCredentialsMessage =
  'Email or password wasn’t recognized. Check your details and try again.';
const serviceErrorMessage =
  'We couldn’t sign you in right now. Please try again in a moment.';

async function fillLogin(page: Page, email: string, password: string) {
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill(password);
}

test.describe('login', () => {
  test('keeps delayed invalid credentials in the accessible form', async ({
    page,
  }) => {
    await page.goto('/login');
    await fillLogin(page, 'invalid@example.test', 'wrong-password');

    const submit = page.locator('button[type="submit"]');
    await submit.click();
    await expect(submit).toBeDisabled();
    await expect(submit).toHaveText('Signing in…');

    const loginAlert = page.locator('form [role="alert"]');
    await expect(loginAlert).toHaveText(invalidCredentialsMessage);
    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByLabel('Email')).toHaveValue('invalid@example.test');
    await expect(page.getByLabel('Password')).toHaveValue('wrong-password');
    await expect(
      page.getByRole('heading', { name: 'Something went wrong' })
    ).toHaveCount(0);

    await page.getByLabel('Password').fill('corrected-password');
    await expect(loginAlert).toHaveCount(0);
    await page.getByLabel('Password').fill('wrong-password');
    await expect(loginAlert).toHaveCount(0);
  });

  test('shows a generic service error without losing credentials', async ({
    page,
  }) => {
    await page.goto('/login');
    await fillLogin(page, 'unavailable@example.test', 'wrong-password');
    await page.getByRole('button', { name: 'Login' }).click();

    await expect(page.locator('form [role="alert"]')).toHaveText(
      serviceErrorMessage
    );
    await expect(page.getByLabel('Email')).toHaveValue(
      'unavailable@example.test'
    );
    await expect(page.getByLabel('Password')).toHaveValue('wrong-password');
  });

  test('clears field errors as the corresponding field changes', async ({
    page,
  }) => {
    await page.goto('/login');
    await fillLogin(page, 'not-an-email', 'short');
    await page.getByRole('button', { name: 'Login' }).click();

    await expect(page.locator('#login-email-error')).toHaveText(
      'Enter a valid email address.'
    );
    await expect(page.locator('#login-password-error')).toHaveText(
      'Password must be at least 8 characters.'
    );

    await page.getByLabel('Email').fill('valid@example.test');
    await expect(page.locator('#login-email-error')).toHaveCount(0);
    await expect(page.locator('#login-password-error')).toHaveCount(1);

    await page.getByLabel('Password').fill('valid-password');
    await expect(page.locator('#login-password-error')).toHaveCount(0);
  });

  test('redirects a valid account without a team to account setup', async ({
    page,
  }) => {
    await page.goto('/login');
    await fillLogin(page, 'no-team@example.test', 'correct-password');
    await page.getByRole('button', { name: 'Login' }).click();

    await expect(page).toHaveURL(/\/account-setup-required$/);
    await expect(
      page.getByRole('heading', { name: 'Account setup required' })
    ).toBeVisible();
  });

  test('keeps password reset links explicit and invitation-safe', async ({
    page,
  }) => {
    await page.goto('/login');
    await expect(page.getByRole('link', { name: 'Reset it' })).toHaveAttribute(
      'href',
      '/reset-password'
    );

    const destination = '/team-invitations/accept?token=invite-e2e';
    await page.goto(
      `/login?${new URLSearchParams({ destination }).toString()}`
    );
    await expect(page.getByRole('link', { name: 'Reset it' })).toHaveAttribute(
      'href',
      `/reset-password?${new URLSearchParams({ destination }).toString()}`
    );
  });
});
