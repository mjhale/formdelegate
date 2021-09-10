import { combineReducers } from 'redux';
import { createResponsiveStateReducer } from 'redux-responsive';

import authenticationReducer from 'reducers/authentication';
import entityReducer from 'reducers/entity';
import formReducer from 'reducers/form';
import notificationReducer from 'reducers/notification';
import submissionReducer from 'reducers/submission';
import userReducer from 'reducers/user';
import userConfirmationReducer from 'reducers/userConfirmation';
import userResetPassword from 'reducers/userResetPassword';
import { breakpoints } from 'utils/style';

const reducers = {
  authentication: authenticationReducer,
  entities: entityReducer,
  forms: formReducer,
  notifications: notificationReducer,
  submissions: submissionReducer,
  users: userReducer,
  userConfirmation: userConfirmationReducer,
  userResetPassword: userResetPassword,

  browser: createResponsiveStateReducer(
    {
      small: breakpoints.sm,
      medium: breakpoints.md,
      large: breakpoints.lg,
      extraLarge: breakpoints.xl,
    },
    {
      extraFields: () => ({
        width: typeof window !== 'undefined' ? window.innerWidth : 0,
      }),
    }
  ),
};

export default combineReducers(reducers);
