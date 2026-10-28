import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import type Submission from 'types/submission';
import ModerationDetails, {
  isHeld,
  moderationLabel,
} from './moderationDetails';

const make = (attrs: Partial<Submission>) =>
  ({ flagged_at: null, ...attrs }) as Submission;

describe('submission moderation', () => {
  it('distinguishes review, spam, approval and legacy submissions', () => {
    for (const [status, label, held] of [
      ['review', 'Needs review', true],
      ['spam', 'Spam', true],
      ['pending', 'Awaiting classification', true],
      ['approved', 'Approved', false],
      ['accepted', 'Accepted', false],
      ['unclassified', 'Not assessed', false],
    ] as const) {
      const s = make({ moderation_status: status });
      assert.equal(moderationLabel(s), label);
      assert.equal(isHeld(s), held);
    }
    assert.equal(moderationLabel(make({ flagged_at: '2026-10-28' })), 'Spam');
  });
  it('explains recovery, original reasons, and rule scores accessibly', () => {
    const markup = renderToStaticMarkup(
      createElement(ModerationDetails, {
        submission: make({
          moderation_status: 'review',
          spam_assessment: {
            engine: 'builtin-v1',
            decision: 'review',
            mode: 'balanced',
            score: 3,
            reasons: ['commercial_solicitation', 'repeated_content'],
          },
        }),
      })
    );
    assert.match(markup, /aria-label="Spam review"/);
    assert.match(markup, /Email delivery is on hold/);
    assert.match(markup, /choose Approve/);
    assert.match(markup, /Promotional or prize solicitation language/);
    assert.match(markup, /not a probability/);
    assert.match(markup, /Repeated content/);
  });
  it('preserves the original assessment after approval and escapes unknown reasons', () => {
    const markup = renderToStaticMarkup(
      createElement(ModerationDetails, {
        submission: make({
          moderation_status: 'approved',
          spam_assessment: {
            engine: 'builtin-v1',
            decision: 'spam',
            mode: 'balanced',
            score: 6,
            reasons: ['<script>alert(1)</script>'],
          },
        }),
      })
    );
    assert.match(markup, /Original assessment: spam/);
    assert.match(markup, /will not resend completed deliveries/);
    assert.ok(!markup.includes('<script>'));
  });
});
