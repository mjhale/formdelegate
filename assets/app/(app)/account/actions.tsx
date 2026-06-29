'use server';

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { z } from 'zod';

import { getProfileContext } from 'utils/profile';

const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

const userSchema = z.object({
  id: z.coerce.number(),
  email: z.string().email(),
  name: z.string(),
});

const passwordSchema = z
  .object({
    id: z.coerce.number(),
    current_password: z.string().min(8),
    password: z.string().min(8),
    password_confirmation: z.string().min(8),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: 'Passwords do not match.',
    path: ['password_confirmation'],
  });

function formatApiErrors(errors) {
  return Object.fromEntries(
    Object.entries(errors).map(([field, messages]) => [
      field,
      { _errors: Array.isArray(messages) ? messages : [String(messages)] },
    ])
  );
}

export async function fetchCheckoutSession(userEmail, planPriceId) {
  const { accessToken, selectedTeam } = await getProfileContext();

  const checkoutSessionRequest = await fetch(
    `${process.env.NEXT_PUBLIC_API_HOST}/v1/teams/${selectedTeam.id}/stripe/checkout-sessions`,
    {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        priceId: planPriceId,
        customerEmail: userEmail,
      }),
    }
  );

  return checkoutSessionRequest.json();
}

export async function fetchStripePortalUrl() {
  const { accessToken, selectedTeam } = await getProfileContext();

  const stripePortalRequest = await fetch(
    `${process.env.NEXT_PUBLIC_API_HOST}/v1/teams/${selectedTeam.id}/stripe/portal`,
    {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!stripePortalRequest.ok) {
    throw new Error('Error fetching Stripe portal URL.');
  }

  const stripePortal = await stripePortalRequest.json();

  return stripePortal.url;
}

export async function updateUserAction(_currentState, formData: FormData) {
  const rawFormData = {
    id: formData.get('id'),
    email: formData.get('email'),
    name: formData.get('name'),
  };

  const accessToken = (await cookies()).get('access_token')?.value;
  const validatedData = userSchema.safeParse(rawFormData);

  if (!validatedData.success) {
    return {
      message: 'Failed to update user due to field errors.',
      errors: validatedData.error.format(),
    };
  }

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_HOST}/v1/users/${validatedData.data.id}`,
      {
        body: JSON.stringify({
          user: {
            ...validatedData.data,
          },
        }),
        method: 'PUT',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!res.ok) {
      throw new Error(`Network response failure while updating user`);
    }
  } catch (error) {
    throw new Error(`Fetch Error: Failed to update user`);
  }

  revalidatePath('/account');
}

export async function updatePasswordAction(_currentState, formData: FormData) {
  const rawFormData = {
    id: formData.get('id'),
    current_password: formData.get('current_password'),
    password: formData.get('password'),
    password_confirmation: formData.get('password_confirmation'),
  };

  const cookieStore = await cookies();
  const accessToken = cookieStore.get('access_token')?.value;
  const validatedData = passwordSchema.safeParse(rawFormData);

  if (!validatedData.success) {
    return {
      message: 'Failed to update user due to field errors.',
      errors: validatedData.error.format(),
    };
  }

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_HOST}/v1/users/${validatedData.data.id}/change-password`,
      {
        body: JSON.stringify({
          user: {
            current_password: validatedData.data.current_password,
            password: validatedData.data.password,
            password_confirmation: validatedData.data.password_confirmation,
          },
        }),
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (res.status === 422) {
      const { error } = await res.json();

      return {
        message: 'Failed to update password due to field errors.',
        errors: formatApiErrors(error?.errors || {}),
      };
    }

    if (res.status === 403) {
      return {
        message: 'You are not allowed to change this password.',
        errors: {},
      };
    }

    if (!res.ok) {
      throw new Error(`Network response failure while updating user password`);
    }

    const { data } = await res.json();

    if (!data?.token) {
      throw new Error(
        'Password update response did not include an access token'
      );
    }

    cookieStore.set('access_token', data.token, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: COOKIE_MAX_AGE,
      secure: process.env.NODE_ENV !== 'development',
    });
  } catch (error) {
    throw new Error(`Fetch Error: Failed to update user password`);
  }

  revalidatePath('/account');

  return {
    message: 'Password updated.',
    errors: {},
  };
}
