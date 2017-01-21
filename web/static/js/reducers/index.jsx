import { combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux';
import { reducer as formReducer } from 'redux-form';
import { keyBy, map, union } from 'lodash';

import { LOGIN_REQUEST, LOGIN_SUCCESS, LOGIN_FAILURE } from '../actions/sessions';
import { LOGOUT_REQUEST, LOGOUT_SUCCESS, LOGOUT_FAILURE } from '../actions/sessions';
import { REQUEST_ACCOUNTS, RECEIVE_ACCOUNTS } from '../actions/accounts';
import { REQUEST_ACCOUNT, RECEIVE_ACCOUNT, UPDATE_ACCOUNT } from '../actions/account';
import { RECEIVE_MESSAGES, REQUEST_MESSAGES } from '../actions/messages';
import { RECEIVE_SEARCH_MESSAGES, REQUEST_SEARCH_MESSAGES } from '../actions/messages';
import { REQUEST_MESSAGE, RECEIVE_MESSAGE } from '../actions/message';
import { REQUEST_FORMS, RECEIVE_FORMS } from '../actions/forms';

const formsReducer = (state = {
  forms: [],
  isFetching: false,
}, action) => {
  switch (action.type) {
    case REQUEST_FORMS:
      return Object.assign({}, state, {
        isFetching: true,
      });
    case RECEIVE_FORMS:
      return Object.assign({}, state, {
        isFetching: false,
        forms: action.forms,
      });
    default:
      return state;
  }
};

const messagesReducer = (state = {
  byId: {},
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
    case RECEIVE_MESSAGE:
      return Object.assign({}, state, {
        byId: Object.assign({}, state.byId, {
          [action.response.id]: {
            ...action.response
          }
        }),
        isFetching: false,
      });
    case RECEIVE_MESSAGES:
      return Object.assign({}, state, {
        byId: Object.assign({}, state.byId, keyBy(action.response, 'id')),
        isFetching: false,
        pagination: Object.assign({}, state.pagination, {
          limit: action.limit,
          offset: action.offset,
          total: action.total,
        }),
        visibleIds: map(action.response, 'id'),
      });
    case RECEIVE_SEARCH_MESSAGES:
      return Object.assign({}, state, {
        byId: Object.assign({}, state.byId, keyBy(action.response, 'id')),
        isFetching: false,
        pagination: Object.assign({}, state.pagination, {
          limit: action.limit,
          offset: action.offset,
          total: action.total,
        }),
        visibleIds: map(action.response, 'id'),
      });
    case REQUEST_MESSAGE:
      return Object.assign({}, state, {
        isFetching: true,
      });
    case REQUEST_MESSAGES:
      return Object.assign({}, state, {
        isFetching: true,
      });
    case REQUEST_SEARCH_MESSAGES:
      return Object.assign({}, state, {
        isFetching: true,
        search: {
          query: action.query,
        },
      });
    default:
      return state;
  }
};

const accountsReducer = (state = {
  isFetching: false,
  items: [],
}, action) => {
  switch (action.type) {
    case REQUEST_ACCOUNTS:
      return Object.assign({}, state, {
        isFetching: true,
      });
    case RECEIVE_ACCOUNTS:
      return Object.assign({}, state, {
        isFetching: false,
        items: action.items,
        lastUpdated: action.receivedAt,
      });
    default:
      return state;
  }
};

const accountReducer = (state = {
  isFetching: false,
  account: {},
}, action) => {
  switch (action.type) {
    case REQUEST_ACCOUNT:
      return Object.assign({}, state, {
        isFetching: true,
      });
    case RECEIVE_ACCOUNT:
      return Object.assign({}, state, {
        isFetching: false,
        account: action.account,
        lastUpdated: action.receivedAt,
      });
    case UPDATE_ACCOUNT:
      return Object.assign({}, state, {
        account: action.account,
      });
    default:
      return state;
  }
};

/* @TODO Check if fd_token is expired. */
const authenticationReducer = (state = {
  isFetching: false,
  isAuthenticated: localStorage.getItem('fd_token') ? true : false,
  errorMessage: '',
}, action) => {
  switch (action.type) {
    case LOGIN_REQUEST:
      return Object.assign({}, state, {
        isFetching: true,
        isAuthenticated: false,
      });
    case LOGIN_SUCCESS:
      return Object.assign({}, state, {
        isFetching: false,
        isAuthenticated: true,
        errorMessage: '',
      });
    case LOGIN_FAILURE:
      return Object.assign({}, state, {
        isFetching: false,
        isAuthenticated: false,
        errorMessage: action.message,
      });
    case LOGOUT_REQUEST:
      return Object.assign({}, state, {
        isFetching: true,
      });
    case LOGOUT_SUCCESS:
      return Object.assign({}, state, {
        isFetching: false,
        isAuthenticated: false,
      });
    case LOGOUT_FAILURE:
      return Object.assign({}, state, {
        isFetching: false,
        isAuthenticated: false,
        errorMessage: action.message,
      });
    default:
      return state;
  }
};

const reducers = {
  account: accountReducer,
  accounts: accountsReducer,
  authentication: authenticationReducer,
  forms: formsReducer,
  routing: routerReducer,
  messages: messagesReducer,
  form: formReducer, // redux-form
};

export default combineReducers(reducers);
