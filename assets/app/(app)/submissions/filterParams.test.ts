import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  buildSubmissionApiSearchParams,
  clearSubmissionFormFilters,
  paginateSubmissionParams,
  parseSubmissionFormIds,
  searchSubmissionParams,
} from './filterParams';

describe('submission filter parameters', () => {
  it('parses scalar and repeated form values in URL order', () => {
    assert.deepEqual(parseSubmissionFormIds({ 'form[]': 'first' }), ['first']);
    assert.deepEqual(
      parseSubmissionFormIds({ 'form[]': ['second', 'first'] }),
      ['second', 'first']
    );
  });

  it('deduplicates values without dropping malformed empty values', () => {
    assert.deepEqual(
      parseSubmissionFormIds({ 'form[]': ['first', '', 'first'] }),
      ['first', '']
    );
    assert.deepEqual(parseSubmissionFormIds(), []);
  });

  it('serializes API parameters with repeated form keys in order', () => {
    const params = buildSubmissionApiSearchParams({
      page: 3,
      query: 'sender@example.com',
      formIds: ['second', 'first'],
    });

    assert.equal(
      params.toString(),
      'page=3&query=sender%40example.com&form%5B%5D=second&form%5B%5D=first'
    );
  });

  it('preserves filters when searching and resets pagination', () => {
    const current = new URLSearchParams(
      'page=4&query=old&form%5B%5D=first&form%5B%5D=second'
    );
    const params = searchSubmissionParams(current, 'new');

    assert.equal(params.get('page'), null);
    assert.equal(params.get('query'), 'new');
    assert.deepEqual(params.getAll('form[]'), ['first', 'second']);
  });

  it('preserves query and filters when paginating', () => {
    const current = new URLSearchParams(
      'query=needle&form%5B%5D=first&form%5B%5D=second'
    );
    const params = paginateSubmissionParams(current, 2);

    assert.equal(params.get('page'), '2');
    assert.equal(params.get('query'), 'needle');
    assert.deepEqual(params.getAll('form[]'), ['first', 'second']);
  });

  it('clears every form filter and page while preserving search', () => {
    const current = new URLSearchParams(
      'page=2&query=needle&form%5B%5D=first&form%5B%5D=second'
    );
    const params = clearSubmissionFormFilters(current);

    assert.equal(params.get('page'), null);
    assert.equal(params.get('query'), 'needle');
    assert.deepEqual(params.getAll('form[]'), []);
  });
});
