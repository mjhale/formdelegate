import fetch from 'isomorphic-fetch';

export const REQUEST_MESSAGE = 'REQUEST_MESSAGE';
export const RECEIVE_MESSAGE = 'RECEIVE_MESSAGE';

function requestMessage() {
  return {
    type: REQUEST_MESSAGE,
  };
}

function receiveMessage(json) {
  return {
    type: RECEIVE_MESSAGE,
    response: json.data,
    receivedAt: Date.now(),
  };
}

export function fetchMessage(messageId) {
  return (dispatch) => {
    dispatch(requestMessage());

    let token = localStorage.getItem('fd_token') || null;

    if (token) {
      return fetch(`/api/messages/${messageId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      })
      .then((response) => {
        return response.json();
      })
      .then((json) => {
        return dispatch(receiveMessage(json));
      });
    } else {
      throw 'No token found.';
    }
  };
}
