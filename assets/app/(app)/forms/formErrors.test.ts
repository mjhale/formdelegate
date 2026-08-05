import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { getIntegrationErrorMessages } from './form';

describe('email integration error messages', () => {
  it('uses the visible SMTP field labels for nested validation errors', () => {
    const messages = getIntegrationErrorMessages(
      {
        email_integrations: [
          {
            email_provider_config: {
              username: { _errors: ['is required'] },
            },
            email_provider_secrets: {
              password: { _errors: ['is required'] },
            },
          },
        ],
      },
      0
    );

    assert.deepEqual(messages, [
      'SMTP Username: is required',
      'SMTP Password: is required',
    ]);
  });

  it('uses the visible Postmark and SendGrid secret labels', () => {
    const messages = getIntegrationErrorMessages(
      {
        email_integrations: [
          {
            email_provider_secrets: {
              server_token: { _errors: ['is required'] },
              api_key: { _errors: ['is required'] },
            },
          },
        ],
      },
      0
    );

    assert.deepEqual(messages, [
      'Server Token: is required',
      'API Key: is required',
    ]);
  });
});
