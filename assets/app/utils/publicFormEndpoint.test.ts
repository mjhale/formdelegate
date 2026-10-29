import assert from 'node:assert/strict';
import { afterEach, describe, it } from 'node:test';
import { publicFormEndpoint } from './publicFormEndpoint';

const previousOrigin = process.env.NEXT_PUBLIC_FORM_ORIGIN;
afterEach(() => {
  if (previousOrigin === undefined) delete process.env.NEXT_PUBLIC_FORM_ORIGIN;
  else process.env.NEXT_PUBLIC_FORM_ORIGIN = previousOrigin;
});

const formId = 'a1b2c3d4-1234-4567-890a-123456789012';

describe('public form endpoint', () => {
  it('preserves the production default when no origin is configured', () => {
    for (const value of [undefined, '', '  ']) {
      if (value === undefined) delete process.env.NEXT_PUBLIC_FORM_ORIGIN;
      else process.env.NEXT_PUBLIC_FORM_ORIGIN = value;
      assert.equal(
        publicFormEndpoint(formId),
        `https://www.formdelegate.com/f/${formId}`
      );
    }
  });

  it('uses configured local and staging origins with one public /f/ path', () => {
    for (const [configured, expected] of [
      ['http://fd-release.localhost:3010', 'http://fd-release.localhost:3010'],
      [' http://127.0.0.1:3010/ ', 'http://127.0.0.1:3010'],
      ['https://STAGING.example.test:443/', 'https://staging.example.test'],
    ]) {
      process.env.NEXT_PUBLIC_FORM_ORIGIN = configured;
      assert.equal(publicFormEndpoint(formId), `${expected}/f/${formId}`);
    }
  });

  it('rejects invalid explicit configuration instead of copying a production URL', () => {
    for (const origin of [
      'not a URL',
      '//example.test',
      'ftp://example.test',
      'https://user:password@example.test',
      'https://example.test/api',
      'https://example.test/?query=1',
      'https://example.test/#fragment',
    ]) {
      process.env.NEXT_PUBLIC_FORM_ORIGIN = origin;
      assert.throws(
        () => publicFormEndpoint(formId),
        /NEXT_PUBLIC_FORM_ORIGIN must/
      );
    }
  });

  it('keeps the form ID within one path segment', () => {
    process.env.NEXT_PUBLIC_FORM_ORIGIN = 'http://localhost:3010';
    assert.equal(
      publicFormEndpoint('id/with?reserved#characters'),
      'http://localhost:3010/f/id%2Fwith%3Freserved%23characters'
    );
  });
});
