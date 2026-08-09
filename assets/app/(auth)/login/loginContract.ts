import { z } from 'zod';

export type LoginField = 'email' | 'password';

export type LoginFieldErrors = Partial<Record<LoginField, string[]>>;

export type LoginState =
  | { status: 'idle' }
  | { status: 'field_error'; fieldErrors: LoginFieldErrors }
  | { status: 'invalid_credentials'; message: string }
  | { status: 'service_error'; message: string };

export const INVALID_CREDENTIALS_MESSAGE =
  'Email or password wasn’t recognized. Check your details and try again.';

export const SERVICE_ERROR_MESSAGE =
  'We couldn’t sign you in right now. Please try again in a moment.';

const passwordSchema = z.string().superRefine((password, context) => {
  if (password.length === 0) {
    context.addIssue({
      code: 'custom',
      message: 'Enter your password.',
    });
  } else if (password.length < 8) {
    context.addIssue({
      code: 'custom',
      message: 'Password must be at least 8 characters.',
    });
  }
});

export const loginInputSchema = z.object({
  destination: z.string(),
  email: z.string().trim().email({ message: 'Enter a valid email address.' }),
  password: passwordSchema,
});

const sessionSuccessSchema = z.object({
  data: z.object({
    id: z.number().int().positive(),
    token: z.string().min(1),
  }),
});

const invalidCredentialsSchema = z.object({
  error: z.object({
    code: z.literal(401),
    type: z.literal('INVALID_CREDENTIALS'),
  }),
});

export type LoginSessionResult =
  | { status: 'success'; userId: string; token: string }
  | { status: 'invalid_credentials' }
  | {
      status: 'service_error';
      reason: 'invalid_json' | 'invalid_success' | 'unexpected_response';
      httpStatus: number;
    };

export function fieldErrorState(
  error: z.ZodError<z.infer<typeof loginInputSchema>>
): LoginState {
  const fieldErrors = error.flatten().fieldErrors;
  const loginFieldErrors: LoginFieldErrors = {};

  if (fieldErrors.email) {
    loginFieldErrors.email = fieldErrors.email;
  }

  if (fieldErrors.password) {
    loginFieldErrors.password = fieldErrors.password;
  }

  return {
    status: 'field_error',
    fieldErrors: loginFieldErrors,
  };
}

export function invalidCredentialsState(): LoginState {
  return {
    status: 'invalid_credentials',
    message: INVALID_CREDENTIALS_MESSAGE,
  };
}

export function serviceErrorState(): LoginState {
  return {
    status: 'service_error',
    message: SERVICE_ERROR_MESSAGE,
  };
}

export async function parseLoginSessionResponse(
  response: Response
): Promise<LoginSessionResult> {
  let body: unknown;

  try {
    body = await response.json();
  } catch {
    return {
      status: 'service_error',
      reason: 'invalid_json',
      httpStatus: response.status,
    };
  }

  if (response.ok) {
    const parsedSuccess = sessionSuccessSchema.safeParse(body);

    if (!parsedSuccess.success) {
      return {
        status: 'service_error',
        reason: 'invalid_success',
        httpStatus: response.status,
      };
    }

    return {
      status: 'success',
      userId: parsedSuccess.data.data.id.toString(),
      token: parsedSuccess.data.data.token,
    };
  }

  if (
    response.status === 401 &&
    invalidCredentialsSchema.safeParse(body).success
  ) {
    return { status: 'invalid_credentials' };
  }

  return {
    status: 'service_error',
    reason: 'unexpected_response',
    httpStatus: response.status,
  };
}
