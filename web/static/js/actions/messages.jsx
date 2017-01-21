import fetch from 'isomorphic-fetch';

export const REQUEST_MESSAGES = 'REQUEST_MESSAGES';
export const RECEIVE_MESSAGES = 'RECEIVE_MESSAGES';
export const REQUEST_SEARCH_MESSAGES = 'REQUEST_SEARCH_MESSAGES';
export const RECEIVE_SEARCH_MESSAGES = 'RECEIVE_SEARCH_MESSAGES';

function requestMessages(requestedPage) {
  return {
    type: REQUEST_MESSAGES,
    requestedPage: requestedPage,
  };
}

function receiveMessages(json, limit, offset, total) {
  return {
    type: RECEIVE_MESSAGES,
    response: json.data,
    receivedAt: Date.now(),
    limit,
    offset,
    total,
  };
}

function requestSearchMessages(query, requestedPage) {
  return {
    type: REQUEST_SEARCH_MESSAGES,
    requestedPage: requestedPage,
    query: query || '',
  };
}

function receiveSearchMessages(json, limit, offset, total) {
  return {
    type: RECEIVE_SEARCH_MESSAGES,
    response: json.data,
    receivedAt: Date.now(),
    limit,
    offset,
    total,
  };
}

export function fetchSearchMessages(query, requestedPage) {
  if (!requestedPage) requestedPage = 1;
  if (!query) query = '';

  return (dispatch) => {
    let token = localStorage.getItem('fd_token') || null;

    if (token) {
      return fetch(`/api/search/messages?query=${query}&page=${requestedPage}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      })
      .then((response) => {
        dispatch(requestSearchMessages(query, requestedPage));

        response.json().then((json) => {
          if (!response.ok) return Promise.reject(json);

          const limit = Number(response.headers.get('per-page'));
          const offset = (requestedPage-1) * (limit+1);
          const total = Number(response.headers.get('total'));
    
          return dispatch(receiveSearchMessages(json, limit, offset, total));
        });
      });
    } else {
      throw 'No token found.';
    }
  };
}

export function fetchMessages(requestedPage) {
  if (!requestedPage) requestedPage = 1;

  return (dispatch) => {
    dispatch(requestMessages());

    let token = localStorage.getItem('fd_token') || null;

    if (token) {
      return fetch(`/api/messages?page=${requestedPage}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      })
      .then((response) =>
        response.json().then((json) => {
          if (!response.ok) return Promise.reject(json);

          const total = Number(response.headers.get('total'));
          if (!total) return null;

          const limit = Number(response.headers.get('per-page'));
          const offset = (requestedPage-1) * (limit+1);

          return dispatch(receiveMessages(json, limit, offset, total));
        })
      );
    } else {
      throw 'No token found.';
    }
  };
}
