import { merge } from 'lodash';

export default (
  state = {
    users: {},
    form_integrations: {},
    forms: {},
    integrations: {},
    messages: {},
  },
  action
) => {
  if (action.payload && action.payload.entities) {
    return merge({}, state, action.payload.entities);
  }

  return state;
};
