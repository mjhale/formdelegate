import { combineReducers } from 'redux';
import { reducer as reduxFormReducer } from 'redux-form';
import accountReducer from 'reducers/account';
import authenticationReducer from 'reducers/authentication';
import entityReducer from 'reducers/entity';
import formReducer from 'reducers/form';
import messageReducer from 'reducers/message';

const reducers = {
  accounts: accountReducer,
  authentication: authenticationReducer,
  entities: entityReducer,
  forms: formReducer,
  messages: messageReducer,

  /* redux-form, must be the final reducer */
  form: reduxFormReducer,
};

export default combineReducers(reducers);
