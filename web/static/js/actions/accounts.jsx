import fetch from 'isomorphic-fetch';

export const REQUEST_ACCOUNTS = 'REQUEST_ACCOUNTS';
export const RECEIVE_ACCOUNTS = 'RECEIVE_ACCOUNTS';

function requestAccounts() {
  return {
    type: REQUEST_ACCOUNTS,
  };
}

function receiveAccounts(json) {
  return {
    type: RECEIVE_ACCOUNTS,
    items: json.data,
    receivedAt: Date.now(),
  };
}

function fetchAccounts() {
  return (dispatch) => {
    dispatch(requestAccounts());

    let token = localStorage.getItem('fd_token') || null;

    if (token) {
      return fetch('/api/admin/accounts', {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      })
      .then((response) => response.json())
      .then((json) => dispatch(receiveAccounts(json)));
    } else {
      throw 'No token found.';
    }
  };
}

function shouldFetchAccounts(state) {
  const accounts = state.accounts;
  if (accounts.items !== "undefined" && accounts.items.length === 0) {
    return true;
  } else if (accounts.isFetching) {
    return false;
  } else {
    return true;
  }
}

export function fetchAccountsIfNeeded() {
  return (dispatch, getState) => {
    if (shouldFetchAccounts(getState())) {
      return dispatch(fetchAccounts());
    }
  };
}
