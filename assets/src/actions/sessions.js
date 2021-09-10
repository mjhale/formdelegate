import { CALL_API } from 'middleware/api';

import { fetchUser } from 'actions/users';
import { getCurrentUserId } from 'utils';

import {
  LOGIN_REQUEST,
  LOGIN_SUCCESS,
  LOGIN_FAILURE,
  LOGOUT_REQUEST,
  LOGOUT_SUCCESS,
  LOGOUT_FAILURE,
} from 'constants/actionTypes';

export function loginUser(credentials, directApiCall = false) {
  return async (dispatch) => {
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
        directApiCall,
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

const loginSuccess = (response) => {
  return async (dispatch) => {
    try {
      await dispatch(fetchUser(getCurrentUserId()));
    } catch (error) {
      throw new Error('Promise flow received error', error);
    }

    return Promise.resolve(response);
  };
};

export function logoutUser() {
  return async (dispatch) => {
    const actionResponse = await dispatch({
      [CALL_API]: {
        config: {
          method: 'DELETE',
        },
        directApiCall: false,
        endpoint: `/v1/sessions`,
        schema: null,
        types: [LOGOUT_REQUEST, LOGOUT_SUCCESS, LOGOUT_FAILURE],
      },
    });

    if (actionResponse.error) {
      throw new Error('Promise flow received action error', actionResponse);
    }

    return actionResponse;
  };
}
