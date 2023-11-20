import { merge } from 'lodash';

import { FORM_UPDATE_SUCCESS } from 'constants/actionTypes';

const entity = (
  state = {
    users: {},
    email_integrations: {},
    forms: {},
    plans: {},
    submissions: {},
  },
  action
) => {
  switch (action.type) {
    case FORM_UPDATE_SUCCESS:
      return {
        ...state,
        forms: {
          ...state.forms,
          [action.payload.result]: {
            ...action.payload.entities.forms[action.payload.result],
          },
        },
        email_integrations: {
          ...state.email_integrations,
          ...action.payload.entities.email_integrations,
        },
      };
    default:
      if (action.payload && action.payload.entities) {
        return merge({}, state, action.payload.entities);
      }

      return state;
  }
};

export default entity;
