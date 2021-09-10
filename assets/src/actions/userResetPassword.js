import { CALL_API } from 'middleware/api';

import {
  USER_RESET_PASSWORD_REQUEST,
  USER_RESET_PASSWORD_SUCCESS,
  USER_RESET_PASSWORD_FAILURE,
} from 'constants/actionTypes';

export const userResetPasswordRequest = (email) => {
  return async (dispatch, getState) => {
    const actionResponse = await dispatch({
      [CALL_API]: {
        config: {
          body: JSON.stringify({
            user: {
              email,
            },
          }),
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          method: 'POST',
        },
        endpoint: `/v1/users/reset-password`,
        schema: null,
        types: [
          USER_RESET_PASSWORD_REQUEST,
          USER_RESET_PASSWORD_SUCCESS,
          USER_RESET_PASSWORD_FAILURE,
        ],
      },
    });

    return actionResponse;
  };
};

export const userResetPasswordTokenVerify = ({ password, token }) => {
  return async (dispatch) => {
    const actionResponse = await dispatch({
      [CALL_API]: {
        config: {
          body: JSON.stringify({
            user: {
              password: password,
              reset_password_token: token,
            },
          }),
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          method: 'PUT',
        },
        endpoint: `/v1/users/reset-password`,
        schema: null,
        types: [
          USER_RESET_PASSWORD_REQUEST,
          USER_RESET_PASSWORD_SUCCESS,
          USER_RESET_PASSWORD_FAILURE,
        ],
      },
    });

    return actionResponse;
  };
};
