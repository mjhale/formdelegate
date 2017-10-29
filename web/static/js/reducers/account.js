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
} from '../constants/actionTypes';

export default (
  state = {
    allIds: [],
    currentAccountId: null,
    errorMessage: '',
    isFetching: false,
  },
  action
) => {
  switch (action.type) {
    case ACCOUNT_REQUEST:
    case ACCOUNT_CREATE_REQUEST:
    case ACCOUNT_UPDATE_REQUEST:
    case ACCOUNTS_REQUEST:
    case CURRENT_ACCOUNT_REQUEST:
      return Object.assign({}, state, {
        isFetching: true,
      });
    case ACCOUNT_FAILURE:
    case ACCOUNT_UPDATE_FAILURE:
    case ACCOUNTS_FAILURE:
    case CURRENT_ACCOUNT_FAILURE:
      return Object.assign({}, state, {
        isFetching: false,
      });
    case ACCOUNT_SUCCESS:
      return Object.assign({}, state, {
        allIds:
          indexOf(state.allIds, action.payload.result) > -1
            ? state.allIds
            : [...state.allIds, action.payload.result],
        currentAccountId: state.currentAccountId || action.payload.result,
        isFetching: false,
      });
    case ACCOUNT_CREATE_SUCCESS:
      return Object.assign({}, state, {
        isFetching: false,
      });
    case ACCOUNT_UPDATE_SUCCESS:
      return Object.assign({}, state, {
        isFetching: false,
      });
    case ACCOUNTS_SUCCESS:
      return Object.assign({}, state, {
        allIds: action.payload.result,
        isFetching: false,
      });
    case CURRENT_ACCOUNT_SUCCESS:
      return Object.assign({}, state, {
        currentAccountId: action.payload.result,
        isFetching: false,
      });
    case ACCOUNT_CREATE_FAILURE:
      return Object.assign({}, state, {
        errorMessage: action.error,
        isFetching: false,
      });
    default:
      return state;
  }
};
