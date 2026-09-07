import type Submission from 'types/submission';

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import InboxReader from './inboxReader';

const submission: Submission = {
  body: 'A real submission message',
  data: {
    email: 'sender@example.com',
    attachment: {
      field_name: 'attachment',
      file_name: 'request.pdf',
      file_size: '1200',
      url: 'https://example.com/request.pdf',
    },
  },
  flagged_at: null,
  flagged_type: null,
  form: {
    callback_success_includes_data: false,
    callback_success_url: null,
    email_integrations: [],
    hosts: null,
    id: 'form-1',
    inserted_at: '2026-09-01T12:00:00Z',
    name: 'Contact form',
    submission_source_policy: 'unrestricted',
    submission_count: 1,
    updated_at: '2026-09-01T12:00:00Z',
    verified: true,
  },
  id: 'submission-1',
  inserted_at: '2026-09-01T12:00:00Z',
  sender: 'A real sender',
  sender_ip: '192.0.2.1',
  sender_referrer: 'https://example.com/contact',
  sender_user_agent: 'Test browser',
  updated_at: '2026-09-01T12:00:00Z',
};

function renderInbox(submissions: Submission[], repliesEnabled?: boolean) {
  return renderToStaticMarkup(
    createElement(InboxReader, {
      allSelected: false,
      repliesEnabled,
      onSelection: () => {},
      selected: new Set<string>(),
      submissions,
      toggleAll: () => {},
    })
  );
}

describe('real submissions inbox', () => {
  it('renders supplied submissions, selection controls, and attachments only', () => {
    const markup = renderInbox([submission]);
    assert.ok(markup.includes('A real submission message'));
    assert.ok(markup.includes('Select all submissions on this page'));
    assert.ok(markup.includes('Select submission from A real sender'));
    assert.ok(markup.includes('https://example.com/request.pdf'));
    assert.ok(!/sample inbox|preview reply|sample-elena/i.test(markup));
    assert.ok(!markup.includes('inline-reply'));
    assert.ok(!markup.includes('Send reply'));
    assert.ok(!markup.includes('draft a reply'));
    assert.ok(!markup.includes('Drafts stay here'));
    assert.ok(!markup.includes('Email sending not connected'));
  });

  it('shows the non-sending composer only when explicitly enabled', () => {
    const markup = renderInbox([submission], true);
    assert.ok(markup.includes('inline-reply'));
    assert.ok(markup.includes('draft a reply'));
    assert.ok(markup.includes('Drafts stay here'));
    assert.ok(markup.includes('Email sending not connected'));
    assert.match(markup, /<button[^>]*type="submit"[^>]*disabled=""/);
  });

  it('expands submission details and attachments by default', () => {
    const markup = renderInbox([submission]);
    assert.match(markup, /<details[^>]*open=""/);
    assert.ok(markup.includes('Submission details &amp; attachments'));
    assert.ok(markup.includes('request.pdf'));
  });

  it('hides the reply composer when explicitly disabled', () => {
    const markup = renderInbox([submission], false);
    assert.ok(!markup.includes('inline-reply'));
    assert.ok(!markup.includes('Send reply'));
  });

  it('shows the empty state rather than fictional messages', () => {
    const markup = renderInbox([]);
    assert.ok(markup.includes('No submissions to show'));
    assert.ok(!markup.includes('name="submissionSelect"'));
    assert.ok(!/sample inbox|preview reply|sample-elena/i.test(markup));
  });
});
