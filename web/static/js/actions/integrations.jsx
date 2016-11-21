import fetch from 'isomorphic-fetch';

export const REQUEST_INTEGRATIONS = 'REQUEST_INTEGRATIONS';
export const RECEIVE_INTEGRATIONS = 'RECEIVE_INTEGRATIONS';

function requestIntegrations() {
  return {
    type: REQUEST_INTEGRATIONS,
  };
}

function receiveIntegrations(json) {
  return {
    type: RECEIVE_INTEGRATIONS,
    integrations: json.data,
    receivedAt: Date.now(),
  };
}

export function fetchIntegrations() {
  return (dispatch) => {
    dispatch(requestIntegrations());

    let token = localStorage.getItem('fd_token') || null;

    if (token) {
      return fetch('/api/integrations', {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      })
      .then((response) => {
        return response.json();
      })
      .then((json) => {
        return dispatch(receiveIntegrations(json));
      });
    } else {
      throw 'No token found.';
    }
  };
}
