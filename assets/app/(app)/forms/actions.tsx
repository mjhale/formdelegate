'use server';

import { redirect } from 'next/navigation';
import { z } from 'zod';
// import { set } from 'lodash';

import { serializeFormPayload } from './emailProviderPayload';
import { createFormSchema, updateFormSchema } from './formSchema';
import { getReverifyFailureStatusUpdate } from './reverifyPolicy';
import { getProfileContext } from 'utils/profile';

const reverifyEmailIntegrationSchema = z.object({
  formId: z.string().uuid(),
  integrationId: z.string().uuid(),
  integrationIndex: z.number().int().nonnegative(),
  reverifyRequestId: z.string().min(1),
});

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
          form: serializeFormPayload(validatedData.data, formData),
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

export async function reverifyEmailIntegration(_currentState, payload) {
  const validatedData = reverifyEmailIntegrationSchema.safeParse(payload);

  if (!validatedData.success) {
    return {
      message: 'Failed to reverify email provider due to field errors.',
      errors: {
        _errors: ['Persisted email integration is required to reverify.'],
      },
    };
  }

  const { accessToken, selectedTeam } = await getProfileContext();
  const { formId, integrationId, integrationIndex, reverifyRequestId } =
    validatedData.data;

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_HOST}/v1/teams/${selectedTeam.id}/forms/${formId}/email_integrations/${integrationId}/verify`,
      {
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
        'Failed to reverify email provider.',
        { integrationId, integrationIndex, reverifyRequestId }
      );

      if (validationErrorState) {
        return validationErrorState;
      }

      throw new Error(
        `Network response failure while reverifying email integration ${integrationId}`
      );
    }
  } catch (error) {
    throw new Error(
      `Fetch Error: Failed to reverify email integration ${integrationId}`
    );
  }

  redirect(`/forms/${formId}/edit`);
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
          form: serializeFormPayload(validatedData.data, formData),
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

async function getBackendValidationErrorState(
  res,
  fallbackMessage,
  options: {
    integrationId?: string;
    integrationIndex?: number;
    reverifyRequestId?: string;
  } = {}
) {
  if (res.status !== 400 && res.status !== 422) {
    return null;
  }

  const body = await getJsonResponseBody(res);
  const messages = getBackendValidationMessages(body);
  const errorMessages = messages.length > 0 ? messages : [fallbackMessage];
  const statusUpdate =
    options.integrationId !== undefined
      ? getReverifyFailureStatusUpdate(body, options.integrationId)
      : null;

  if (
    options.integrationIndex !== undefined &&
    options.integrationId !== undefined
  ) {
    const emailIntegrations = [];
    emailIntegrations[options.integrationIndex] = {
      _email_integration_id: options.integrationId,
      _errors: errorMessages,
    };

    return {
      message: errorMessages[0],
      reverifyIntegrationId: options.integrationId,
      reverifyRequestId: options.reverifyRequestId,
      errors: {
        email_integrations: emailIntegrations,
      },
      ...(statusUpdate
        ? { emailIntegrationStatusUpdates: [statusUpdate] }
        : {}),
    };
  }

  return {
    message: errorMessages[0],
    errors: {
      _errors: errorMessages,
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
      return 'Email provider verification failed: invalid credentials. Check the provider secret and account credentials, then try again.';
    case 'EMAIL_PROVIDER_VERIFICATION_FAILED_CONNECTION_FAILED':
      return 'Email provider verification failed: connection failed. Check the provider host, port, SSL setting, and network access.';
    case 'EMAIL_PROVIDER_VERIFICATION_FAILED_INVALID_CONFIGURATION':
      return 'Email provider verification failed: invalid configuration. Check the provider settings and required fields.';
    case 'EMAIL_PROVIDER_VERIFICATION_FAILED_UNSUPPORTED_AUTH_METHOD':
      return 'Email provider verification failed: unsupported authentication method. Use provider credentials that support the required authentication method.';
    case 'EMAIL_PROVIDER_VERIFICATION_FAILED_UNKNOWN':
      return 'Email provider verification failed. Check the provider settings and try again.';
    case 'UNSUPPORTED_EMAIL_PROVIDER':
      return 'Unsupported email provider. Select SMTP, Postmark, or SendGrid before reverifying.';
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
