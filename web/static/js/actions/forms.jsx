import fetch from 'isomorphic-fetch';

export const REQUEST_FORMS = 'REQUEST_FORMS';
export const RECEIVE_FORMS = 'RECEIVE_FORMS';

function requestForms() {
  return {
    type: REQUEST_FORMS,
  };
}

function receiveForms(json) {
  return {
    type: RECEIVE_FORMS,
    forms: json.data,
    receivedAt: Date.now(),
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
        return dispatch(receiveForms(json));
      });
    } else {
      throw 'No token found.';
    }
  };
}
