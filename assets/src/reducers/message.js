import { combineReducers } from 'redux';

import {
  MESSAGE_FAILURE,
  MESSAGE_REQUEST,
  MESSAGE_SUCCESS,
  MESSAGE_ACTIVITY_FAILURE,
  MESSAGE_ACTIVITY_REQUEST,
  MESSAGE_ACTIVITY_SUCCESS,
  MESSAGE_MARK_HAM_FAILURE,
  MESSAGE_MARK_HAM_REQUEST,
  MESSAGE_MARK_HAM_SUCCESS,
  MESSAGE_MARK_SPAM_FAILURE,
  MESSAGE_MARK_SPAM_REQUEST,
  MESSAGE_MARK_SPAM_SUCCESS,
  MESSAGE_SEARCH_RESULTS,
  MESSAGE_SEARCH_QUERY,
  MESSAGES_FAILURE,
  MESSAGES_REQUEST,
  MESSAGES_PAGINATION,
  MESSAGES_SUCCESS,
} from 'constants/actionTypes';

const isFetching = (state = false, action) => {
  switch (action.type) {
    case MESSAGE_ACTIVITY_REQUEST:
    case MESSAGE_REQUEST:
    case MESSAGE_MARK_HAM_REQUEST:
    case MESSAGE_MARK_SPAM_REQUEST:
    case MESSAGES_REQUEST:
      return true;

    case MESSAGE_SUCCESS:
    case MESSAGE_FAILURE:
      return false;

    case MESSAGE_MARK_HAM_SUCCESS:
    case MESSAGE_MARK_HAM_FAILURE:
      return false;

    case MESSAGE_MARK_SPAM_SUCCESS:
    case MESSAGE_MARK_SPAM_FAILURE:
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
    case MESSAGES_PAGINATION:
      return Object.assign({}, state, {
        limit: action.limit,
        offset: action.offset,
        total: action.total,
      });

    case MESSAGE_SUCCESS:
      return Object.assign({}, state, {
        total: state.total + 1,
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
    case MESSAGES_SUCCESS:
      return action.payload.result;

    case MESSAGE_SUCCESS:
      return action.payload.result - state[0] === 1
        ? [action.payload.result, ...state.slice(0, -1)]
        : state;

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
