import fetch from 'isomorphic-fetch';

export const LOGIN_REQUEST = 'LOGIN_REQUEST';
export const LOGIN_SUCCESS = 'LOGIN_SUCCESS';
export const LOGIN_FAILURE = 'LOGIN_FAILURE';

function requestLogin(credentials) {
  return {
    type: LOGIN_REQUEST,
    isFetching: true,
    isAuthenticated: false,
    credentials,
  };
}

function receiveLogin(account) {
  return {
    type: LOGIN_SUCCESS,
    isFetching: false,
    isAuthenticated: true,
    jwt: account.jwt,
  };
}

function loginError(message) {
  return {
    type: LOGIN_FAILURE,
    isFetching: false,
    isAuthenticated: false,
    message,
  };
}

export function loginAccount(credentials) {
  return (dispatch) => {
    dispatch(requestLogin(credentials));

    return fetch('/api/sessions/', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        session: {
          ...credentials,
        },
      }),
    })

    .then((response) =>
      response.json().then((account) => ({ account, response }))
    )

    .then(({account, response}) => {
      if (response.ok) {
        localStorage.setItem('fd_jwt', account.jwt);
        dispatch(receiveLogin(account));
      } else {
        dispatch(loginError(account.message));
        return Promise.reject(account);
      }
    })

    .catch((error) => console.log(error));
  };
}
