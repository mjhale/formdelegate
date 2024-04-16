'use server';

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { z } from 'zod';

const userSchema = z.object({
  id: z.coerce.number(),
  email: z.string().email(),
  name: z.string(),
});

const passwordSchema = z.object({
  id: z.coerce.number(),
  oldPassword: z.string().min(8),
  newPassword: z.string().min(8),
});

export async function fetchCheckoutSession(userEmail, planPriceId) {
  const accessToken = cookies().get('access_token')?.value;

  const checkoutSessionRequest = await fetch(
    `${process.env.NEXT_PUBLIC_API_HOST}/v1/stripe/checkout-sessions`,
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
  const accessToken = cookies().get('access_token')?.value;

  const stripePortalRequest = await fetch(
    `${process.env.NEXT_PUBLIC_API_HOST}/v1/stripe/portal`,
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

  const accessToken = cookies().get('access_token')?.value;
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
    oldPassword: formData.get('old_password'),
    newPassword: formData.get('new_password'),
  };

  const accessToken = cookies().get('access_token')?.value;
  const validatedData = passwordSchema.safeParse(rawFormData);

  if (!validatedData.success) {
    console.log(rawFormData);
    console.log(JSON.stringify(validatedData.error, null, 4));
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
            ...validatedData.data,
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

    if (!res.ok) {
      throw new Error(`Network response failure while updating user password`);
    }
  } catch (error) {
    throw new Error(`Fetch Error: Failed to update user passsword`);
  }

  revalidatePath('/account');
}
