import { normalize } from 'normalizr';
import { merge } from 'lodash';

export const CALL_API = Symbol('Call API');

const callApi = (endpoint, schema, authenticated, config) => {
  const API_HOST = process.env.REACT_APP_API_HOST;
  const fullUrl = API_HOST ? API_HOST + endpoint : endpoint;
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
      const noResponseStatusCodes = [202, 204, 205];

      if (noResponseStatusCodes.includes(response.status)) {
        return { json: null, response };
      } else {
        return response.json().then(json => {
          if (!response.ok) {
            return Promise.reject(json);
          }

          return { json, response };
        });
      }
    })
    .then(({ json, response }) => ({
      headers: new Headers(response.headers),
      payload: schema ? normalize(json.data, schema) : json,
    }));
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

  let [requestActionType, successActionType, errorActionType] = types;
  next(
    actionWith({
      isFetching: true,
      type: requestActionType,
    })
  );

  return callApi(endpoint, schema, authenticated, config).then(
    response =>
      next({
        headers: response.headers,
        isFetching: false,
        payload: response.payload,
        type: successActionType,
      }),
    error =>
      next({
        error: error.error || { error: { type: 'UNKNOWN_ERROR' } },
        isFetching: false,
        type: errorActionType,
      })
  );
};
