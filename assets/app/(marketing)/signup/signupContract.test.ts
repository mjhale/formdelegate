import assert from 'node:assert/strict';
import test from 'node:test';

import {
  apiFieldErrorState,
  CAPTCHA_ERROR_MESSAGE,
  captchaErrorState,
  fieldErrorState,
  parseSignupResponse,
  SERVICE_ERROR_MESSAGE,
  serviceErrorState,
  SIGN_IN_ERROR_MESSAGE,
  signInErrorState,
  signupInputSchema,
} from './signupContract';

const validInput = {
  captcha: 'captcha-token',
  destination: '',
  user: {
    email: 'person@example.com',
    name: 'Person',
    password: 'a valid password',
    password_confirmation: 'a valid password',
  },
};

function jsonResponse(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

test('maps client validation issues to flat field errors', () => {
  const result = signupInputSchema.safeParse({
    ...validInput,
    captcha: '',
    user: {
      ...validInput.user,
      name: '',
      password_confirmation: 'a different password',
    },
  });

  assert.equal(result.success, false);

  if (!result.success) {
    assert.deepEqual(fieldErrorState(result.error), {
      status: 'field_error',
      fieldErrors: {
        captcha: ['Invalid Captcha response'],
        name: ['Full name is required'],
        password_confirmation: ["Passwords don't match"],
      },
      captchaSpent: false,
    });
  }
});

test('marks API field errors as having spent the captcha', () => {
  assert.deepEqual(apiFieldErrorState({ email: ['is invalid'] }), {
    status: 'field_error',
    fieldErrors: { email: ['is invalid'] },
    captchaSpent: true,
  });
});

test('exposes user-facing messages for form-level states', () => {
  assert.deepEqual(captchaErrorState(), {
    status: 'captcha_error',
    message: CAPTCHA_ERROR_MESSAGE,
  });
  assert.deepEqual(serviceErrorState(), {
    status: 'service_error',
    message: SERVICE_ERROR_MESSAGE,
  });
  assert.deepEqual(signInErrorState(), {
    status: 'sign_in_error',
    message: SIGN_IN_ERROR_MESSAGE,
  });
});

test('parses a created account', async () => {
  const result = await parseSignupResponse(
    jsonResponse(
      { data: { id: 7, email: 'person@example.com', token: 'jwt' } },
      201
    )
  );

  assert.deepEqual(result, { status: 'success', userId: '7', token: 'jwt' });
});

test('treats a malformed success body as a service error', async () => {
  const result = await parseSignupResponse(
    jsonResponse({ data: { id: 7 } }, 201)
  );

  assert.deepEqual(result, {
    status: 'service_error',
    reason: 'invalid_success',
    httpStatus: 201,
  });
});

test('recognizes a rejected captcha', async () => {
  const result = await parseSignupResponse(
    jsonResponse(
      { error: { code: 400, type: 'INVALID_OR_EXPIRED_CAPTCHA' } },
      400
    )
  );

  assert.deepEqual(result, { status: 'captcha_error' });
});

test('maps API validation errors onto form fields', async () => {
  const result = await parseSignupResponse(
    jsonResponse(
      {
        error: {
          code: 422,
          type: 'UNPROCESSABLE_ENTITY',
          errors: {
            user: { password: ['should be at least 8 character(s)'] },
          },
        },
      },
      422
    )
  );

  assert.deepEqual(result, {
    status: 'field_error',
    fieldErrors: { password: ['should be at least 8 character(s)'] },
  });
});

test('reports an unattributable validation error as a service error', async () => {
  const result = await parseSignupResponse(
    jsonResponse(
      {
        error: {
          code: 422,
          type: 'UNPROCESSABLE_ENTITY',
          errors: { team: { name: ["can't be blank"] } },
        },
      },
      422
    )
  );

  assert.deepEqual(result, {
    status: 'service_error',
    reason: 'unexpected_response',
    httpStatus: 422,
  });
});

test('reports registration unavailability as a service error', async () => {
  const result = await parseSignupResponse(
    jsonResponse(
      { error: { code: 503, type: 'REGISTRATION_UNAVAILABLE' } },
      503
    )
  );

  assert.deepEqual(result, {
    status: 'service_error',
    reason: 'unexpected_response',
    httpStatus: 503,
  });
});

test('reports a non-JSON error body as a service error', async () => {
  const result = await parseSignupResponse(
    new Response('<html>Internal Server Error</html>', { status: 500 })
  );

  assert.deepEqual(result, {
    status: 'service_error',
    reason: 'invalid_json',
    httpStatus: 500,
  });
});
