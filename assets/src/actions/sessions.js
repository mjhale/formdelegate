import { CALL_API } from 'middleware/api';

import { fetchUser } from 'actions/users';
import { getCurrentUserId } from 'utils';

import {
  LOGIN_REQUEST,
  LOGIN_SUCCESS,
  LOGIN_FAILURE,
  LOGOUT_REQUEST,
  LOGOUT_SUCCESS,
} from 'constants/actionTypes';

export function loginUser(credentials) {
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
        endpoint: '/v1/sessions',
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
      await localStorage.setItem('fd_token', response.payload.data.token);
      await dispatch(fetchUser(getCurrentUserId()));
    } catch (error) {
      throw new Error('Promise flow received error', error);
    }

    return Promise.resolve(response);
  };
};

export function logoutUser() {
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

    return Promise.resolve();
  };
}
