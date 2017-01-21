import { createSelector } from 'reselect';
import { find, map, filter } from 'lodash';

const getMessages = (state) => state.messages;
const getMessageId = (_state, props) => props.params.messageId;

const getOrderedMessages = createSelector(getMessages, (messages) => {
  return messages.visibleIds.map((id) => messages.byId[id]);
});

export const getVisibleMessages = createSelector(
  [ getOrderedMessages ],
  (orderedMessages) => {
    return orderedMessages;
  }
);

export const getMessage = createSelector(
  [ getMessages, getMessageId ],
  (messages, messageId) => {
    return find(messages.byId, function (object) {
      return object.id == messageId;
    });
  }
);
