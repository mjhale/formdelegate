import { accountSchema } from 'schema';
import { CALL_API } from 'middleware/api';
import { normalize } from 'normalizr';
import { reset } from 'redux-form';

// action type constants
import { ACCOUNT_SUCCESS } from 'constants/actionTypes';
import {
  LOGIN_REQUEST,
  LOGIN_SUCCESS,
  LOGIN_FAILURE,
  LOGOUT_REQUEST,
  LOGOUT_SUCCESS,
  LOGOUT_FAILURE,
} from 'constants/actionTypes';

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

    return dispatch(loginSuccess(actionResponse));
  };
}

const loginSuccess = response => {
  return async dispatch => {
    try {
      await dispatch(reset('loginForm'));
      await localStorage.setItem('fd_token', response.payload.jwt);
      await dispatch({
        headers: response.headers,
        isFetching: false,
        payload: normalize(response.payload.account.data, accountSchema),
        type: ACCOUNT_SUCCESS,
      });
    } catch (error) {
      throw new Error('Promise flow received error', error);
    }

    return Promise.resolve(response);
  };
};

export function logoutAccount() {
  return dispatch => {
    try {
      dispatch({
        type: LOGOUT_REQUEST,
        isFetching: true,
        isAuthenticated: true,
      });
      localStorage.removeItem('fd_token');
      dispatch({
        type: LOGOUT_SUCCESS,
        isFetching: false,
        isAuthenticated: false,
      });
    } catch (error) {
      throw new Error('Promise flow received error', error);
    }
  };
}
