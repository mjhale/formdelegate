import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { formFilterSummary } from './formFilterSummary';

const forms = [
  { id: 'first', name: 'Contact Form' },
  { id: 'second', name: 'Support Form' },
  { id: 'third', name: 'Sales Form' },
];

describe('submission form filter summaries', () => {
  it('shows the selected form name for one filter', () => {
    assert.equal(
      formFilterSummary(['first'], forms),
      'Filtered by Contact Form'
    );
  });

  it('preserves selected URL order for two filters', () => {
    assert.equal(
      formFilterSummary(['second', 'first'], forms),
      'Filtered by 2 forms: Support Form, Contact Form'
    );
  });

  it('truncates summaries after two names', () => {
    assert.equal(
      formFilterSummary(['third', 'first', 'second'], forms),
      'Filtered by 3 forms: Sales Form, Contact Form, +1 more'
    );
  });

  it('labels valid IDs missing from successful metadata', () => {
    assert.equal(
      formFilterSummary(['missing'], forms),
      'Filtered by Unavailable form'
    );
  });

  it('falls back to a count when metadata cannot be loaded', () => {
    assert.equal(formFilterSummary(['first'], undefined), 'Filtered by 1 form');
    assert.equal(
      formFilterSummary(['first', 'second'], undefined),
      'Filtered by 2 forms'
    );
  });

  it('omits a summary when no filters are active', () => {
    assert.equal(formFilterSummary([], forms), undefined);
  });
});
