import { combineReducers } from 'redux';
import { indexOf } from 'lodash';

import {
  INTEGRATION_REQUEST,
  INTEGRATION_SUCCESS,
  INTEGRATION_FAILURE,
  INTEGRATIONS_REQUEST,
  INTEGRATIONS_SUCCESS,
  INTEGRATIONS_FAILURE,
} from 'constants/actionTypes';

const allIds = (state = [], action) => {
  switch (action.type) {
    case INTEGRATION_SUCCESS:
      return indexOf(state, action.payload.result) > -1
        ? state
        : [...state, action.payload.result];
    case INTEGRATIONS_SUCCESS:
      return action.payload.result;
    default:
      return state;
  }
};

const isFetching = (state = false, action) => {
  switch (action.type) {
    case INTEGRATION_REQUEST:
    case INTEGRATIONS_REQUEST:
      return true;

    case INTEGRATION_FAILURE:
    case INTEGRATIONS_FAILURE:
      return false;

    case INTEGRATION_SUCCESS:
    case INTEGRATIONS_SUCCESS:
      return false;

    default:
      return state;
  }
};

export default combineReducers({
  allIds,
  isFetching,
});
