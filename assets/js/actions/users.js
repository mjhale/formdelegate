import { CALL_API } from 'middleware/api';
import { getCurrentUserId } from 'utils';
import { userSchema } from 'schema';

import {
  CURRENT_USER_REQUEST,
  CURRENT_USER_SUCCESS,
  CURRENT_USER_FAILURE,
  USER_REQUEST,
  USER_SUCCESS,
  USER_FAILURE,
  USER_CREATE_REQUEST,
  USER_CREATE_SUCCESS,
  USER_CREATE_FAILURE,
  USER_UPDATE_REQUEST,
  USER_UPDATE_SUCCESS,
  USER_UPDATE_FAILURE,
  USERS_REQUEST,
  USERS_SUCCESS,
  USERS_FAILURE,
} from 'constants/actionTypes';

export const adminFetchUser = userId => ({
  [CALL_API]: {
    authenticated: true,
    endpoint: `admin/users/${userId}`,
    schema: userSchema,
    types: [USER_REQUEST, USER_SUCCESS, USER_FAILURE],
  },
});

export const adminFetchUsers = () => ({
  [CALL_API]: {
    authenticated: true,
    endpoint: 'admin/users',
    schema: [userSchema],
    types: [USERS_REQUEST, USERS_SUCCESS, USERS_FAILURE],
  },
});

export const adminUpdateUser = user => {
  return async (dispatch, getState) => {
    const actionResponse = await dispatch({
      [CALL_API]: {
        authenticated: true,
        config: {
          body: JSON.stringify({ user }),
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          method: 'PUT',
        },
        endpoint: `admin/users/${user.id}`,
        schema: userSchema,
        types: [USER_UPDATE_REQUEST, USER_UPDATE_SUCCESS, USER_UPDATE_FAILURE],
      },
    });

    if (actionResponse.error) {
      throw new Error('Promise flow received action error', actionResponse);
    }

    return actionResponse;
  };
};

export function createUser(user) {
  return async (dispatch, getState) => {
    const actionResponse = await dispatch({
      [CALL_API]: {
        authenticated: false,
        config: {
          body: JSON.stringify({ user }),
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          method: 'POST',
        },
        endpoint: 'users',
        schema: userSchema,
        types: [USER_CREATE_REQUEST, USER_CREATE_SUCCESS, USER_CREATE_FAILURE],
      },
    });

    if (actionResponse.error) {
      throw new Error('Promise flow received action error', actionResponse);
    }

    return actionResponse;
  };
}

export const fetchUser = userId => ({
  [CALL_API]: {
    authenticated: true,
    endpoint: `users/${userId}`,
    schema: userSchema,
    types: [CURRENT_USER_REQUEST, CURRENT_USER_SUCCESS, CURRENT_USER_FAILURE],
  },
});

export const fetchCurrentUser = () => {
  const currentUserId = getCurrentUserId(localStorage.getItem('fd_token'));

  if (currentUserId) {
    return fetchUser(currentUserId);
  }
};

export const updateUser = user => {
  return async (dispatch, getState) => {
    const actionResponse = await dispatch({
      [CALL_API]: {
        authenticated: true,
        config: {
          body: JSON.stringify({ user }),
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          method: 'PUT',
        },
        endpoint: `users/${user.id}`,
        schema: userSchema,
        types: [USER_UPDATE_REQUEST, USER_UPDATE_SUCCESS, USER_UPDATE_FAILURE],
      },
    });

    if (actionResponse.error) {
      throw new Error('Promise flow received action error', actionResponse);
    }

    return actionResponse;
  };
};
