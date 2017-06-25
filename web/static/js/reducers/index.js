import * as types from '../constants/actionTypes';
import { combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux';
import { reducer as reduxFormReducer } from 'redux-form';
import { keyBy, map, merge, union } from 'lodash';
import { removeItem, updateObjectInArray } from '../utility';

import { FORM_REQUEST, FORM_SUCCESS, FORM_FAILURE } from '../constants/actionTypes';
import { FORM_CREATE_REQUEST, FORM_CREATE_SUCCESS, FORM_CREATE_FAILURE } from '../constants/actionTypes';
import { FORM_DELETE_REQUEST, FORM_DELETE_SUCCESS, FORM_DELETE_FAILURE } from '../constants/actionTypes';
import { FORM_UPDATE_REQUEST, FORM_UPDATE_SUCCESS, FORM_UPDATE_FAILURE } from '../constants/actionTypes';
import { FORMS_REQUEST, FORMS_SUCCESS, FORMS_FAILURE } from '../constants/actionTypes';
import { INTEGRATIONS_REQUEST, INTEGRATIONS_SUCCESS, INTEGRATIONS_FAILURE } from '../constants/actionTypes';

import { LOGIN_REQUEST, LOGIN_SUCCESS, LOGIN_FAILURE } from '../actions/sessions';
import { LOGOUT_REQUEST, LOGOUT_SUCCESS, LOGOUT_FAILURE } from '../actions/sessions';

import { MESSAGE_SEARCH_RESULTS, MESSAGE_SEARCH_QUERY } from '../actions/messages';
import { MESSAGES_FAILURE, MESSAGES_REQUEST, MESSAGES_RESULTS, MESSAGES_SUCCESS } from '../actions/messages';
import { MESSAGE_FAILURE, MESSAGE_REQUEST, MESSAGE_SUCCESS } from '../actions/message';
import { REQUEST_MESSAGE, RECEIVE_MESSAGE } from '../actions/message';

import { REQUEST_ACCOUNT, RECEIVE_ACCOUNT, UPDATE_ACCOUNT } from '../actions/account';
import { REQUEST_ACCOUNTS, RECEIVE_ACCOUNTS } from '../actions/accounts';

const accountReducer = (state = {
  account: {},
  isFetching: false,
}, action) => {
  switch (action.type) {
    case RECEIVE_ACCOUNT:
      return Object.assign({}, state, {
        isFetching: false,
        account: action.account,
        lastUpdated: action.receivedAt,
      });
    case REQUEST_ACCOUNT:
      return Object.assign({}, state, {
        isFetching: true,
      });
    case UPDATE_ACCOUNT:
      return Object.assign({}, state, {
        account: action.account,
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
    case RECEIVE_ACCOUNTS:
      return Object.assign({}, state, {
        isFetching: false,
        items: action.items,
        lastUpdated: action.receivedAt,
      });
    case REQUEST_ACCOUNTS:
      return Object.assign({}, state, {
        isFetching: true,
      });
    default:
      return state;
  }
};

/* @TODO Check if fd_token is expired. */
const authenticationReducer = (state = {
  isAuthenticated: localStorage.getItem('fd_token') ? true : false,
  isFetching: false,
  errorMessage: '',
}, action) => {
  switch (action.type) {
    case LOGIN_FAILURE:
      return Object.assign({}, state, {
        isAuthenticated: false,
        isFetching: false,
        errorMessage: action.error,
      });
    case LOGIN_REQUEST:
      return Object.assign({}, state, {
        isAuthenticated: false,
        isFetching: true,
      });
    case LOGIN_SUCCESS:
      return Object.assign({}, state, {
        isAuthenticated: true,
        isFetching: false,
      });
    case LOGOUT_FAILURE:
      return Object.assign({}, state, {
        isAuthenticated: false,
        isFetching: false,
        errorMessage: action.error,
      });
    case LOGOUT_REQUEST:
      return Object.assign({}, state, {
        isFetching: true,
      });
    case LOGOUT_SUCCESS:
      return Object.assign({}, state, {
        isAuthenticated: false,
        isFetching: false,
      });
    default:
      return state;
  }
};

const entitiesReducer = (state = {
  form_integrations: {},
  forms: {},
  integrations: {},
  messages: {},
}, action) => {
  if (action.payload && action.payload.entities) {
    return merge({}, state, action.payload.entities);
  };
  return state;
};

const formsReducer = (state = {
  allIds: [],
  isFetching: false,
}, action) => {
  switch (action.type) {
    case FORM_REQUEST:
    case FORM_CREATE_REQUEST:
    case FORM_DELETE_REQUEST:
    case FORM_UPDATE_REQUEST:
    case FORMS_REQUEST:
    case INTEGRATIONS_REQUEST:
      return Object.assign({}, state, {
        isFetching: true,
      });

    case FORM_CREATE_SUCCESS:
      return {
        ...state,
        allIds: [...state.allIds, action.payload.result]
      };

    case FORM_DELETE_SUCCESS:
      return {
        ...state,
        allIds: state.allIds.filter((form) =>
          form !== action.id,
        ),
      };

    case FORM_FAILURE:
    case FORM_SUCCESS:
    case FORMS_FAILURE:
    case INTEGRATIONS_FAILURE:
    case INTEGRATIONS_SUCCESS:
      return Object.assign({}, state, {
        isFetching: false,
      });

    case FORMS_SUCCESS:
      return Object.assign({}, state, {
        allIds: action.payload.result,
        isFetching: false,
      });
    case FORM_DELETE_REQUEST:

    default:
      return state;
  }
};

const messagesReducer = (state = {
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

const reducers = {
  account: accountReducer,
  accounts: accountsReducer,
  authentication: authenticationReducer,
  entities: entitiesReducer,
  forms: formsReducer,
  messages: messagesReducer,
  routing: routerReducer,

  /* redux-form, must be the final reducer */
  form: reduxFormReducer,
};

export default combineReducers(reducers);
