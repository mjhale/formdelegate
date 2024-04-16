'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { z } from 'zod';

const userSchema = z.object({
  captcha: z.string().min(1, { message: 'Invalid Captcha response' }),
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

export async function createUserAction(_currentState, rawFormData: FormData) {
  const formData = {
    captcha: rawFormData.get('captcha'),
    user: {
      email: rawFormData.get('user.email'),
      name: rawFormData.get('user.name'),
      password: rawFormData.get('user.password'),
      password_confirmation: rawFormData.get('user.password_confirmation'),
    },
  };

  const validatedData = userSchema.safeParse(formData);

  if (!validatedData.success) {
    return {
      message: 'Failed to create user due to field errors.',
      errors: validatedData.error.format(),
    };
  }

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

    if (!res.ok) {
      throw new Error(`Network response failure while creating user`);
    }

    const { data } = await res.json();

    cookies().set({
      name: 'access_token',
      value: data.token,
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      secure: process.env.NODE_ENV !== 'development',
    });

    cookies().set({
      name: 'user_id',
      value: data.id,
      httpOnly: false,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      secure: process.env.NODE_ENV !== 'development',
    });
  } catch (error) {
    throw new Error(`Fetch Error: Failed to create user`);
  }

  redirect('/dashboard');
}
