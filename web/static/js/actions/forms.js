import { CALL_API } from 'middleware/api';
import { formSchema } from 'schema';

// action type constants
import {
  FORM_REQUEST,
  FORM_SUCCESS,
  FORM_FAILURE,
  FORM_CREATE_REQUEST,
  FORM_CREATE_SUCCESS,
  FORM_CREATE_FAILURE,
  FORM_DELETE_REQUEST,
  FORM_DELETE_SUCCESS,
  FORM_DELETE_FAILURE,
  FORM_UPDATE_REQUEST,
  FORM_UPDATE_SUCCESS,
  FORM_UPDATE_FAILURE,
  FORMS_REQUEST,
  FORMS_SUCCESS,
  FORMS_FAILURE,
} from 'constants/actionTypes';

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

function deleteForm(formId) {
  return {
    type: FORM_DELETE_SUCCESS,
    id: formId,
  };
}

export const fetchForm = formId => ({
  [CALL_API]: {
    authenticated: true,
    endpoint: `forms/${formId}`,
    schema: formSchema,
    types: [FORM_REQUEST, FORM_SUCCESS, FORM_FAILURE],
  },
});

export const fetchForms = () => ({
  [CALL_API]: {
    authenticated: true,
    endpoint: 'forms',
    schema: [formSchema],
    types: [FORMS_REQUEST, FORMS_SUCCESS, FORMS_FAILURE],
  },
});

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
