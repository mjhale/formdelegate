import assert from 'node:assert/strict';
import test from 'node:test';

import {
  SENT_MESSAGE,
  SERVICE_ERROR_MESSAGE,
  buildSubmissionBody,
  fieldErrorState,
  isSuccessfulSubmissionStatus,
  messageInputSchema,
  sentState,
  serviceErrorState,
  validateMessageEndpoint,
} from './messageFormContract';

test('uses exact field validation states and copy', () => {
  const missing = messageInputSchema.safeParse({
    name: '',
    email: '   ',
    message: '  ',
  });
  const invalidEmail = messageInputSchema.safeParse({
    name: '',
    email: 'not-an-email',
    message: 'Please help.',
  });

  assert.equal(missing.success, false);
  assert.equal(invalidEmail.success, false);

  if (!missing.success) {
    assert.deepEqual(fieldErrorState(missing.error), {
      status: 'field_error',
      fieldErrors: {
        email: ['Enter your email address.'],
        message: ['Enter a message.'],
      },
    });
  }

  if (!invalidEmail.success) {
    assert.deepEqual(fieldErrorState(invalidEmail.error), {
      status: 'field_error',
      fieldErrors: { email: ['Enter a valid email address.'] },
    });
  }
});

test('trims name and email while preserving message bytes', () => {
  const message = '  Symbols &=+ stay\non two lines  ';
  const result = messageInputSchema.safeParse({
    name: '  Ada Lovelace  ',
    email: '  ada@example.test  ',
    message,
  });

  assert.equal(result.success, true);

  if (result.success) {
    assert.equal(result.data.name, 'Ada Lovelace');
    assert.equal(result.data.email, 'ada@example.test');
    assert.equal(result.data.message, message);

    const decodedBody = new URLSearchParams(
      buildSubmissionBody(result.data).toString()
    );

    assert.equal(decodedBody.get('name'), 'Ada Lovelace');
    assert.equal(decodedBody.get('email'), 'ada@example.test');
    assert.equal(decodedBody.get('message'), message);
  }
});

test('accepts only credential-free HTTP endpoints', () => {
  assert.equal(
    validateMessageEndpoint('https://www.formdelegate.com/f/contact'),
    'https://www.formdelegate.com/f/contact'
  );
  assert.equal(
    validateMessageEndpoint('http://127.0.0.1:3101/forms/support'),
    'http://127.0.0.1:3101/forms/support'
  );
  assert.equal(validateMessageEndpoint('javascript:alert(1)'), null);
  assert.equal(
    validateMessageEndpoint('https://user:secret@example.com'),
    null
  );
  assert.equal(validateMessageEndpoint('not a url'), null);
  assert.equal(validateMessageEndpoint(), null);
});

test('classifies only final 2xx responses as successful', () => {
  assert.equal(isSuccessfulSubmissionStatus(200), true);
  assert.equal(isSuccessfulSubmissionStatus(202), true);
  assert.equal(isSuccessfulSubmissionStatus(299), true);
  assert.equal(isSuccessfulSubmissionStatus(302), false);
  assert.equal(isSuccessfulSubmissionStatus(422), false);
  assert.equal(isSuccessfulSubmissionStatus(503), false);
});

test('returns content-free form-level states', () => {
  assert.deepEqual(sentState(), {
    status: 'sent',
    message: SENT_MESSAGE,
  });
  assert.deepEqual(serviceErrorState(), {
    status: 'service_error',
    message: SERVICE_ERROR_MESSAGE,
  });
  assert.deepEqual(Object.keys(sentState()).sort(), ['message', 'status']);
  assert.deepEqual(Object.keys(serviceErrorState()).sort(), [
    'message',
    'status',
  ]);
});
