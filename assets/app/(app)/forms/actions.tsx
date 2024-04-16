'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
// import { set } from 'lodash';

import { schema } from './formSchema';

export async function updateForm(_currentState, formData) {
  // @TODO: Use native FormData when RHF supports server actions in stable
  // const formId = formData.get('id');
  // const rawFormData = Object.fromEntries(
  //   Array.from(formData).filter(([key]) => !key.startsWith('$ACTION_'))
  // );
  // const data = {};
  // for (const [key, val] of Object.entries(formData)) {
  //   set(data, key, val);
  // }

  const accessToken = cookies().get('access_token')?.value;

  const validatedData = schema.safeParse(formData);

  if (!validatedData.success) {
    return {
      message: 'Failed to update form due to field errors.',
      errors: validatedData.error.format(),
    };
  }

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_HOST}/v1/forms/${formData.id}`,
      {
        body: JSON.stringify({
          form: {
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
      throw new Error(
        `Network response failure while updating form ${formData.id}`
      );
    }
  } catch (error) {
    throw new Error(`Fetch Error: Failed to update form ${formData.id}`);
  }

  redirect('/forms');
}

export async function createForm(_currentState, formData) {
  const accessToken = cookies().get('access_token')?.value;
  const validatedData = schema.safeParse(formData);

  if (!validatedData.success) {
    return {
      message: 'Failed to update form due to field errors.',
      errors: validatedData.error.format(),
    };
  }

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_HOST}/v1/forms`, {
      body: JSON.stringify({
        form: {
          ...validatedData.data,
        },
      }),
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!res.ok) {
      throw new Error(`Network response failure while creating form`);
    }
  } catch (error) {
    throw new Error(`Fetch Error: Failed to create form`);
  }

  redirect('/forms');
}

export async function deleteForm(formId) {
  const accessToken = cookies().get('access_token')?.value;

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_HOST}/v1/forms/${formId}`,
      {
        method: 'DELETE',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!res.ok) {
      throw new Error(`Network response failure while creating form`);
    }
  } catch (error) {
    throw new Error(`Fetch Error: Failed to create form`);
  }

  redirect('/forms');
}
