import fetch from 'isomorphic-fetch';

export const REQUEST_ACCOUNTS = 'REQUEST_ACCOUNTS';
export const RECEIVE_ACCOUNTS = 'RECEIVE_ACCOUNTS';

function requestAccounts() {
  return {
    type: REQUEST_ACCOUNTS
  };
}

function receiveAccounts(json) {
  return {
    type: RECEIVE_ACCOUNTS,
    items: json.data,
    receivedAt: Date.now()
  };
}

function fetchAccounts() {
	return dispatch => {
		dispatch(requestAccounts());
		return fetch('/api/accounts')
			.then((response) => response.json())
			.then(json => dispatch(receiveAccounts(json)));
	};
}

function shouldFetchAccounts(state) {
  const accounts = state.accounts;
  if (accounts.items !== "undefined" && accounts.items.length === 0) {
    return true;
  } else if (accounts.isFetching) {
    return false;
  } else {
    console.log('@TODO: shouldInvalidateAccounts');
  }
}

export function fetchAccountsIfNeeded() {
	return (dispatch, getState) => {
    if (shouldFetchAccounts(getState())) {
      return dispatch(fetchAccounts());
    }
  }
}
