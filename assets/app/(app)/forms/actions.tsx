'use server';

import { redirect } from 'next/navigation';
// import { set } from 'lodash';

import { createFormSchema, updateFormSchema } from './formSchema';
import { getProfileContext } from 'utils/profile';

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

  const { accessToken, selectedTeam } = await getProfileContext();

  const validatedData = updateFormSchema.safeParse(formData);

  if (!validatedData.success) {
    return {
      message: 'Failed to update form due to field errors.',
      errors: validatedData.error.format(),
    };
  }

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_HOST}/v1/teams/${selectedTeam.id}/forms/${validatedData.data.id}`,
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
        `Network response failure while updating form ${validatedData.data.id}`
      );
    }
  } catch (error) {
    throw new Error(
      `Fetch Error: Failed to update form ${validatedData.data.id}`
    );
  }

  redirect('/forms');
}

export async function createForm(_currentState, formData) {
  const { accessToken, selectedTeam } = await getProfileContext();
  const validatedData = createFormSchema.safeParse(formData);

  if (!validatedData.success) {
    return {
      message: 'Failed to create form due to field errors.',
      errors: validatedData.error.format(),
    };
  }

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_HOST}/v1/teams/${selectedTeam.id}/forms`,
      {
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

export async function deleteForm(formId) {
  const { accessToken, selectedTeam } = await getProfileContext();

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_HOST}/v1/teams/${selectedTeam.id}/forms/${formId}`,
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
