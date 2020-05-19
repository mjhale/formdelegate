import { combineReducers } from 'redux';

import {
  SUBMISSION_FAILURE,
  SUBMISSION_REQUEST,
  SUBMISSION_SUCCESS,
  SUBMISSION_ACTIVITY_FAILURE,
  SUBMISSION_ACTIVITY_REQUEST,
  SUBMISSION_ACTIVITY_SUCCESS,
  SUBMISSION_MARK_HAM_FAILURE,
  SUBMISSION_MARK_HAM_REQUEST,
  SUBMISSION_MARK_HAM_SUCCESS,
  SUBMISSION_MARK_SPAM_FAILURE,
  SUBMISSION_MARK_SPAM_REQUEST,
  SUBMISSION_MARK_SPAM_SUCCESS,
  SUBMISSION_SEARCH_RESULTS,
  SUBMISSION_SEARCH_QUERY,
  SUBMISSIONS_FAILURE,
  SUBMISSIONS_REQUEST,
  SUBMISSIONS_PAGINATION,
  SUBMISSIONS_SUCCESS,
} from 'constants/actionTypes';

const isFetching = (state = false, action) => {
  switch (action.type) {
    case SUBMISSION_ACTIVITY_REQUEST:
    case SUBMISSION_REQUEST:
    case SUBMISSION_MARK_HAM_REQUEST:
    case SUBMISSION_MARK_SPAM_REQUEST:
    case SUBMISSIONS_REQUEST:
      return true;

    case SUBMISSION_SUCCESS:
    case SUBMISSION_FAILURE:
      return false;

    case SUBMISSION_MARK_HAM_SUCCESS:
    case SUBMISSION_MARK_HAM_FAILURE:
      return false;

    case SUBMISSION_MARK_SPAM_SUCCESS:
    case SUBMISSION_MARK_SPAM_FAILURE:
      return false;

    case SUBMISSIONS_SUCCESS:
    case SUBMISSIONS_FAILURE:
      return false;

    case SUBMISSION_ACTIVITY_SUCCESS:
    case SUBMISSION_ACTIVITY_FAILURE:
      return false;

    default:
      return state;
  }
};

const submissionActivityIds = (state = [], action) => {
  switch (action.type) {
    case SUBMISSION_ACTIVITY_SUCCESS:
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
    case SUBMISSION_SEARCH_RESULTS:
    case SUBMISSIONS_PAGINATION:
      return Object.assign({}, state, {
        limit: action.limit,
        offset: action.offset,
        total: action.total,
      });

    case SUBMISSION_SUCCESS:
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
    case SUBMISSION_SEARCH_QUERY:
      return Object.assign({}, state, {
        query: action.query,
      });
    default:
      return state;
  }
};

const visibleIds = (state = [], action) => {
  switch (action.type) {
    case SUBMISSION_SEARCH_RESULTS:
    case SUBMISSIONS_SUCCESS:
      return action.payload.result;

    case SUBMISSION_SUCCESS:
      return action.payload.result - state[0] === 1
        ? [action.payload.result, ...state.slice(0, -1)]
        : state;

    default:
      return state;
  }
};

export default combineReducers({
  isFetching,
  submissionActivityIds,
  pagination,
  search,
  visibleIds,
});
