import { createSelector } from 'reselect';
import { find, map, filter } from 'lodash';

const getForms = (state) => state.entities.forms;
const getFormId = (_state, props) => props.params.formId;
const getFormIds = (state) => state.forms.allIds;
const getMessages = (state) => state.messages;
const getMessageId = (_state, props) => props.params.messageId;

export const getForm = createSelector(
  [ getForms, getFormId ],
  (forms, formId) => {
    return find(forms, function(object) {
      return object.id == formId;
    });
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

export const getOrderedForms = createSelector(
  [ getForms, getFormIds ],
  (forms, allIds) => {
  return allIds.map((id) => forms[id]);
});

const getOrderedMessages = createSelector(getMessages, (messages) => {
  return messages.visibleIds.map((id) => messages.byId[id]);
});

export const getVisibleMessages = createSelector(
  [ getOrderedMessages ],
  (orderedMessages) => {
    return orderedMessages;
  }
);
