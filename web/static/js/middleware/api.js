import fetch from 'isomorphic-fetch';
import { normalize } from 'normalizr';
import { merge } from 'lodash';

const API_ROOT = 'http://localhost:4000/api/';
export const CALL_API = Symbol('Call API');

const callApi = (endpoint, schema, authenticated, config) => {
  const fullUrl =
    endpoint.indexOf(API_ROOT) === -1 ? API_ROOT + endpoint : endpoint;
  const token = localStorage.getItem('fd_token') || null;

  if (authenticated) {
    if (token) {
      config = merge(
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
        config
      );
    } else {
      throw new Error('No authentication token was found');
    }
  }

  return fetch(fullUrl, config)
    .then(response => {
      if (!response.ok) {
        return Promise.reject(json);
      }

      const noResponseStatusCodes = [204, 205];

      if (noResponseStatusCodes.includes(response.status)) {
        return { json: null, response };
      } else {
        return response.json().then(json => ({ json, response }));
      }
    })
    .then(({ json, response }) => {
      return {
        headers: new Headers(response.headers),
        payload: schema ? normalize(json.data, schema) : json,
      };
    });
};

export default store => next => action => {
  const callAPI = action[CALL_API];

  if (typeof callAPI === 'undefined') {
    return next(action);
  }

  let { authenticated, config, endpoint, schema, types } = callAPI;

  if (typeof endpoint === 'function') {
    endpoint = endpoint(store.getState());
  }

  if (typeof endpoint !== 'string') {
    throw new Error('Please specify a string endpoint URL');
  }

  if (typeof schema === 'undefined') {
    throw new Error('Please specify a schema or null');
  }

  const actionWith = data => {
    const finalAction = Object.assign({}, action, data);
    delete finalAction[CALL_API];
    return finalAction;
  };

  let [requestType, successType, errorType] = types;
  next(
    actionWith({
      isFetching: true,
      type: requestType,
    })
  );

  return callApi(endpoint, schema, authenticated, config).then(
    response =>
      next({
        headers: response.headers,
        isFetching: false,
        payload: response.payload,
        type: successType,
      }),
    error =>
      next({
        error: error.message || 'There was an unknown error',
        isFetching: false,
        type: errorType,
      })
  );
};
