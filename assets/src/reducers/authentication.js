import { combineReducers } from 'redux';
import { isTokenCurrent } from 'utils';

import {
  CURRENT_USER_REQUEST,
  CURRENT_USER_SUCCESS,
  CURRENT_USER_FAILURE,
  LOGIN_REQUEST,
  LOGIN_SUCCESS,
  LOGIN_FAILURE,
  LOGOUT_REQUEST,
  LOGOUT_SUCCESS,
  LOGOUT_FAILURE,
} from 'constants/actionTypes';

const errorMessage = (state = '', action) => {
  switch (action.type) {
    case LOGIN_FAILURE:
    case LOGOUT_FAILURE:
      return action.error;

    case LOGIN_REQUEST:
    case LOGIN_SUCCESS:
      return '';

    case LOGOUT_REQUEST:
    case LOGOUT_SUCCESS:
      return '';

    default:
      return state;
  }
};

const isAuthenticated = (
  state = isTokenCurrent(localStorage.getItem('fd_token')),
  action
) => {
  switch (action.type) {
    case LOGIN_SUCCESS:
      return true;
    case LOGOUT_SUCCESS:
      return false;
    default:
      return state;
  }
};

const isFetching = (state = false, action) => {
  switch (action.type) {
    case CURRENT_USER_REQUEST:
    case LOGIN_REQUEST:
    case LOGOUT_REQUEST:
      return true;

    case CURRENT_USER_SUCCESS:
    case CURRENT_USER_FAILURE:
      return false;

    case LOGIN_FAILURE:
    case LOGIN_SUCCESS:
      return false;

    case LOGOUT_FAILURE:
    case LOGOUT_SUCCESS:
      return false;

    default:
      return state;
  }
};

export default combineReducers({
  errorMessage,
  isAuthenticated,
  isFetching,
});
