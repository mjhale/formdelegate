import { combineReducers } from 'redux';

import {
  MESSAGE_SEARCH_RESULTS,
  MESSAGE_SEARCH_QUERY,
  MESSAGES_FAILURE,
  MESSAGES_REQUEST,
  MESSAGES_RESULTS,
  MESSAGES_SUCCESS,
  MESSAGE_ACTIVITY_FAILURE,
  MESSAGE_ACTIVITY_REQUEST,
  MESSAGE_ACTIVITY_SUCCESS,
  MESSAGE_FAILURE,
  MESSAGE_REQUEST,
  MESSAGE_SUCCESS,
} from 'constants/actionTypes';
import { REQUEST_MESSAGE, RECEIVE_MESSAGE } from 'constants/actionTypes';

const isFetching = (state = false, action) => {
  switch (action.type) {
    case MESSAGE_ACTIVITY_REQUEST:
    case MESSAGE_REQUEST:
    case MESSAGES_REQUEST:
      return true;

    case MESSAGE_SUCCESS:
    case MESSAGE_FAILURE:
      return false;

    case MESSAGES_SUCCESS:
    case MESSAGES_FAILURE:
      return false;

    case MESSAGE_ACTIVITY_SUCCESS:
    case MESSAGE_ACTIVITY_FAILURE:
      return false;

    default:
      return state;
  }
};

const messageActivityIds = (state = [], action) => {
  switch (action.type) {
    case MESSAGE_ACTIVITY_SUCCESS:
      return action.payload.result;
    default:
      return state;
  }
};

const pagination = (
  state = {
    limit: 0,
    offset: 0,
    total: 0,
  },
  action
) => {
  switch (action.type) {
    case MESSAGE_SEARCH_RESULTS:
    case MESSAGES_RESULTS:
      return Object.assign({}, state, {
        limit: action.limit,
        offset: action.offset,
        total: action.total,
      });

    default:
      return state;
  }
};

const search = (
  state = {
    query: '',
  },
  action
) => {
  switch (action.type) {
    case MESSAGE_SEARCH_QUERY:
      return Object.assign({}, state, {
        query: action.query,
      });
    default:
      return state;
  }
};

const visibleIds = (state = [], action) => {
  switch (action.type) {
    case MESSAGE_SEARCH_RESULTS:
    case MESSAGES_RESULTS:
      return action.payload.result;

    default:
      return state;
  }
};

export default combineReducers({
  isFetching,
  messageActivityIds,
  pagination,
  search,
  visibleIds,
});
