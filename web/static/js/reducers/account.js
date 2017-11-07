import { combineReducers } from 'redux';
import { indexOf } from 'lodash';

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
} from 'constants/actionTypes';

const allIds = (state = [], action) => {
  switch (action.type) {
    case ACCOUNT_SUCCESS:
      return indexOf(state, action.payload.result) > -1
        ? state
        : [...state, action.payload.result];
    case ACCOUNTS_SUCCESS:
      return action.payload.result;
    default:
      return state;
  }
};

const currentAccountId = (state = null, action) => {
  switch (action.type) {
    case ACCOUNT_SUCCESS:
      return state || action.payload.result;
    case CURRENT_ACCOUNT_SUCCESS:
      return action.payload.result;
    default:
      return state;
  }
};

const errorMessage = (state = '', action) => {
  switch (action.type) {
    case ACCOUNT_FAILURE:
    case ACCOUNT_CREATE_FAILURE:
    case ACCOUNT_UPDATE_FAILURE:
    case ACCOUNTS_FAILURE:
    case CURRENT_ACCOUNT_FAILURE:
      return action.error;

    default:
      return state;
  }
};

const isFetching = (state = false, action) => {
  switch (action.type) {
    case ACCOUNT_REQUEST:
    case ACCOUNT_CREATE_REQUEST:
    case ACCOUNT_UPDATE_REQUEST:
    case ACCOUNTS_REQUEST:
    case CURRENT_ACCOUNT_REQUEST:
      return true;

    case ACCOUNT_FAILURE:
    case ACCOUNT_SUCCESS:
      return false;

    case ACCOUNT_CREATE_FAILURE:
    case ACCOUNT_CREATE_SUCCESS:
      return false;

    case ACCOUNT_UPDATE_FAILURE:
    case ACCOUNT_UPDATE_SUCCESS:
      return false;

    case ACCOUNTS_FAILURE:
    case ACCOUNTS_SUCCESS:
      return false;

    case CURRENT_ACCOUNT_FAILURE:
    case CURRENT_ACCOUNT_SUCCESS:
      return false;

    default:
      return state;
  }
};

export default combineReducers({
  allIds,
  currentAccountId,
  errorMessage,
  isFetching,
});
