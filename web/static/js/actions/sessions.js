import { CALL_API } from '../middleware/api';
import { reset } from 'redux-form';

import {
  LOGIN_REQUEST,
  LOGIN_SUCCESS,
  LOGIN_FAILURE,
} from '../constants/actionTypes';
import {
  LOGOUT_REQUEST,
  LOGOUT_SUCCESS,
  LOGOUT_FAILURE,
} from '../constants/actionTypes';

export function loginAccount(credentials) {
  return async dispatch => {
    const actionResponse = await dispatch({
      [CALL_API]: {
        config: {
          body: JSON.stringify({
            session: {
              ...credentials,
            },
          }),
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          method: 'POST',
        },
        endpoint: 'sessions',
        schema: null,
        types: [LOGIN_REQUEST, LOGIN_SUCCESS, LOGIN_FAILURE],
      },
    });

    if (actionResponse.error) {
      throw new Error('Promise flow received action error', actionResponse);
    }

    return dispatch(loginSuccess(actionResponse.payload));
  };
}

const loginSuccess = account => {
  return async dispatch => {
    try {
      await localStorage.setItem('fd_token', account.jwt);
      await dispatch(reset('loginForm'));
    } catch (error) {
      throw new Error('Promise flow received error', error);
    }

    return Promise.resolve(account);
  };
};

export function logoutAccount() {
  return dispatch => {
    dispatch(logoutRequest());
    localStorage.removeItem('fd_token');
    dispatch(logoutReceived());
  };
}

function logoutReceived() {
  return {
    type: LOGOUT_SUCCESS,
    isFetching: false,
    isAuthenticated: false,
  };
}

function logoutRequest() {
  return {
    type: LOGOUT_REQUEST,
    isFetching: true,
    isAuthenticated: true,
  };
}
