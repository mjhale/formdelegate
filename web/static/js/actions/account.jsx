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
  return (dispatch) => {
    dispatch(updateAccountOptimistic(account));
    return fetch(`/api/accounts/${account.id}`, {
      method: 'put',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        account,
      }),
    })
    .catch((error) => console.log(error));
  };
}

export function fetchAccount(accountId) {
  return (dispatch) => {
    dispatch(requestAccount());
    return fetch(`/api/accounts/${accountId}`)
      .then((response) => response.json())
      .then((json) => dispatch(receiveAccount(json)));
  };
}
