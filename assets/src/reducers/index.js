import { combineReducers } from 'redux';
import { reducer as reduxFormReducer } from 'redux-form';
import { createResponsiveStateReducer } from 'redux-responsive';

import userReducer from 'reducers/user';
import authenticationReducer from 'reducers/authentication';
import entityReducer from 'reducers/entity';
import formReducer from 'reducers/form';
import integrationReducer from 'reducers/integration';
import messageReducer from 'reducers/message';
import notificationReducer from 'reducers/notification';

const reducers = {
  users: userReducer,
  authentication: authenticationReducer,
  entities: entityReducer,
  forms: formReducer,
  integrations: integrationReducer,
  messages: messageReducer,
  notifications: notificationReducer,

  browser: createResponsiveStateReducer(null, {
    extraFields: () => ({
      width: window.innerWidth,
    }),
  }),

  /* redux-form, must be the final reducer */
  form: reduxFormReducer,
};

export default combineReducers(reducers);
