import { combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux';
import { reducer as reduxFormReducer } from 'redux-form';
import authenticationReducer from 'reducers/authentication';
import entityReducer from 'reducers/entity';
import formReducer from 'reducers/form';
import messageReducer from 'reducers/message';

import { REQUEST_ACCOUNT, RECEIVE_ACCOUNT, UPDATE_ACCOUNT } from '../actions/account';
import { REQUEST_ACCOUNTS, RECEIVE_ACCOUNTS } from '../actions/accounts';

/* @TODO: Combine and refactor account reducers */
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

const reducers = {
  account: accountReducer,
  accounts: accountsReducer,
  authentication: authenticationReducer,
  entities: entityReducer,
  forms: formReducer,
  messages: messageReducer,
  routing: routerReducer,

  /* redux-form, must be the final reducer */
  form: reduxFormReducer,
};

export default combineReducers(reducers);
