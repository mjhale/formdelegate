import { CALL_API } from '../middleware/api';
import { formSchema, integrationListSchema } from '../schema';

export const FORM_REQUEST = 'FORM_REQUEST';
export const FORM_SUCCESS = 'FORM_SUCCESS';
export const FORM_FAILURE = 'FORM_FAILURE';
export const FORM_CREATE_REQUEST = 'FORM_CREATE_REQUEST';
export const FORM_CREATE_SUCCESS = 'FORM_CREATE_SUCCESS';
export const FORM_CREATE_FAILURE = 'FORM_CREATE_FAILURE';
export const FORM_UPDATE_REQUEST = 'FORM_UPDATE_REQUEST';
export const FORM_UPDATE_SUCCESS = 'FORM_UPDATE_SUCCESS';
export const FORM_UPDATE_FAILURE = 'FORM_UPDATE_FAILURE';
export const FORMS_REQUEST = 'FORMS_REQUEST';
export const FORMS_SUCCESS = 'FORMS_SUCCESS';
export const FORMS_FAILURE = 'FORMS_FAILURE';
export const INTEGRATIONS_REQUEST = 'INTEGRATIONS_REQUEST';
export const INTEGRATIONS_SUCCESS = 'INTEGRATIONS_SUCCESS';
export const INTEGRATIONS_FAILURE = 'INTEGRATIONS_FAILURE';

export const fetchForms = () => ({
  [CALL_API]: {
    authenticated: true,
    endpoint: 'forms',
    schema: [formSchema],
    types: [FORMS_REQUEST, FORMS_SUCCESS, FORMS_FAILURE],
  }
});

export const fetchIntegrations = () => ({
  [CALL_API]: {
    authenticated: true,
    endpoint: 'integrations',
    schema: integrationListSchema,
    types: [INTEGRATIONS_REQUEST, INTEGRATIONS_SUCCESS, INTEGRATIONS_FAILURE],
  }
});

export const fetchForm = (formId) => ({
  [CALL_API]: {
    authenticated: true,
    endpoint: `forms/${formId}`,
    schema: formSchema,
    types: [FORM_REQUEST, FORM_SUCCESS, FORM_FAILURE],
  }
});

export function createForm(form) {
  return async(dispatch, getState) => {
    const actionResponse = await dispatch({
      [CALL_API]: {
        authenticated: true,
        config: {
          body: JSON.stringify({ form }),
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          method: 'POST',
        },
        endpoint: 'forms',
        schema: null,
        types: [FORM_CREATE_REQUEST, FORM_CREATE_SUCCESS, FORM_CREATE_FAILURE],
      }
    });

    if (actionResponse.error) {
      throw new Error('Promise flow received action error', actionResponse);
    }

    return actionResponse;
  };
}

export function updateForm(form) {
  return async(dispatch, getState) => {
    const actionResponse = await dispatch({
      [CALL_API]: {
        authenticated: true,
        config: {
          body: JSON.stringify({ form }),
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          method: 'PUT',
        },
        endpoint: `forms/${form.id}`,
        schema: null,
        types: [FORM_UPDATE_REQUEST, FORM_UPDATE_SUCCESS, FORM_UPDATE_FAILURE],
      }
    });

    if (actionResponse.error) {
      throw new Error('Promise flow received action error', actionResponse);
    }

    return actionResponse;
  };
}
