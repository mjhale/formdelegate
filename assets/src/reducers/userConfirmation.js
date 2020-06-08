import { combineReducers } from 'redux';

import {
  USER_CONFIRMATION_REQUEST,
  USER_CONFIRMATION_SUCCESS,
  USER_CONFIRMATION_FAILURE,
  USER_CONFIRMATION_RESEND_REQUEST,
  USER_CONFIRMATION_RESEND_SUCCESS,
  USER_CONFIRMATION_RESEND_FAILURE,
} from 'constants/actionTypes';

const errorMessage = (state = '', action) => {
  switch (action.type) {
    case USER_CONFIRMATION_FAILURE:
    case USER_CONFIRMATION_RESEND_FAILURE:
      return action.error;

    case USER_CONFIRMATION_REQUEST:
    case USER_CONFIRMATION_SUCCESS:
    case USER_CONFIRMATION_RESEND_REQUEST:
    case USER_CONFIRMATION_RESEND_SUCCESS:
      return '';

    default:
      return state;
  }
};

const isFetching = (state = false, action) => {
  switch (action.type) {
    case USER_CONFIRMATION_FAILURE:
    case USER_CONFIRMATION_SUCCESS:
    case USER_CONFIRMATION_RESEND_FAILURE:
    case USER_CONFIRMATION_RESEND_SUCCESS:
      return false;

    case USER_CONFIRMATION_REQUEST:
    case USER_CONFIRMATION_RESEND_REQUEST:
      return true;

    default:
      return state;
  }
};

export default combineReducers({
  errorMessage,
  isFetching,
});
