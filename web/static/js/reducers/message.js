import { MESSAGE_SEARCH_RESULTS, MESSAGE_SEARCH_QUERY } from '../constants/actionTypes';
import { MESSAGES_FAILURE, MESSAGES_REQUEST, MESSAGES_RESULTS, MESSAGES_SUCCESS } from '../constants/actionTypes';
import { MESSAGE_FAILURE, MESSAGE_REQUEST, MESSAGE_SUCCESS } from '../constants/actionTypes';
import { REQUEST_MESSAGE, RECEIVE_MESSAGE } from '../constants/actionTypes';

export default (state = {
  isFetching: false,
  pagination: {
    offset: 0,
    limit: 0,
    total: 0,
  },
  search: {
    query: '',
  },
  visibleIds: [],
}, action) => {
  switch (action.type) {
    case MESSAGE_SUCCESS:
      return Object.assign({}, state, {
        isFetching: false,
      });
    case MESSAGES_RESULTS:
      return Object.assign({}, state, {
        isFetching: false,
        pagination: Object.assign({}, state.pagination, {
          limit: action.limit,
          offset: action.offset,
          total: action.total,
        }),
        visibleIds: action.payload.result,
      });
    case MESSAGE_SEARCH_RESULTS:
      return Object.assign({}, state, {
        pagination: Object.assign({}, state.pagination, {
          limit: action.limit,
          offset: action.offset,
          total: action.total,
        }),
        visibleIds: action.payload.result,
      });
    case MESSAGE_REQUEST:
      return Object.assign({}, state, {
        isFetching: true,
      });
    case MESSAGES_REQUEST:
      return Object.assign({}, state, {
        isFetching: true,
      });
    case MESSAGE_SEARCH_QUERY:
      return Object.assign({}, state, {
        search: {
          query: action.query,
        },
      });
    default:
      return state;
  }
};
