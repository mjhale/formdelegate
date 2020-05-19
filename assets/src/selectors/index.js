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
const getSubmissionActivities = state => state.entities.submission_activity;
const getSubmissionActivityIds = state =>
  state.submissions.submissionActivityIds;
const getSubmissionIds = state => state.submissions.visibleIds;
const getSubmissionId = (_state, props) => props.match.params.submissionId;
const getSubmissions = state => state.entities.submissions;

export const getUser = createSelector(
  [getUsers, getUserId],
  (users, userId) => {
    return find(users, function (object) {
      return object.id === userId;
    });
  }
);

export const getCurrentUser = createSelector(
  [getUsers, getCurrentUserId],
  (users, currentUserId) => {
    return find(users, function (object) {
      return object.id === currentUserId;
    });
  }
);

export const getForm = createSelector(
  [getForms, getFormId],
  (forms, formId) => {
    return find(forms, function (object) {
      return object.id === formId;
    });
  }
);

export const getIntegration = createSelector(
  [getIntegrations, getIntegrationId],
  (integrations, integrationId) => {
    return find(integrations, function (object) {
      return object.id === integrationId;
    });
  }
);

export const getSubmission = createSelector(
  [getSubmissions, getSubmissionId],
  (submissions, submissionId) => {
    return find(submissions, function (object) {
      return object.id === submissionId;
    });
  }
);

export const getSubmissionActivity = createSelector(
  [getSubmissionActivities, getSubmissionActivityIds],
  (submissionActivity, allIds) => {
    return allIds.map(id => submissionActivity[id]);
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

const getOrderedSubmissions = createSelector(
  [getSubmissions, getSubmissionIds],
  (submissions, submissionIds) => {
    return submissionIds.map(id => submissions[id]);
  }
);

export const getVisibleSubmissions = createSelector(
  [getOrderedSubmissions],
  orderedSubmissions => {
    return orderedSubmissions;
  }
);
