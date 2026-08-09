'use server';

import { redirect } from 'next/navigation';
import { z } from 'zod';
import { cookies } from 'next/headers';

import {
  CURRENT_TEAM_COOKIE,
  fetchProfile,
  setCurrentTeamCookie,
} from 'utils/profile';
import { safeRedirectPath } from 'utils/destination';

import {
  fieldErrorState,
  invalidCredentialsState,
  loginInputSchema,
  parseLoginSessionResponse,
  serviceErrorState,
  type LoginState,
} from './login/loginContract';

import Link from 'next/link';

const requestPasswordResetSchema = z.object({
  email: z.string().email(),
});

const resetPasswordSchema = z
  .object({
    password: z.string().min(8),
    password_confirmation: z.string().min(8),
    reset_password_token: z.string(),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: "Passwords don't match",
    path: ['password_confirmation'],
  });

export async function loginUser(
  _currentState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const rawFormData = {
    destination: String(formData.get('destination') ?? ''),
    email: String(formData.get('email') ?? ''),
    password: String(formData.get('password') ?? ''),
  };

  const validatedData = loginInputSchema.safeParse(rawFormData);

  if (!validatedData.success) {
    return fieldErrorState(validatedData.error);
  }

  const destination = safeRedirectPath(validatedData.data.destination, '');
  let redirectUrl = destination || '/dashboard';
  let failureStage = 'session_request';

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_HOST}/v1/sessions`, {
      body: JSON.stringify({
        session: {
          email: validatedData.data.email,
          password: validatedData.data.password,
        },
      }),
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    });

    const sessionResult = await parseLoginSessionResponse(res);

    if (sessionResult.status === 'invalid_credentials') {
      return invalidCredentialsState();
    }

    if (sessionResult.status === 'service_error') {
      console.error('Login failed.', {
        stage: 'session_response',
        status: sessionResult.httpStatus,
        reason: sessionResult.reason,
      });

      return serviceErrorState();
    }

    failureStage = 'profile_request';
    const profile = await fetchProfile(
      sessionResult.token,
      sessionResult.userId
    );
    const selectedTeamId =
      profile.current_team?.id || profile.memberships[0]?.team.id;
    failureStage = 'session_setup';
    const cookieStore = await cookies();

    cookieStore.set('access_token', sessionResult.token, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    cookieStore.set('user_id', sessionResult.userId, {
      httpOnly: false,
      secure: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    if (selectedTeamId) {
      await setCurrentTeamCookie(selectedTeamId);
    } else {
      cookieStore.delete(CURRENT_TEAM_COOKIE);
      redirectUrl = destination || '/account-setup-required';
    }
  } catch {
    console.error('Login failed.', { stage: failureStage });
    return serviceErrorState();
  }

  redirect(redirectUrl);
}

export async function requestPasswordResetAction(
  _currentState,
  rawFormData: FormData
) {
  const formData = { email: rawFormData.get('email') };

  const validatedData = requestPasswordResetSchema.safeParse(formData);

  if (!validatedData.success) {
    return {
      message: 'Failed to submit form due to field errors.',
      errors: validatedData.error.format(),
    };
  }

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_HOST}/v1/users/reset-password`,
      {
        body: JSON.stringify({
          user: {
            ...validatedData.data,
          },
        }),
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      }
    );

    if (!res.ok) {
      throw new Error(
        `Network response failure while requesting password reset`
      );
    }
  } catch (error) {
    throw new Error(`Fetch Error: Failed to request password reset`);
  }

  return {
    message:
      'Got it! If your email address is linked to an account on our service, you will receive instructions to reset your password.',
  };
}

export async function resetPasswordAction(
  _currentState,
  rawFormData: FormData
) {
  const formData = {
    password: rawFormData.get('password'),
    password_confirmation: rawFormData.get('password_confirmation'),
    reset_password_token: rawFormData.get('reset_password_token'),
  };

  const validatedData = resetPasswordSchema.safeParse(formData);

  if (!validatedData.success) {
    return {
      message: 'Failed to submit form due to field errors.',
      errors: validatedData.error.format(),
    };
  }

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_HOST}/v1/users/reset-password`,
      {
        body: JSON.stringify({
          user: {
            password: validatedData.data.password,
            reset_password_token: validatedData.data.reset_password_token,
          },
        }),
        method: 'PUT',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      }
    );

    if (!res.ok) {
      return {
        message: (
          <>
            Unable to change password. Please request a new{' '}
            <Link href="/reset-password" className="underline font-semibold">
              password reset email
            </Link>
            .
          </>
        ),
      };
    }
  } catch (error) {
    console.log(error);

    throw new Error(`Fetch Error: Failed to reset password`);
  }

  redirect('/login');
}
