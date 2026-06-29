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
      const validationErrorState = await getBackendValidationErrorState(
        res,
        'Failed to update form due to provider validation errors.'
      );

      if (validationErrorState) {
        return validationErrorState;
      }

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
      const validationErrorState = await getBackendValidationErrorState(
        res,
        'Failed to create form due to provider validation errors.'
      );

      if (validationErrorState) {
        return validationErrorState;
      }

      throw new Error(`Network response failure while creating form`);
    }
  } catch (error) {
    throw new Error(`Fetch Error: Failed to create form`);
  }

  redirect('/forms');
}

async function getBackendValidationErrorState(res, fallbackMessage) {
  if (res.status !== 400 && res.status !== 422) {
    return null;
  }

  const body = await getJsonResponseBody(res);
  const messages = getBackendValidationMessages(body);

  return {
    message: messages[0] ?? fallbackMessage,
    errors: {
      _errors: messages.length > 0 ? messages : [fallbackMessage],
    },
  };
}

async function getJsonResponseBody(res) {
  try {
    return await res.json();
  } catch (_error) {
    return null;
  }
}

function getBackendValidationMessages(body): Array<string> {
  const error = body?.error;

  if (!error) {
    return [];
  }

  const messages = [
    getBackendErrorTypeMessage(error.type),
    ...flattenBackendErrors(error.errors),
  ].filter(Boolean);

  return messages.length > 0
    ? messages
    : ['Provider validation failed. Check the email integration settings.'];
}

function getBackendErrorTypeMessage(type): string | null {
  switch (type) {
    case 'EMAIL_PROVIDER_VERIFICATION_FAILED_INVALID_CREDENTIALS':
      return 'Email provider verification failed: invalid credentials.';
    case 'EMAIL_PROVIDER_VERIFICATION_FAILED_CONNECTION_FAILED':
      return 'Email provider verification failed: connection failed.';
    case 'EMAIL_PROVIDER_VERIFICATION_FAILED_INVALID_CONFIGURATION':
      return 'Email provider verification failed: invalid configuration.';
    case 'EMAIL_PROVIDER_VERIFICATION_FAILED_UNSUPPORTED_AUTH_METHOD':
      return 'Email provider verification failed: unsupported authentication method.';
    case 'EMAIL_PROVIDER_VERIFICATION_FAILED_UNKNOWN':
      return 'Email provider verification failed.';
    case 'UNSUPPORTED_EMAIL_PROVIDER':
      return 'Unsupported email provider.';
    case 'UNPROCESSABLE_ENTITY':
      return null;
    default:
      return type ? 'Provider validation failed.' : null;
  }
}

function flattenBackendErrors(errors, path: Array<string> = []): Array<string> {
  if (!errors) {
    return [];
  }

  if (Array.isArray(errors)) {
    if (errors.every((error) => typeof error === 'string')) {
      return errors.map((error) => formatBackendError(path, error));
    }

    return errors.flatMap((error, index) =>
      flattenBackendErrors(error, [...path, String(index + 1)])
    );
  }

  if (typeof errors === 'object') {
    return Object.entries(errors).flatMap(([field, value]) =>
      flattenBackendErrors(value, [...path, humanizeBackendField(field)])
    );
  }

  return [];
}

function formatBackendError(path: Array<string>, error: string): string {
  if (path.length === 0) {
    return error;
  }

  return `${path.join(' > ')}: ${error}`;
}

function humanizeBackendField(field: string): string {
  return field.replaceAll('_', ' ');
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
