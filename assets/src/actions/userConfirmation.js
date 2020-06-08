import { CALL_API } from 'middleware/api';

import {
  USER_CONFIRMATION_REQUEST,
  USER_CONFIRMATION_SUCCESS,
  USER_CONFIRMATION_FAILURE,
  USER_CONFIRMATION_RESEND_REQUEST,
  USER_CONFIRMATION_RESEND_SUCCESS,
  USER_CONFIRMATION_RESEND_FAILURE,
} from 'constants/actionTypes';

export const verifyUserConfirmationToken = token => {
  return async (dispatch, getState) => {
    const actionResponse = await dispatch({
      [CALL_API]: {
        config: {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          method: 'GET',
        },
        endpoint: `/v1/users/confirm?token=${token}`,
        schema: null,
        types: [
          USER_CONFIRMATION_REQUEST,
          USER_CONFIRMATION_SUCCESS,
          USER_CONFIRMATION_FAILURE,
        ],
      },
    });

    return actionResponse;
  };
};

export const resendUserConfirmation = user => {
  return async (dispatch, getState) => {
    const actionResponse = await dispatch({
      [CALL_API]: {
        config: {
          body: JSON.stringify({
            user: {
              email: user.email,
            },
          }),
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          method: 'POST',
        },
        endpoint: `/v1/users/confirm`,
        schema: null,
        types: [
          USER_CONFIRMATION_RESEND_REQUEST,
          USER_CONFIRMATION_RESEND_SUCCESS,
          USER_CONFIRMATION_RESEND_FAILURE,
        ],
      },
    });

    return actionResponse;
  };
};
