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

describe('submission source validation', () => {
  const baseForm = {
    name: 'Contact form',
    email_integrations: [],
  };

  it('defaults to unrestricted with an empty host list', () => {
    const result = createFormSchema.parse(baseForm);

    assert.equal(result.submission_source_policy, 'unrestricted');
    assert.deepEqual(result.hosts, []);
  });

  it('normalizes and deduplicates host rules', () => {
    const result = createFormSchema.parse({
      ...baseForm,
      hosts: [' Example.COM. ', 'example.com', '*.EXAMPLE.org.', '', ' [::1] '],
      submission_source_policy: 'restricted',
    });

    assert.deepEqual(result.hosts, ['example.com', '*.example.org', '::1']);
  });

  it('accepts exact hosts, wildcards, localhost, and IP addresses', () => {
    const result = createFormSchema.safeParse({
      ...baseForm,
      hosts: ['example.com', '*.example.org', 'localhost', '127.0.0.1', '::1'],
      submission_source_policy: 'restricted',
    });

    assert.equal(result.success, true);
  });

  it('requires a host when restricted', () => {
    const result = createFormSchema.safeParse({
      ...baseForm,
      hosts: [],
      submission_source_policy: 'restricted',
    });

    assert.equal(result.success, false);
    if (result.success) return;

    assert.deepEqual(result.error.format().hosts?._errors, [
      'must include at least one hostname when restricted',
    ]);
  });

  it('rejects URLs, ports, misplaced wildcards, unicode, and invalid IP addresses', () => {
    const invalidHosts = [
      'https://example.com',
      'example.com:443',
      'foo.*.example.com',
      '*.localhost',
      '*.127.0.0.1',
      'münich.example',
      '999.1.1.1',
    ];

    for (const host of invalidHosts) {
      const result = createFormSchema.safeParse({
        ...baseForm,
        hosts: [host],
      });

      assert.equal(result.success, false, `${host} should be invalid`);
    }
  });

  it('limits a form to fifty unique hosts', () => {
    const result = createFormSchema.safeParse({
      ...baseForm,
      hosts: Array.from(
        { length: 51 },
        (_, index) => `host-${index}.example.com`
      ),
    });

    assert.equal(result.success, false);
  });
});
