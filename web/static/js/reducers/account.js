import { indexOf } from 'lodash';

import {
  ACCOUNT_REQUEST,
  ACCOUNT_SUCCESS,
  ACCOUNT_FAILURE,
  ACCOUNT_UPDATE_REQUEST,
  ACCOUNT_UPDATE_SUCCESS,
  ACCOUNT_UPDATE_FAILURE,
  ACCOUNTS_REQUEST,
  ACCOUNTS_SUCCESS,
  ACCOUNTS_FAILURE,
} from '../constants/actionTypes';

export default (
  state = {
    allIds: [],
    isFetching: false,
  },
  action
) => {
  switch (action.type) {
    case ACCOUNT_REQUEST:
    case ACCOUNT_UPDATE_REQUEST:
    case ACCOUNTS_REQUEST:
      return Object.assign({}, state, {
        isFetching: true,
      });
    case ACCOUNT_FAILURE:
    case ACCOUNT_UPDATE_FAILURE:
    case ACCOUNTS_FAILURE:
      return Object.assign({}, state, {
        isFetching: false,
      });
    case ACCOUNT_SUCCESS:
      return Object.assign({}, state, {
        allIds:
          indexOf(state.allIds, action.payload.result) > -1
            ? state.allIds
            : [...state.allIds, action.payload.result],
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
    default:
      return state;
  }
};
