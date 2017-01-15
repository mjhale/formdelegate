import { createSelector } from 'reselect';
import { find, map, filter } from 'lodash';

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
      return filter(messages, (message) => {
        let found = false;
        Object.keys(message).find((key) => {
          if (message[key]) {
            if (!found) {
              let value = message[key].toString().toLowerCase();
              found = value.indexOf(searchText.toLowerCase()) !== -1;
            }
          }
        });
        return found;
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
