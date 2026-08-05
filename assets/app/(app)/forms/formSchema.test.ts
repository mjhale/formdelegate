import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { createFormSchema } from './formSchema';

const providerCases = [
  {
    provider: 'smtp',
    config: {
      from_address: 'sender@example.com',
      host: 'smtp.example.com',
      port: 587,
      use_ssl: true,
      username: '',
    },
    secrets: { password: '' },
    expectedFields: [
      ['email_provider_config', 'username'],
      ['email_provider_secrets', 'password'],
    ],
  },
  {
    provider: 'postmark',
    config: {
      from_address: 'sender@example.com',
      message_stream: '',
    },
    secrets: { server_token: '' },
    expectedFields: [['email_provider_secrets', 'server_token']],
  },
  {
    provider: 'sendgrid',
    config: { from_address: '' },
    secrets: { api_key: '' },
    expectedFields: [
      ['email_provider_config', 'from_address'],
      ['email_provider_secrets', 'api_key'],
    ],
  },
] as const;

describe('email provider form validation', () => {
  for (const testCase of providerCases) {
    it(`reports missing ${testCase.provider} fields individually`, () => {
      const result = createFormSchema.safeParse({
        name: 'Contact form',
        email_integrations: [
          {
            id: null,
            enabled: true,
            email_provider: testCase.provider,
            email_provider_config: testCase.config,
            email_provider_secrets: testCase.secrets,
            email_provider_status: 'pending_verification',
            verify_provider: true,
            email_integration_recipients: [
              {
                id: null,
                name: null,
                email: 'recipient@example.com',
                type: 'to',
              },
            ],
          },
        ],
      });

      assert.equal(result.success, false);

      if (result.success) {
        return;
      }

      const issues = result.error.issues.map((issue) => ({
        message: issue.message,
        path: issue.path.slice(2),
      }));

      assert.deepEqual(
        issues,
        testCase.expectedFields.map((path) => ({
          message: 'is required',
          path,
        }))
      );
    });
  }

  it('accepts Postmark without a message stream', () => {
    const result = createFormSchema.safeParse({
      name: 'Contact form',
      email_integrations: [
        {
          id: null,
          enabled: true,
          email_provider: 'postmark',
          email_provider_config: {
            from_address: 'sender@example.com',
            message_stream: '',
          },
          email_provider_secrets: { server_token: 'token' },
          email_provider_status: 'pending_verification',
          verify_provider: true,
          email_integration_recipients: [
            {
              id: null,
              name: null,
              email: 'recipient@example.com',
              type: 'to',
            },
          ],
        },
      ],
    });

    assert.equal(result.success, true);

    if (result.success) {
      const [integration] = result.data.email_integrations;
      assert.deepEqual(integration.email_provider_config, {
        from_address: 'sender@example.com',
      });
    }
  });
});
