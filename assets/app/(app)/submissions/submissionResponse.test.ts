import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  numericPaginationHeader,
  submissionApiErrorType,
  submissionFilterRecoveryHref,
} from './submissionResponse';

describe('submission API responses', () => {
  it('extracts a typed API error safely', () => {
    assert.equal(
      submissionApiErrorType({ error: { type: 'INVALID_FORM_FILTER' } }),
      'INVALID_FORM_FILTER'
    );
    assert.equal(submissionApiErrorType({ error: {} }), undefined);
    assert.equal(submissionApiErrorType(null), undefined);
  });

  it('builds a filter recovery URL that only preserves search', () => {
    assert.equal(
      submissionFilterRecoveryHref('sender@example.com'),
      '/submissions?query=sender%40example.com'
    );
    assert.equal(submissionFilterRecoveryHref(''), '/submissions');
  });

  it('keeps invalid pagination headers out of page state', () => {
    assert.equal(numericPaginationHeader('25'), 25);
    assert.equal(numericPaginationHeader(null), 0);
    assert.equal(numericPaginationHeader('not-a-number'), 0);
  });
});
