import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import Form from './form';

import { serializeFormPayload } from './emailProviderPayload';
import { createFormSchema, updateFormSchema } from './formSchema';
import { sanitizeWebhookDefaults } from './webhookPayload';

const id = '93708631-5494-4484-80ab-c8d9e8235d77';
const secret = 'a'.repeat(32);
const integration = {
  enabled: true,
  url: 'https://hooks.acme.com/receive?source=form',
  signing_secret: secret,
};
const form = { name: 'Contact', email_integrations: [] };

describe('outbound webhook validation and payloads', () => {
  for (const schema of [createFormSchema, updateFormSchema]) {
    it('accepts public HTTPS URLs with paths, queries, and port 443', () => {
      for (const url of [
        integration.url,
        'https://hooks.acme.com:443/receive',
      ]) {
        assert.equal(
          schema.safeParse({
            ...form,
            id,
            webhook_integrations: [{ ...integration, url }],
          }).success,
          true
        );
      }
    });

    it('rejects unsafe or malformed URL syntax, including disabled webhooks', () => {
      const urls = [
        '',
        'http://hooks.acme.com',
        'ftp://hooks.acme.com',
        'https://127.0.0.1',
        'https://10.0.0.1',
        'https://169.254.169.254',
        'https://[::1]',
        'https://2130706433',
        'https://0x7f000001',
        'https://localhost',
        'https://service',
        'https://hooks.internal',
        'https://hooks.intranet',
        'https://hooks.acme.com#',
        'https://@hooks.acme.com',
        'https://service.local',
        'https://service.test',
        'https://example.com',
        'https://name:password@hooks.acme.com',
        'https://hooks.acme.com#section',
        'https://hooks.acme.com:8443',
        'https://hooks.acme.com.',
      ];
      for (const url of urls) {
        const result = schema.safeParse({
          ...form,
          id,
          webhook_integrations: [{ ...integration, url, enabled: false }],
        });
        assert.equal(result.success, false, `${url} must fail`);
        if (!result.success)
          assert.ok(
            result.error.issues.some(
              (issue) => issue.path.join('.') === 'webhook_integrations.0.url'
            )
          );
      }
    });

    it('requires a secret for new disabled or enabled entries and validates replacements', () => {
      for (const enabled of [true, false]) {
        for (const signing_secret of [
          undefined,
          '',
          'a'.repeat(31),
          ' '.repeat(32),
          'a'.repeat(1025),
          '🔑'.repeat(16),
        ]) {
          assert.equal(
            schema.safeParse({
              ...form,
              id,
              webhook_integrations: [
                { ...integration, enabled, signing_secret },
              ],
            }).success,
            false
          );
        }
        assert.equal(
          schema.safeParse({
            ...form,
            id,
            webhook_integrations: [
              { ...integration, id, enabled, signing_secret: 'short' },
            ],
          }).success,
          false
        );
      }
    });

    it('omits a blank existing secret to preserve it and strips readback fields', () => {
      for (const signing_secret of [undefined, '']) {
        const parsed = schema.parse({
          ...form,
          id,
          webhook_integrations: [
            {
              ...integration,
              id,
              signing_secret,
              has_signing_secret: true,
              inserted_at: 'read only',
              signing_secret_ciphertext: 'never write',
            },
          ],
        });
        assert.deepEqual(parsed.webhook_integrations, [
          { id, enabled: true, url: integration.url },
        ]);
      }
    });

    it('limits a form to three webhooks', () => {
      assert.equal(
        schema.safeParse({
          ...form,
          id,
          webhook_integrations: Array(3).fill(integration),
        }).success,
        true
      );
      assert.equal(
        schema.safeParse({
          ...form,
          id,
          webhook_integrations: Array(4).fill(integration),
        }).success,
        false
      );
    });
  }

  it('preserves secret bytes and counts Unicode characters like the API', () => {
    for (const signing_secret of ['🔑'.repeat(32), ` ${'a'.repeat(32)} `]) {
      const parsed = createFormSchema.parse({
        ...form,
        webhook_integrations: [{ ...integration, signing_secret }],
      });
      assert.equal(
        parsed.webhook_integrations[0].signing_secret,
        signing_secret
      );
    }
  });

  it('allowlists readback defaults and clears any secret returned by a faulty source', () => {
    const source = {
      id,
      enabled: false,
      url: integration.url,
      has_signing_secret: true,
      signing_secret: 'do not render',
      unexpected: 'ignore',
    };
    assert.deepEqual(sanitizeWebhookDefaults([source]), [
      { id, enabled: false, url: integration.url, signing_secret: '' },
    ]);
    assert.deepEqual(sanitizeWebhookDefaults(), []);
  });

  it('allowlists the final request payload independently from schema parsing', () => {
    const source = {
      ...form,
      webhook_integrations: [
        {
          ...integration,
          id,
          signing_secret: '',
          has_signing_secret: true,
          signing_secret_ciphertext: 'read only',
        },
        { ...integration, id: null, has_signing_secret: false },
      ],
    };
    const payload = serializeFormPayload(source);
    assert.deepEqual(payload.webhook_integrations, [
      { id, enabled: true, url: integration.url },
      { enabled: true, url: integration.url, signing_secret: secret },
    ]);
  });
});

describe('outbound webhook editor', () => {
  it('renders the existing endpoint with a blank replacement secret and delivery guidance', () => {
    const markup = renderToStaticMarkup(
      createElement(Form, {
        form: {
          ...form,
          id,
          webhook_integrations: [
            {
              ...integration,
              id,
              has_signing_secret: true,
              signing_secret: 'must-never-render',
            },
          ],
        },
        saveFormAction: async () => ({ errors: {}, message: null }),
      })
    );
    assert.match(markup, /Outbound webhooks/);
    assert.match(
      markup,
      /value="https:\/\/hooks.acme.com\/receive\?source=form"/
    );
    assert.match(markup, /Leave blank to keep the existing signing secret/);
    assert.match(markup, /autoComplete="new-password"/);
    assert.match(markup, /Generate signing secret/);
    assert.match(markup, /Copy new secret/);
    assert.match(markup, /stable event ID/);
    assert.match(markup, /Held submissions and spam are not delivered/);
    assert.doesNotMatch(
      markup,
      /must-never-render|aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa/
    );
  });

  it('disables adding a fourth webhook', () => {
    const markup = renderToStaticMarkup(
      createElement(Form, {
        form: {
          ...form,
          webhook_integrations: Array.from({ length: 3 }, (_, index) => ({
            id: String(index),
            url: integration.url,
            enabled: false,
            has_signing_secret: true,
          })),
        },
        saveFormAction: async () => ({ errors: {}, message: null }),
      })
    );
    assert.match(markup, /<button[^>]*disabled=""[^>]*>Add webhook<\/button>/);
  });
});
