import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { serializeFormPayload } from './emailProviderPayload';

function postmarkPayload(messageStream: string) {
  const payload = serializeFormPayload({
    email_integrations: [
      {
        id: null,
        enabled: true,
        email_provider: 'postmark',
        email_provider_config: {
          from_address: 'sender@example.com',
          message_stream: messageStream,
        },
        email_provider_secrets: { server_token: 'token' },
      },
    ],
  });

  return payload.email_integrations[0].email_provider_config;
}

describe('Postmark provider payload', () => {
  it('omits a whitespace-only message stream', () => {
    assert.deepEqual(postmarkPayload('   '), {
      from_address: 'sender@example.com',
    });
  });

  it('trims and preserves an explicit message stream', () => {
    assert.deepEqual(postmarkPayload('  transactional-app  '), {
      from_address: 'sender@example.com',
      message_stream: 'transactional-app',
    });
  });
});

describe('Resend provider payload', () => {
  it('keeps the owned key and sender and drops old templates and other provider fields', () => {
    const payload = serializeFormPayload({
      email_integrations: [
        {
          id: null,
          enabled: true,
          email_provider: 'resend',
          email_provider_config: {
            from_address: 'hello@example.test',
            template_id: 'notification',
            host: 'stale',
          },
          email_provider_secrets: {
            api_key: 'synthetic',
            server_token: 'stale',
          },
        },
      ],
    });
    assert.deepEqual(payload.email_integrations, [
      {
        id: null,
        enabled: true,
        email_provider: 'resend',
        email_provider_config: {
          from_address: 'hello@example.test',
        },
        email_provider_secrets: { api_key: 'synthetic' },
        email_provider_status: 'pending_verification',
        verify_provider: true,
      },
    ]);
  });
});
