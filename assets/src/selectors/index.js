import { createSelector } from 'reselect';
import { find } from 'lodash';

const getUserIds = state => state.users.allIds;
const getUserId = (_state, props) => parseInt(props.match.params.userId, 10);
const getUsers = state => state.entities.users;
const getCurrentUserId = state => state.users.currentUserId;
const getFormId = (_state, props) => props.match.params.formId;
const getFormIds = state => state.forms.allIds;
const getForms = state => state.entities.forms;
const getIntegrations = state => state.entities.integrations;
const getIntegrationId = (_state, props) =>
  parseInt(props.match.params.integrationId, 10);
const getIntegrationIds = state => state.integrations.allIds;
const getMessageActivities = state => state.entities.message_activity;
const getMessageActivityIds = state => state.messages.messageActivityIds;
const getMessageIds = state => state.messages.visibleIds;
const getMessageId = (_state, props) => props.match.params.messageId;
const getMessages = state => state.entities.messages;

export const getUser = createSelector(
  [getUsers, getUserId],
  (users, userId) => {
    return find(users, function(object) {
      return object.id === userId;
    });
  }
);

export const getCurrentUser = createSelector(
  [getUsers, getCurrentUserId],
  (users, currentUserId) => {
    return find(users, function(object) {
      return object.id === currentUserId;
    });
  }
);

export const getForm = createSelector(
  [getForms, getFormId],
  (forms, formId) => {
    return find(forms, function(object) {
      return object.id === formId;
    });
  }
);

export const getIntegration = createSelector(
  [getIntegrations, getIntegrationId],
  (integrations, integrationId) => {
    return find(integrations, function(object) {
      return object.id === integrationId;
    });
  }
);

export const getMessage = createSelector(
  [getMessages, getMessageId],
  (messages, messageId) => {
    return find(messages, function(object) {
      return object.id === messageId;
    });
  }
);

export const getMessageActivity = createSelector(
  [getMessageActivities, getMessageActivityIds],
  (messageActivity, allIds) => {
    return allIds.map(id => messageActivity[id]);
  }
);

export const getOrderedUsers = createSelector(
  [getUsers, getUserIds],
  (users, allIds) => {
    return allIds.map(id => users[id]);
  }
);

export const getOrderedForms = createSelector(
  [getForms, getFormIds],
  (forms, allIds) => {
    return allIds.map(id => forms[id]);
  }
);

export const getOrderedIntegrations = createSelector(
  [getIntegrations, getIntegrationIds],
  (integrations, integrationIds) => {
    return integrationIds.map(id => integrations[id]);
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
