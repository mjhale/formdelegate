import { combineReducers } from 'redux';

import {
  USER_RESET_PASSWORD_REQUEST,
  USER_RESET_PASSWORD_SUCCESS,
  USER_RESET_PASSWORD_FAILURE,
  USER_RESET_PASSWORD_TOKEN_VERIFY_REQUEST,
  USER_RESET_PASSWORD_TOKEN_VERIFY_SUCCESS,
  USER_RESET_PASSWORD_TOKEN_VERIFY_FAILURE,
} from 'constants/actionTypes';

const errorMessage = (state = '', action) => {
  switch (action.type) {
    case USER_RESET_PASSWORD_FAILURE:
    case USER_RESET_PASSWORD_TOKEN_VERIFY_FAILURE:
      return action.error;

    case USER_RESET_PASSWORD_REQUEST:
    case USER_RESET_PASSWORD_SUCCESS:
    case USER_RESET_PASSWORD_TOKEN_VERIFY_REQUEST:
    case USER_RESET_PASSWORD_TOKEN_VERIFY_SUCCESS:
      return '';

    default:
      return state;
  }
};

const isFetching = (state = false, action) => {
  switch (action.type) {
    case USER_RESET_PASSWORD_FAILURE:
    case USER_RESET_PASSWORD_SUCCESS:
    case USER_RESET_PASSWORD_TOKEN_VERIFY_FAILURE:
    case USER_RESET_PASSWORD_TOKEN_VERIFY_SUCCESS:
      return false;

    case USER_RESET_PASSWORD_REQUEST:
    case USER_RESET_PASSWORD_TOKEN_VERIFY_REQUEST:
      return true;

    default:
      return state;
  }
};

export default combineReducers({
  errorMessage,
  isFetching,
});
