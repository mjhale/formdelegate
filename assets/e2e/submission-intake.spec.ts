import { expect, test } from '@playwright/test';

const sourceOrigin = 'http://localhost:3101';
const fixture = `${sourceOrigin}/submission-fixture`;

test.beforeEach(async ({ context }) => {
  // These regressions must never contact a deployed service.
  await context.route('**/*', (route) => {
    const hostname = new URL(route.request().url()).hostname;
    return ['127.0.0.1', 'localhost'].includes(hostname)
      ? route.continue()
      : route.abort();
  });
});

test('native submission preserves its original source through the advertised endpoint', async ({
  page,
}) => {
  await page.goto(fixture);
  const responsePromise = page.waitForResponse(
    (response) =>
      response.request().isNavigationRequest() &&
      response.request().method() === 'POST' &&
      response.status() !== 307
  );
  await page.getByRole('button', { name: 'Submit form', exact: true }).click();
  const response = await responsePromise;
  const observed = await response.json();

  expect(observed.origin).toBe(sourceOrigin);
  expect(observed.referer).toBe(`${sourceOrigin}/`);
  expect(observed.userAgent).toContain('Mozilla/5.0');
  expect(observed.body).toContain('Symbols &=+ stay');
  expect(response.status()).toBe(202);
  await expect(page).toHaveURL(/:3100\/f\/intake-transport$/);
});

test('AJAX can read the response and preserves multipart fields and file bytes', async ({
  page,
}) => {
  await page.goto(fixture);
  await page.getByLabel('Attachment').setInputFiles({
    name: 'synthetic.txt',
    mimeType: 'text/plain',
    buffer: Buffer.from('Synthetic attachment bytes\n'),
  });
  await page.getByRole('button', { name: 'Submit as AJAX' }).click();
  const result = page.getByRole('status');
  await expect(result).toContainText('"status":202');
  const { data } = JSON.parse((await result.textContent())!);
  expect(data.origin).toBe(sourceOrigin);
  expect(data.referer).toBe(`${sourceOrigin}/`);
  expect(data.contentType).toContain('multipart/form-data; boundary=');
  expect(data.body).toContain('Symbols &=+ stay');
  expect(data.body).toContain('filename="synthetic.txt"');
  expect(data.body).toContain('Synthetic attachment bytes\n');
});

test('the relay preserves a rejected source and its rejection response', async ({
  page,
}) => {
  await page.goto('http://127.0.0.1:3101/submission-fixture');
  const responsePromise = page.waitForResponse(
    (response) =>
      response.request().method() === 'POST' && response.status() === 403
  );
  await page.getByRole('button', { name: 'Submit form', exact: true }).click();
  const response = await responsePromise;
  expect((await response.json()).origin).toBe('http://127.0.0.1:3101');
  expect(response.status()).toBe(403);
});

test('signed-out native submission finishes on a public success page and refresh does not repost', async ({
  page,
}) => {
  let postCount = 0;
  page.on('request', (request) => {
    if (request.method() === 'POST') postCount += 1;
  });
  await page.goto(`${fixture}?success=true`);
  await page.getByRole('button', { name: 'Submit form', exact: true }).click();
  await expect(page).toHaveURL(/\/submissions\/success$/);
  await expect(
    page.getByRole('heading', { name: 'Submission received' })
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole('heading', { name: 'Submission received' })
  ).toBeVisible();
  expect(postCount).toBe(1);
});

test('success is public with or without session cookies while the inbox stays protected', async ({
  context,
  page,
  baseURL,
}) => {
  await page.goto('/submissions/success');
  await expect(
    page.getByRole('heading', { name: 'Submission received' })
  ).toBeVisible();
  await page.goto('/submissions');
  await expect(page).toHaveURL(/\/login\?destination=%2Fsubmissions$/);

  await context.addCookies([
    { name: 'access_token', value: 'synthetic-session', url: baseURL! },
    { name: 'user_id', value: '202', url: baseURL! },
  ]);
  await page.goto('/submissions/success');
  await expect(
    page.getByRole('heading', { name: 'Submission received' })
  ).toBeVisible();
  await expect(
    page.getByRole('heading', { name: 'Page not found' })
  ).toHaveCount(0);
});
