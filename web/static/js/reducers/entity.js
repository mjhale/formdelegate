import { merge } from 'lodash';

export default (
  state = {
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
