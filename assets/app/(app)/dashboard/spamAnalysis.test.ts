import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import SpamAnalysis, { summarizeSpam } from './spamAnalysis';

describe('spam analysis', () => {
  it('calculates totals and rate using the last 30 daily buckets', () => {
    const activity = Array.from({ length: 31 }, (_, index) => ({
      day: `2026-08-${String(index + 1).padStart(2, '0')}`,
      submission_count: 4,
      spam_count: index === 0 ? 4 : 1,
    }));
    const summary = summarizeSpam(activity);
    assert.equal(summary?.spam, 30);
    assert.equal(summary?.submissions, 120);
    assert.equal(summary?.rate, 25);
    assert.equal(summary?.days.length, 30);
  });

  it('distinguishes unavailable data from zero spam', () => {
    assert.equal(summarizeSpam([]), null);
    assert.equal(
      summarizeSpam([{ day: '2026-09-07', submission_count: 4 }]),
      null
    );
    assert.equal(
      summarizeSpam([
        { day: '2026-09-07', submission_count: 0, spam_count: 1 },
      ]),
      null
    );
    const summary = summarizeSpam([
      { day: '2026-09-07', submission_count: 0, spam_count: 0 },
    ]);
    assert.equal(summary?.spam, 0);
    assert.equal(summary?.rate, 0);
  });

  it('renders daily counts with accessible labels and honest classification copy', () => {
    const markup = renderToStaticMarkup(
      createElement(SpamAnalysis, {
        activity: [{ day: '2026-09-07', submission_count: 10, spam_count: 2 }],
      })
    );
    assert.ok(markup.includes('20.0%'));
    assert.ok(markup.includes('2026-09-07: 2 flagged as spam'));
    assert.ok(markup.includes('automatic and manual flags'));
    assert.ok(!markup.includes('blocked'));
  });
});
