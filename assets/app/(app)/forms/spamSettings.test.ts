import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import Form from './form';
import { createFormSchema, updateFormSchema } from './formSchema';
import { serializeFormPayload } from './emailProviderPayload';

const base = { name: 'Synthetic form', hosts: [], email_integrations: [] };
describe('spam settings', () => {
  it('validates and serializes all supported modes without resetting omitted updates', () => {
    for (const mode of ['balanced', 'review_all', 'off']) {
      const result = createFormSchema.parse({
        ...base,
        spam_filter_mode: mode,
      });
      assert.equal(serializeFormPayload(result).spam_filter_mode, mode);
    }
    assert.equal(
      createFormSchema.safeParse({ ...base, spam_filter_mode: 'discard' })
        .success,
      false
    );
    assert.equal(
      updateFormSchema.parse({
        ...base,
        id: 'a1b2c3d4-1234-4567-890a-123456789012',
      }).spam_filter_mode,
      undefined
    );
  });
  it('renders persisted moderation choices and recovery guidance', () => {
    const markup = renderToStaticMarkup(
      createElement(Form, {
        form: { ...base, spam_filter_mode: 'review_all' },
        saveFormAction: async () => ({ errors: {}, message: null }),
      })
    );
    assert.match(markup, /Moderation mode/);
    assert.match(markup, /value="review_all" selected=""/);
    assert.match(markup, /Changing this setting affects new submissions only/);
    assert.match(markup, /until you approve them/);
  });
});
