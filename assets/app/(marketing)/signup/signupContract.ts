import { z } from 'zod';

export type SignupField =
  'email' | 'name' | 'password' | 'password_confirmation' | 'captcha';

export type SignupFieldErrors = Partial<Record<SignupField, string[]>>;

export type SignupState =
  | { status: 'idle' }
  // `captchaSpent` is true when the API saw the captcha token, which is single-use.
  | {
      status: 'field_error';
      fieldErrors: SignupFieldErrors;
      captchaSpent: boolean;
    }
  | { status: 'captcha_error'; message: string }
  | { status: 'service_error'; message: string }
  // The account exists, but the session could not be set up afterwards.
  | { status: 'sign_in_error'; message: string };

export const CAPTCHA_ERROR_MESSAGE =
  'The captcha expired or couldn’t be verified. Complete it again and resubmit.';

export const SERVICE_ERROR_MESSAGE =
  'We couldn’t create your account right now. Please try again in a moment.';

export const SIGN_IN_ERROR_MESSAGE =
  'Your account was created, but we couldn’t sign you in. Log in to continue.';

export const signupInputSchema = z.object({
  captcha: z.string().min(1, { message: 'Invalid Captcha response' }),
  destination: z.string(),
  user: z
    .object({
      name: z.string().min(1, { message: 'Full name is required' }),
      email: z.string().email(),
      password: z.string().min(8),
      password_confirmation: z.string().min(8),
    })
    .refine((data) => data.password === data.password_confirmation, {
      message: "Passwords don't match",
      path: ['password_confirmation'],
    }),
});

const USER_FIELDS = [
  'email',
  'name',
  'password',
  'password_confirmation',
] as const;

const signupSuccessSchema = z.object({
  data: z.object({
    id: z.number().int().positive(),
    token: z.string().min(1),
  }),
});

const captchaErrorSchema = z.object({
  error: z.object({
    code: z.literal(400),
    type: z.literal('INVALID_OR_EXPIRED_CAPTCHA'),
  }),
});

const fieldMessagesSchema = z.array(z.string()).optional();

const validationErrorSchema = z.object({
  error: z.object({
    code: z.literal(422),
    errors: z.object({
      captcha: fieldMessagesSchema,
      user: z
        .object({
          email: fieldMessagesSchema,
          name: fieldMessagesSchema,
          password: fieldMessagesSchema,
        })
        .optional(),
    }),
  }),
});

export type SignupResponseResult =
  | { status: 'success'; userId: string; token: string }
  | { status: 'captcha_error' }
  | { status: 'field_error'; fieldErrors: SignupFieldErrors }
  | {
      status: 'service_error';
      reason: 'invalid_json' | 'invalid_success' | 'unexpected_response';
      httpStatus: number;
    };

function addFieldError(
  fieldErrors: SignupFieldErrors,
  field: SignupField,
  message: string
) {
  fieldErrors[field] = [...(fieldErrors[field] ?? []), message];
}

export function fieldErrorState(
  error: z.ZodError<z.infer<typeof signupInputSchema>>
): SignupState {
  const fieldErrors: SignupFieldErrors = {};

  for (const issue of error.issues) {
    const [first, second] = issue.path;

    if (first === 'captcha') {
      addFieldError(fieldErrors, 'captcha', issue.message);
    } else if (
      first === 'user' &&
      USER_FIELDS.includes(second as (typeof USER_FIELDS)[number])
    ) {
      addFieldError(fieldErrors, second as SignupField, issue.message);
    }
  }

  return { status: 'field_error', fieldErrors, captchaSpent: false };
}

export function apiFieldErrorState(
  fieldErrors: SignupFieldErrors
): SignupState {
  return { status: 'field_error', fieldErrors, captchaSpent: true };
}

export function captchaErrorState(): SignupState {
  return { status: 'captcha_error', message: CAPTCHA_ERROR_MESSAGE };
}

export function serviceErrorState(): SignupState {
  return { status: 'service_error', message: SERVICE_ERROR_MESSAGE };
}

export function signInErrorState(): SignupState {
  return { status: 'sign_in_error', message: SIGN_IN_ERROR_MESSAGE };
}

export async function parseSignupResponse(
  response: Response
): Promise<SignupResponseResult> {
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
    const parsedSuccess = signupSuccessSchema.safeParse(body);

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

  if (response.status === 400 && captchaErrorSchema.safeParse(body).success) {
    return { status: 'captcha_error' };
  }

  if (response.status === 422) {
    const parsedValidation = validationErrorSchema.safeParse(body);

    if (parsedValidation.success) {
      const { captcha, user } = parsedValidation.data.error.errors;
      const fieldErrors: SignupFieldErrors = {};

      if (captcha?.length) fieldErrors.captcha = captcha;
      if (user?.email?.length) fieldErrors.email = user.email;
      if (user?.name?.length) fieldErrors.name = user.name;
      if (user?.password?.length) fieldErrors.password = user.password;

      // A 422 the form can't attribute to a field is reported as a service error.
      if (Object.keys(fieldErrors).length > 0) {
        return { status: 'field_error', fieldErrors };
      }
    }
  }

  return {
    status: 'service_error',
    reason: 'unexpected_response',
    httpStatus: response.status,
  };
}
