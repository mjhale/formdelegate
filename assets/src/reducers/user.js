import { combineReducers } from 'redux';
import { indexOf } from 'lodash';

import {
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

const allIds = (state = [], action) => {
  switch (action.type) {
    case USER_SUCCESS:
      return indexOf(state, action.payload.result) > -1
        ? state
        : [...state, action.payload.result];
    case USERS_SUCCESS:
      return action.payload.result;
    default:
      return state;
  }
};

const error = (state = { error_code: '', errors: [] }, action) => {
  switch (action.type) {
    case USER_FAILURE:
    case USER_CREATE_FAILURE:
    case USER_UPDATE_FAILURE:
    case USERS_FAILURE:
      return action.error;

    default:
      return state;
  }
};

const isFetching = (state = false, action) => {
  switch (action.type) {
    case USER_REQUEST:
    case USER_CREATE_REQUEST:
    case USER_UPDATE_REQUEST:
    case USERS_REQUEST:
      return true;

    case USER_FAILURE:
    case USER_SUCCESS:
      return false;

    case USER_CREATE_FAILURE:
    case USER_CREATE_SUCCESS:
      return false;

    case USER_UPDATE_FAILURE:
    case USER_UPDATE_SUCCESS:
      return false;

    case USERS_FAILURE:
    case USERS_SUCCESS:
      return false;

    default:
      return state;
  }
};

export default combineReducers({
  allIds,
  error,
  isFetching,
});
