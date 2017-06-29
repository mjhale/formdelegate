import { CALL_API } from '../middleware/api';
import { formSchema, integrationListSchema } from '../schema';
import {
  FORM_REQUEST,
  FORM_SUCCESS,
  FORM_FAILURE,
} from '../constants/actionTypes';
import {
  FORM_CREATE_REQUEST,
  FORM_CREATE_SUCCESS,
  FORM_CREATE_FAILURE,
} from '../constants/actionTypes';
import {
  FORM_DELETE_REQUEST,
  FORM_DELETE_SUCCESS,
  FORM_DELETE_FAILURE,
} from '../constants/actionTypes';
import {
  FORM_UPDATE_REQUEST,
  FORM_UPDATE_SUCCESS,
  FORM_UPDATE_FAILURE,
} from '../constants/actionTypes';
import {
  FORMS_REQUEST,
  FORMS_SUCCESS,
  FORMS_FAILURE,
} from '../constants/actionTypes';
import {
  INTEGRATIONS_REQUEST,
  INTEGRATIONS_SUCCESS,
  INTEGRATIONS_FAILURE,
} from '../constants/actionTypes';

export const fetchForms = () => ({
  [CALL_API]: {
    authenticated: true,
    endpoint: 'forms',
    schema: [formSchema],
    types: [FORMS_REQUEST, FORMS_SUCCESS, FORMS_FAILURE],
  },
});

export const fetchIntegrations = () => ({
  [CALL_API]: {
    authenticated: true,
    endpoint: 'integrations',
    schema: integrationListSchema,
    types: [INTEGRATIONS_REQUEST, INTEGRATIONS_SUCCESS, INTEGRATIONS_FAILURE],
  },
});

export const fetchForm = formId => ({
  [CALL_API]: {
    authenticated: true,
    endpoint: `forms/${formId}`,
    schema: formSchema,
    types: [FORM_REQUEST, FORM_SUCCESS, FORM_FAILURE],
  },
});

export function createForm(form) {
  return async (dispatch, getState) => {
    const actionResponse = await dispatch({
      [CALL_API]: {
        authenticated: true,
        config: {
          body: JSON.stringify({ form }),
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          method: 'POST',
        },
        endpoint: 'forms',
        schema: formSchema,
        types: [FORM_CREATE_REQUEST, FORM_CREATE_SUCCESS, FORM_CREATE_FAILURE],
      },
    });

    if (actionResponse.error) {
      throw new Error('Promise flow received action error', actionResponse);
    }

    return actionResponse;
  };
}

export function updateForm(form) {
  return async (dispatch, getState) => {
    const actionResponse = await dispatch({
      [CALL_API]: {
        authenticated: true,
        config: {
          body: JSON.stringify({ form }),
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          method: 'PUT',
        },
        endpoint: `forms/${form.id}`,
        schema: formSchema,
        types: [FORM_UPDATE_REQUEST, FORM_UPDATE_SUCCESS, FORM_UPDATE_FAILURE],
      },
    });

    if (actionResponse.error) {
      throw new Error('Promise flow received action error', actionResponse);
    }

    return actionResponse;
  };
}

function deleteForm(formId) {
  return {
    type: FORM_DELETE_SUCCESS,
    id: formId,
  };
}

export function formDeletionRequest(formId) {
  return async (dispatch, getState) => {
    const actionResponse = await dispatch({
      [CALL_API]: {
        authenticated: true,
        config: {
          method: 'DELETE',
        },
        endpoint: `forms/${formId}`,
        schema: null,
        types: [FORM_DELETE_REQUEST, FORM_DELETE_SUCCESS, FORM_DELETE_FAILURE],
      },
    });

    if (actionResponse.error) {
      throw new Error('Promise flow received action error', actionResponse);
    }

    return dispatch(deleteForm(formId));
  };
}
