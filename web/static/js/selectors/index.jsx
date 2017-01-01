import { createSelector } from 'reselect';
import { find, map, filter, includes } from 'lodash';

const getMessages = (state) => state.messages;
const getMessagesSearchText = (state) => state.messages.searchText;
const getMessageId = (_state, props) => props.params.messageId;

const getOrderedMessages = createSelector(getMessages, (messages) => {
  return messages.allIds.map((id) => messages.byId[id]);
});

export const getVisibleMessages = createSelector(
  [ getOrderedMessages, getMessagesSearchText ],
  (messages, searchText) => {
    if (searchText) {
      /* @TODO: Add case insensitive search within nested objects */
      return filter(messages, (message) => {
        return includes(message, searchText);
      });
    } else {
      return messages;
    }
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
