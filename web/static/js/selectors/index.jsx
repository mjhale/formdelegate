import { createSelector } from 'reselect';

const getMessages = (state) => state.messages;

export const getOrderedMessages = createSelector(getMessages, (messages) => {
  return messages.allIds.map((id) => messages.byId[id]);
});
