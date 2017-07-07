import { createSelector } from 'reselect';
import { filter, find, map } from 'lodash';

const getAccountIds = state => state.accounts.allIds;
const getAccountId = (_state, props) => props.match.params.accountId;
const getAccounts = state => state.entities.accounts;
const getCurrentAccountId = state => state.accounts.currentAccountId;
const getFormId = (_state, props) => props.match.params.formId;
const getFormIds = state => state.forms.allIds;
const getForms = state => state.entities.forms;
const getMessageIds = state => state.messages.visibleIds;
const getMessageId = (_state, props) => props.match.params.messageId;
const getMessages = state => state.entities.messages;

export const getAccount = createSelector(
  [getAccounts, getAccountId],
  (accounts, accountId) => {
    return find(accounts, function(object) {
      return object.id == accountId;
    });
  }
);

export const getCurrentAccount = createSelector(
  [getAccounts, getCurrentAccountId],
  (accounts, accountId) => {
    return find(accounts, function(object) {
      return object.id == accountId;
    });
  }
);

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

export const getOrderedAccounts = createSelector(
  [getAccounts, getAccountIds],
  (accounts, allIds) => {
    return allIds.map(id => accounts[id]);
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
