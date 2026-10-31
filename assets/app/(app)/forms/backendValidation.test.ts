import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { getBackendValidationMessages } from './backendValidation';

describe('backend integration validation messages', () => {
  it('surfaces nested webhook DNS and signing-secret errors', () => {
    assert.deepEqual(
      getBackendValidationMessages({
        error: {
          type: 'UNPROCESSABLE_ENTITY',
          errors: {
            webhook_integrations: [
              {
                url: ['must resolve to public addresses'],
                signing_secret: ['must be at least 32 characters'],
              },
            ],
          },
        },
      }),
      [
        'webhook integrations > 1 > url: must resolve to public addresses',
        'webhook integrations > 1 > signing secret: must be at least 32 characters',
      ]
    );
  });

  it('uses integration-neutral fallbacks and preserves email provider guidance', () => {
    assert.deepEqual(
      getBackendValidationMessages({ error: { type: 'UNPROCESSABLE_ENTITY' } }),
      ['Validation failed. Check the form and integration settings.']
    );
    assert.deepEqual(
      getBackendValidationMessages({
        error: { type: 'WEBHOOK_VALIDATION_FAILED' },
      }),
      ['Form validation failed.']
    );
    assert.match(
      getBackendValidationMessages({
        error: {
          type: 'EMAIL_PROVIDER_VERIFICATION_FAILED_INVALID_CREDENTIALS',
        },
      })[0],
      /Email provider verification failed: invalid credentials/
    );
  });
});
