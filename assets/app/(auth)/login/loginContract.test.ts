import assert from 'node:assert/strict';
import test from 'node:test';

import {
  INVALID_CREDENTIALS_MESSAGE,
  SERVICE_ERROR_MESSAGE,
  fieldErrorState,
  invalidCredentialsState,
  loginInputSchema,
  parseLoginSessionResponse,
  serviceErrorState,
} from './loginContract';

function validate(input: {
  destination?: string;
  email: string;
  password: string;
}) {
  return loginInputSchema.safeParse({ destination: '', ...input });
}

test('uses friendly email and password validation messages', () => {
  const invalidEmail = validate({
    email: 'not-an-email',
    password: 'password',
  });
  const missingPassword = validate({
    email: 'person@example.com',
    password: '',
  });
  const shortPassword = validate({
    email: 'person@example.com',
    password: 'short',
  });

  assert.equal(invalidEmail.success, false);
  assert.equal(missingPassword.success, false);
  assert.equal(shortPassword.success, false);

  if (!invalidEmail.success) {
    assert.deepEqual(fieldErrorState(invalidEmail.error), {
      status: 'field_error',
      fieldErrors: { email: ['Enter a valid email address.'] },
    });
  }

  if (!missingPassword.success) {
    assert.deepEqual(fieldErrorState(missingPassword.error), {
      status: 'field_error',
      fieldErrors: { password: ['Enter your password.'] },
    });
  }

  if (!shortPassword.success) {
    assert.deepEqual(fieldErrorState(shortPassword.error), {
      status: 'field_error',
      fieldErrors: { password: ['Password must be at least 8 characters.'] },
    });
  }
});

test('trims email but preserves password whitespace exactly', () => {
  const password = '  password with spaces  ';
  const result = validate({
    email: '  person@example.com  ',
    password,
  });

  assert.equal(result.success, true);

  if (result.success) {
    assert.equal(result.data.email, 'person@example.com');
    assert.equal(result.data.password, password);
  }
});

test('parses and normalizes a valid session response', async () => {
  const result = await parseLoginSessionResponse(
    Response.json({ data: { id: 42, token: 'session-token' } })
  );

  assert.deepEqual(result, {
    status: 'success',
    userId: '42',
    token: 'session-token',
  });
});

test('classifies only the established 401 response as invalid credentials', async () => {
  const expectedFailure = await parseLoginSessionResponse(
    Response.json(
      { error: { code: 401, type: 'INVALID_CREDENTIALS' } },
      { status: 401 }
    )
  );
  const unexpected401 = await parseLoginSessionResponse(
    Response.json(
      { error: { code: 401, type: 'SESSION_EXPIRED' } },
      { status: 401 }
    )
  );

  assert.deepEqual(expectedFailure, { status: 'invalid_credentials' });
  assert.deepEqual(unexpected401, {
    status: 'service_error',
    reason: 'unexpected_response',
    httpStatus: 401,
  });
});

test('classifies HTTP and malformed success responses as service errors', async () => {
  const httpFailure = await parseLoginSessionResponse(
    Response.json(
      { error: { code: 503, type: 'SERVICE_UNAVAILABLE' } },
      { status: 503 }
    )
  );
  const malformedSuccess = await parseLoginSessionResponse(
    Response.json({ data: { id: 0, token: '' } })
  );

  assert.deepEqual(httpFailure, {
    status: 'service_error',
    reason: 'unexpected_response',
    httpStatus: 503,
  });
  assert.deepEqual(malformedSuccess, {
    status: 'service_error',
    reason: 'invalid_success',
    httpStatus: 200,
  });
});

test('returns secret-free user-facing failure states', () => {
  assert.deepEqual(invalidCredentialsState(), {
    status: 'invalid_credentials',
    message: INVALID_CREDENTIALS_MESSAGE,
  });
  assert.deepEqual(serviceErrorState(), {
    status: 'service_error',
    message: SERVICE_ERROR_MESSAGE,
  });
  assert.deepEqual(Object.keys(invalidCredentialsState()).sort(), [
    'message',
    'status',
  ]);
  assert.deepEqual(Object.keys(serviceErrorState()).sort(), [
    'message',
    'status',
  ]);
});
