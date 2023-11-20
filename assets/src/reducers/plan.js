import { combineReducers } from 'redux';

import {
  PLANS_REQUEST,
  PLANS_SUCCESS,
  PLANS_FAILURE,
} from 'constants/actionTypes';

const allIds = (state = [], action) => {
  switch (action.type) {
    case PLANS_SUCCESS:
      return action.payload.result;
    default:
      return state;
  }
};

const error = (state = { error_code: '', errors: [] }, action) => {
  switch (action.type) {
    case PLANS_FAILURE:
      return action.error;

    default:
      return state;
  }
};

const isFetching = (state = false, action) => {
  switch (action.type) {
    case PLANS_REQUEST:
      return true;

    case PLANS_FAILURE:
    case PLANS_SUCCESS:
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
