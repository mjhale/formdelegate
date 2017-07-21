import { CALL_API } from '../middleware/api';
import { accountSchema } from '../schema';

import {
  ACCOUNT_REQUEST,
  ACCOUNT_SUCCESS,
  ACCOUNT_FAILURE,
  ACCOUNT_CREATE_REQUEST,
  ACCOUNT_CREATE_SUCCESS,
  ACCOUNT_CREATE_FAILURE,
  ACCOUNT_UPDATE_REQUEST,
  ACCOUNT_UPDATE_SUCCESS,
  ACCOUNT_UPDATE_FAILURE,
  ACCOUNTS_REQUEST,
  ACCOUNTS_SUCCESS,
  ACCOUNTS_FAILURE,
  CURRENT_ACCOUNT_REQUEST,
  CURRENT_ACCOUNT_SUCCESS,
  CURRENT_ACCOUNT_FAILURE,
} from '../constants/actionTypes';

export const adminFetchAccount = accountId => ({
  [CALL_API]: {
    authenticated: true,
    endpoint: `admin/accounts/${accountId}`,
    schema: accountSchema,
    types: [ACCOUNT_REQUEST, ACCOUNT_SUCCESS, ACCOUNT_FAILURE],
  },
});

export const adminFetchAccounts = () => ({
  [CALL_API]: {
    authenticated: true,
    endpoint: 'admin/accounts',
    schema: [accountSchema],
    types: [ACCOUNTS_REQUEST, ACCOUNTS_SUCCESS, ACCOUNTS_FAILURE],
  },
});

export const adminUpdateAccount = account => {
  return async (dispatch, getState) => {
    const actionResponse = await dispatch({
      [CALL_API]: {
        authenticated: true,
        config: {
          body: JSON.stringify({ account }),
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          method: 'PUT',
        },
        endpoint: `admin/accounts/${account.id}`,
        schema: accountSchema,
        types: [
          ACCOUNT_UPDATE_REQUEST,
          ACCOUNT_UPDATE_SUCCESS,
          ACCOUNT_UPDATE_FAILURE,
        ],
      },
    });

    if (actionResponse.error) {
      throw new Error('Promise flow received action error', actionResponse);
    }

    return actionResponse;
  };
};

export function createAccount(account) {
  return async (dispatch, getState) => {
    const actionResponse = await dispatch({
      [CALL_API]: {
        authenticated: false,
        config: {
          body: JSON.stringify({ account }),
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          method: 'POST',
        },
        endpoint: 'accounts',
        schema: accountSchema,
        types: [
          ACCOUNT_CREATE_REQUEST,
          ACCOUNT_CREATE_SUCCESS,
          ACCOUNT_CREATE_FAILURE,
        ],
      },
    });

    if (actionResponse.error) {
      throw new Error('Promise flow received action error', actionResponse);
    }

    return actionResponse;
  };
}

export const fetchAccount = accountId => ({
  [CALL_API]: {
    authenticated: true,
    endpoint: `accounts/${accountId}`,
    schema: accountSchema,
    types: [
      CURRENT_ACCOUNT_REQUEST,
      CURRENT_ACCOUNT_SUCCESS,
      CURRENT_ACCOUNT_FAILURE,
    ],
  },
});

export const updateAccount = account => {
  return async (dispatch, getState) => {
    const actionResponse = await dispatch({
      [CALL_API]: {
        authenticated: true,
        config: {
          body: JSON.stringify({ account }),
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          method: 'PUT',
        },
        endpoint: `accounts/${account.id}`,
        schema: accountSchema,
        types: [
          ACCOUNT_UPDATE_REQUEST,
          ACCOUNT_UPDATE_SUCCESS,
          ACCOUNT_UPDATE_FAILURE,
        ],
      },
    });

    if (actionResponse.error) {
      throw new Error('Promise flow received action error', actionResponse);
    }

    return actionResponse;
  };
};
