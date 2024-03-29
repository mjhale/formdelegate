import { createSelector } from 'reselect';
import { find } from 'lodash';

const getUserIds = (state) => state.users.allIds;
const getUserId = (state, userId) => userId;
const getUsers = (state) => state.entities.users;
const getCurrentUserId = (state) => state.authentication.currentUserId;
const getFormId = (_state, formId) => formId;
const getFormIds = (state) => state.forms.allIds;
const getForms = (state) => state.entities.forms;
const getPlanIds = (state) => state.plans.allIds;
const getPlans = (state) => state.entities.plans;
const getSubmissionActivities = (state) => state.entities.submission_activity;
const getSubmissionActivityIds = (state) =>
  state.submissions.submissionActivityIds;
const getSubmissionIds = (state) => state.submissions.visibleIds;
const getSubmissionId = (state, submissionId) => submissionId;
const getSubmissions = (state) => state.entities.submissions;

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
    return allIds.map((id) => submissionActivity[id]);
  }
);

export const getOrderedUsers = createSelector(
  [getUsers, getUserIds],
  (users, allIds) => {
    return allIds.map((id) => users[id]);
  }
);

export const getOrderedForms = createSelector(
  [getForms, getFormIds],
  (forms, allIds) => {
    return allIds.map((id) => forms[id]);
  }
);

export const getOrderedPlans = createSelector(
  [getPlans, getPlanIds],
  (plans, allIds) => {
    return allIds.map((id) => plans[id]);
  }
);

const getOrderedSubmissions = createSelector(
  [getSubmissions, getSubmissionIds],
  (submissions, submissionIds) => {
    return submissionIds.map((id) => submissions[id]);
  }
);

export const getVisibleSubmissions = createSelector(
  [getOrderedSubmissions],
  (orderedSubmissions) => {
    return orderedSubmissions;
  }
);

export const getVisibleSubmissionForms = createSelector(
  [getOrderedSubmissions, getForms],
  (submissions, forms) => {
    return submissions.map((submission) => forms[submission.form]);
  }
);
