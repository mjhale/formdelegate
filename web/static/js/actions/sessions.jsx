import fetch from 'isomorphic-fetch';
import { reset } from 'redux-form';

export const LOGIN_REQUEST = 'LOGIN_REQUEST';
export const LOGIN_SUCCESS = 'LOGIN_SUCCESS';
export const LOGIN_FAILURE = 'LOGIN_FAILURE';
export const LOGOUT_REQUEST = 'LOGOUT_REQUEST';
export const LOGOUT_SUCCESS = 'LOGOUT_SUCCESS';
export const LOGOUT_FAILURE = 'LOGOUT_FAILURE';

function requestLogin(credentials) {
  return {
    type: LOGIN_REQUEST,
    isFetching: true,
    isAuthenticated: false,
  };
}

function receiveLogin(account) {
  return {
    type: LOGIN_SUCCESS,
    isFetching: false,
    isAuthenticated: true,
    token: account.jwt,
  };
}

function loginError(message) {
  return {
    type: LOGIN_FAILURE,
    isFetching: false,
    isAuthenticated: false,
    errorMessage: message,
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
        dispatch(reset('loginForm'));
        localStorage.setItem('fd_token', account.jwt);
        dispatch(receiveLogin(account));
      } else {
        dispatch(loginError(account.message));
        return Promise.reject(account);
      }
    })

    .catch((error) => console.log(error));
  };
}

function requestLogout() {
  return {
    type: LOGOUT_REQUEST,
    isFetching: true,
    isAuthenticated: true,
  };
}

function receiveLogout() {
  return {
    type: LOGOUT_SUCCESS,
    isFetching: false,
    isAuthenticated: false,
  };
}

export function logoutAccount() {
  return (dispatch) => {
    dispatch(requestLogout());
    localStorage.removeItem('fd_token');
    dispatch(receiveLogout());
  };
}
