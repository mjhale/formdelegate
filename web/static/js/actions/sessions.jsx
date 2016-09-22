import fetch from 'isomorphic-fetch';

export const CURRENT_ACCOUNT = 'CURRENT_ACCOUNT';
export const ACCOUNT_SIGNED_IN = 'ACCOUNT_SIGNED_IN';
export const ACCOUNT_SIGNED_OUT = 'ACCOUNT_SIGNED_OUT';

export function setCurrentAccount(dispatch, account) {
  dispatch({
    type: CURRENT_ACCOUNT,
    currentAccount: account,
  });
}

export function signIn(credentials) {
  return dispatch => {
    return fetch(`/api/sessions/`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        session: {
          ...credentials
        }
      }),
    })
    .then((response) => console.log(response))
    .catch((error) => console.log(error));
  }
}
