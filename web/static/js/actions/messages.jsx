import fetch from 'isomorphic-fetch';

export const REQUEST_MESSAGES = 'REQUEST_MESSAGES';
export const RECEIVE_MESSAGES = 'RECEIVE_MESSAGES';
export const SEARCH_MESSAGES = 'SEARCH_MESSAGES';

function requestMessages() {
  return {
    type: REQUEST_MESSAGES,
  };
}

function receiveMessages(json) {
  return {
    type: RECEIVE_MESSAGES,
    response: json.data,
    receivedAt: Date.now(),
  };
}

export function searchMessages(searchText) {
  return {
    type: SEARCH_MESSAGES,
    text: searchText || '',
  };
}

export function fetchMessages() {
  return (dispatch) => {
    dispatch(requestMessages());

    let token = localStorage.getItem('fd_token') || null;

    if (token) {
      return fetch('/api/messages', {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      })
      .then((response) => {
        return response.json();
      })
      .then((json) => {
        return dispatch(receiveMessages(json));
      });
    } else {
      throw 'No token found.';
    }
  };
}
