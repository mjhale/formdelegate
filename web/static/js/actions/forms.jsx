import fetch from 'isomorphic-fetch';
import { formSchema, integrationListSchema } from '../schema';
import { normalize } from 'normalizr';

export const REQUEST_FORM = 'REQUEST_FORM';
export const REQUEST_FORMS = 'REQUEST_FORMS';
export const RECEIVE_FORM = 'RECEIVE_FORM';
export const RECEIVE_FORMS = 'RECEIVE_FORMS';
export const RECEIVE_INTEGRATIONS = 'RECEIVE_INTEGRATIONS';

function requestForm() {
  return {
    type: REQUEST_FORM,
  };
}

function requestForms() {
  return {
    type: REQUEST_FORMS,
  };
}

function receiveForm(response) {
  return {
    type: RECEIVE_FORM,
    receivedAt: Date.now(),
    response,
  };
}

function receiveForms(response) {
  return {
    type: RECEIVE_FORMS,
    receivedAt: Date.now(),
    response,
  };
}

function receiveIntegrations(response) {
  return {
    type: RECEIVE_INTEGRATIONS,
    receivedAt: Date.now(),
    response,
  };
}

export function fetchForms() {
  return (dispatch) => {
    dispatch(requestForms());

    let token = localStorage.getItem('fd_token') || null;

    if (token) {
      return fetch('/api/forms', {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      })
      .then((response) => {
        return response.json();
      })
      .then((json) => {
        const response = normalize(json.data, [formSchema]);
        return dispatch(receiveForms(response));
      });
    } else {
      throw 'No token found.';
    }
  };
}

export function fetchIntegrations() {
  return (dispatch) => {
    let token = localStorage.getItem('fd_token') || null;

    if (token) {
      return fetch(`/api/integrations`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      })
      .then((response) => {
        return response.json();
      })
      .then((json) => {
        const response = normalize(json.data, integrationListSchema);
        return dispatch(receiveIntegrations(response));
      });
    } else {
      throw 'No token found.';
    }
  };
}


export function fetchForm(formId) {
  return (dispatch) => {
    dispatch(requestForm());

    let token = localStorage.getItem('fd_token') || null;

    if (token) {
      return fetch(`/api/forms/${formId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      })
      .then((response) => {
        return response.json();
      })
      .then((json) => {
        const response = normalize(json.data, formSchema);
        return dispatch(receiveForm(response));
      });
    } else {
      throw 'No token found.';
    }
  };
}

export function updateForm(form) {
  return (dispatch, getState) => {
    // dispatch(updateAccountOptimistic(account));

    let token = localStorage.getItem('fd_token') || null;

    if (token) {
      return fetch(`/api/forms/${form.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          form
        }),
      })
      .catch((error) => {
        console.log(error);
      });
    } else {
      throw 'No token found.';
    }
  };
};
