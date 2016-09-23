import { combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux';
import { reducer as formReducer } from 'redux-form';

import { LOGIN_REQUEST, LOGIN_SUCCESS, LOGIN_FAILURE } from '../actions/sessions';
import { REQUEST_ACCOUNTS, RECEIVE_ACCOUNTS } from '../actions/accounts';
import { REQUEST_ACCOUNT, RECEIVE_ACCOUNT, UPDATE_ACCOUNT } from '../actions/account';

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

const authenticationReducer = (state = {
  isFetching: false,
  isAuthenticated: localStorage.getItem('fd_jwt') ? true : false,
}, action) => {
  switch (action.type) {
    case LOGIN_REQUEST:
      return Object.assign({}, state, {
        isFetching: true,
        isAuthenticated: false,
        credentials: action.credentials,
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
    default:
      return state;
  }
};


const reducers = {
  authentication: authenticationReducer,
  account: accountReducer,
  accounts: accountsReducer,
  routing: routerReducer,
  form: formReducer,
};

export default combineReducers(reducers);
