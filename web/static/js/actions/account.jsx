import fetch from 'isomorphic-fetch';

export const REQUEST_ACCOUNT = 'REQUEST_ACCOUNT';
export const RECEIVE_ACCOUNT = 'RECEIVE_ACCOUNT';
export const UPDATE_ACCOUNT = 'UPDATE_ACCOUNT';

function requestAccount() {
  return {
    type: REQUEST_ACCOUNT,
  };
}

function receiveAccount(json) {
  return {
    type: RECEIVE_ACCOUNT,
    account: json.data,
    receivedAt: Date.now(),
  };
}

function updateAccountOptimistic(account) {
  return {
    type: UPDATE_ACCOUNT,
    account,
  };
}

export function updateAccount(account) {
  return (dispatch, getState) => {
    dispatch(updateAccountOptimistic(account));

    let token = localStorage.getItem('fd_token') || null;

    if (token) {
      return fetch(`/api/accounts/${account.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          account
        }),
      })
      .catch((error) => console.log(error));
    } else {
      throw 'No token found.';
    }
  };
}

export function fetchAccount(accountId) {
  return (dispatch) => {
    dispatch(requestAccount());

    let token = localStorage.getItem('fd_token') || null;

    if (token) {
      return fetch(`/api/accounts/${accountId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      })
      .then((response) => response.json())
      .then((json) => dispatch(receiveAccount(json)));
    } else {
      throw 'No token found.';
    }
  };
}
