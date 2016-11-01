import { combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux';
import { reducer as formReducer } from 'redux-form';

import { LOGIN_REQUEST, LOGIN_SUCCESS, LOGIN_FAILURE } from '../actions/sessions';
import { LOGOUT_REQUEST, LOGOUT_SUCCESS, LOGOUT_FAILURE } from '../actions/sessions';
import { REQUEST_ACCOUNTS, RECEIVE_ACCOUNTS } from '../actions/accounts';
import { REQUEST_ACCOUNT, RECEIVE_ACCOUNT, UPDATE_ACCOUNT } from '../actions/account';
import { REQUEST_MESSAGES, RECEIVE_MESSAGES } from '../actions/messages';

const messagesReducer = (state = {
  messages: [],
  isFetching: false,
}, action) => {
  switch (action.type) {
    case REQUEST_MESSAGES:
      return Object.assign({}, state, {
        isFetching: true,
      });
    case RECEIVE_MESSAGES:
      return Object.assign({}, state, {
        isFetching: false,
        messages: action.messages,
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
  form: formReducer,
  routing: routerReducer,
  messages: messagesReducer,
};

export default combineReducers(reducers);
