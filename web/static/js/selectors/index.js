import { createSelector } from 'reselect';
import { filter, find, map } from 'lodash';

const getForms = state => state.entities.forms;
const getFormId = (_state, props) => props.params.formId;
const getFormIds = state => state.forms.allIds;
const getMessages = state => state.entities.messages;
const getMessageIds = state => state.messages.visibleIds;
const getMessageId = (_state, props) => props.params.messageId;

export const getForm = createSelector(
  [getForms, getFormId],
  (forms, formId) => {
    return find(forms, function(object) {
      return object.id == formId;
    });
  }
);

export const getMessage = createSelector(
  [getMessages, getMessageId],
  (messages, messageId) => {
    return find(messages, function(object) {
      return object.id == messageId;
    });
  }
);

export const getOrderedForms = createSelector(
  [getForms, getFormIds],
  (forms, allIds) => {
    return allIds.map(id => forms[id]);
  }
);

const getOrderedMessages = createSelector(
  [getMessages, getMessageIds],
  (messages, messageIds) => {
    return messageIds.map(id => messages[id]);
  }
);

export const getVisibleMessages = createSelector(
  [getOrderedMessages],
  orderedMessages => {
    return orderedMessages;
  }
);
