'use server';

import { redirect } from 'next/navigation';
import { z } from 'zod';
import { cookies } from 'next/headers';

import Link from 'next/link';

const loginSchema = z.object({
  email: z.string().trim().email().min(3),
  password: z.string().trim().min(8),
  destination: z.string(),
});

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

export async function loginUser(_currentState, formData: FormData) {
  const rawFormData = {
    destination: formData.get('destination'),
    email: formData.get('email'),
    password: formData.get('password'),
  };

  const validatedData = loginSchema.safeParse(rawFormData);

  if (!validatedData.success) {
    return {
      message: 'Failed to login due to field errors.',
      errors: validatedData.error.format(),
    };
  }

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

    if (!res.ok) {
      throw new Error(`Network response failure while logging in.`);
    }

    const { data } = await res.json();

    cookies().set('access_token', data.token, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    cookies().set('user_id', data.id, {
      httpOnly: false,
      secure: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });
  } catch (error) {
    throw new Error(`Fetch Error: Failed to login.`);
  }

  const redirectUrl =
    validatedData.data.destination === ''
      ? '/dashboard'
      : validatedData.data.destination;

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
