/* @TODO: Add thunks support */

import fetch from 'isomorphic-fetch';

const BASE_URL = 'http://localhost:4000/api/';
export const CALL_API = Symbol('Call API');

function callApi(endpoint, authenticated) {
  let token = localStorage.getItem('fd_token') || null;
  let config = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  };

  if (authenticated) {
    if (token) {
      Object.assign(config, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });
    } else {
      throw 'No token found.';
    }
  }

  return fetch(BASE_URL + endpoint, config)

  .then((response) => {
    response.json().then((data) => ({ data, response }));
  })

  .then(({data, response}) => {
    console.log(data);
    if (!response.ok) {
      return Promise.reject(data);
    }

    return data;
  })

  .catch((error) => console.log(error));
}

export default (store) => (next) => (action) => {
  const callAPI = action[CALL_API];

  if (typeof callAPI === 'undefined') {
    return next(action);
  }

  let { endpoint, types, authenticated } = callAPI;

  const [requestType, successType, errorType] = types;

  return callApi(endpoint, authenticated).then(
    (response) =>
      next({
        response,
        authenticated,
        type: successType,
      }),
    (error) =>
      next({
        error: error.message || 'There was an error.',
        type: errorType,
      })
  );
};
