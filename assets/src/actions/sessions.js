import { reset } from 'redux-form';
import { CALL_API } from 'middleware/api';
import { fetchCurrentUser } from 'actions/users';

// action type constants
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
            user: {
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
      await dispatch(reset('loginForm'));
      await localStorage.setItem('fd_token', response.payload.data.token);
      await dispatch(fetchCurrentUser());
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
