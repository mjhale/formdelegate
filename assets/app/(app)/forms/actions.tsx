'use server';

import { revalidatePath, updateTag } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';

import { getBackendValidationMessages } from './backendValidation';
import { serializeFormPayload } from './emailProviderPayload';
import { createFormSchema, updateFormSchema } from './formSchema';
import { getReverifyFailureStatusUpdate } from './reverifyPolicy';
import { formCacheTag, formsCacheTag } from 'utils/cacheTags';
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
        'Failed to update form due to validation errors.'
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

  updateTag(formsCacheTag(selectedTeam.id));
  updateTag(formCacheTag(selectedTeam.id, validatedData.data.id));
  revalidatePath(`/forms/${validatedData.data.id}/edit`);
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

  updateTag(formsCacheTag(selectedTeam.id));
  updateTag(formCacheTag(selectedTeam.id, formId));
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
        'Failed to create form due to validation errors.'
      );

      if (validationErrorState) {
        return validationErrorState;
      }

      throw new Error(`Network response failure while creating form`);
    }
  } catch (error) {
    throw new Error(`Fetch Error: Failed to create form`);
  }

  updateTag(formsCacheTag(selectedTeam.id));
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

  updateTag(formsCacheTag(selectedTeam.id));
  updateTag(formCacheTag(selectedTeam.id, formId));
  redirect('/forms');
}
