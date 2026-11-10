'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { safeRedirectPath } from 'utils/destination';
import {
  CURRENT_TEAM_COOKIE,
  fetchProfile,
  setCurrentTeamCookie,
} from 'utils/profile';

import {
  apiFieldErrorState,
  captchaErrorState,
  fieldErrorState,
  parseSignupResponse,
  serviceErrorState,
  signInErrorState,
  signupInputSchema,
  type SignupState,
} from './signupContract';

export async function createUserAction(
  _currentState: SignupState,
  rawFormData: FormData
): Promise<SignupState> {
  const formData = {
    captcha: String(rawFormData.get('captcha') ?? ''),
    destination: String(rawFormData.get('destination') ?? ''),
    user: {
      email: String(rawFormData.get('user.email') ?? ''),
      name: String(rawFormData.get('user.name') ?? ''),
      password: String(rawFormData.get('user.password') ?? ''),
      password_confirmation: String(
        rawFormData.get('user.password_confirmation') ?? ''
      ),
    },
  };

  const validatedData = signupInputSchema.safeParse(formData);

  if (!validatedData.success) {
    return fieldErrorState(validatedData.error);
  }

  const destination = safeRedirectPath(validatedData.data.destination, '');
  let redirectUrl = destination || '/dashboard';
  let signupResult: Awaited<ReturnType<typeof parseSignupResponse>>;

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_HOST}/v1/users`, {
      body: JSON.stringify({
        captcha: validatedData.data.captcha,
        user: validatedData.data.user,
      }),
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    });

    signupResult = await parseSignupResponse(res);
  } catch {
    console.error('Signup failed.', { stage: 'signup_request' });
    return serviceErrorState();
  }

  if (signupResult.status === 'captcha_error') {
    return captchaErrorState();
  }

  if (signupResult.status === 'field_error') {
    return apiFieldErrorState(signupResult.fieldErrors);
  }

  if (signupResult.status === 'service_error') {
    console.error('Signup failed.', {
      stage: 'signup_response',
      status: signupResult.httpStatus,
      reason: signupResult.reason,
    });

    return serviceErrorState();
  }

  // The account exists from here on, so a failure must not invite a second signup.
  let failureStage = 'profile_request';

  try {
    const profile = await fetchProfile(signupResult.token, signupResult.userId);
    const selectedTeamId =
      profile.current_team?.id || profile.memberships[0]?.team.id;
    failureStage = 'session_setup';
    const cookieStore = await cookies();

    cookieStore.set({
      name: 'access_token',
      value: signupResult.token,
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      secure: process.env.NODE_ENV !== 'development',
    });

    cookieStore.set({
      name: 'user_id',
      value: signupResult.userId,
      httpOnly: false,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      secure: process.env.NODE_ENV !== 'development',
    });

    if (selectedTeamId) {
      await setCurrentTeamCookie(selectedTeamId);
    } else {
      cookieStore.delete(CURRENT_TEAM_COOKIE);
      redirectUrl = destination || '/account-setup-required';
    }
  } catch {
    console.error('Signup sign-in failed.', { stage: failureStage });
    return signInErrorState();
  }

  redirect(redirectUrl);
}
