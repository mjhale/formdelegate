import { CALL_API } from 'middleware/api';
import { submissionSchema, submissionActivitySchema } from 'schema';

// action type constants
import {
  SUBMISSION_FAILURE,
  SUBMISSION_REQUEST,
  SUBMISSION_SUCCESS,
  SUBMISSION_ACTIVITY_FAILURE,
  SUBMISSION_ACTIVITY_REQUEST,
  SUBMISSION_ACTIVITY_SUCCESS,
  SUBMISSION_MARK_HAM_FAILURE,
  SUBMISSION_MARK_HAM_REQUEST,
  SUBMISSION_MARK_HAM_SUCCESS,
  SUBMISSION_MARK_SPAM_FAILURE,
  SUBMISSION_MARK_SPAM_REQUEST,
  SUBMISSION_MARK_SPAM_SUCCESS,
  SUBMISSION_SEARCH_RESULTS,
  SUBMISSION_SEARCH_QUERY,
  SUBMISSION_SEARCH_REQUEST,
  SUBMISSION_SEARCH_SUCCESS,
  SUBMISSION_SEARCH_FAILURE,
  SUBMISSIONS_FAILURE,
  SUBMISSIONS_REQUEST,
  SUBMISSIONS_PAGINATION,
  SUBMISSIONS_SUCCESS,
} from 'constants/actionTypes';

export function addSubmission(payload) {
  return dispatch =>
    dispatch({
      isFetching: false,
      payload: payload,
      type: SUBMISSION_SUCCESS,
    });
}

export function fetchSubmission(submissionId) {
  return async dispatch => {
    const actionResponse = await dispatch({
      [CALL_API]: {
        authenticated: true,
        endpoint: `/v1/submissions/${submissionId}`,
        schema: submissionSchema,
        types: [SUBMISSION_REQUEST, SUBMISSION_SUCCESS, SUBMISSION_FAILURE],
      },
    });

    if (actionResponse.error) {
      throw new Error('Promise flow received action error', actionResponse);
    }

    return actionResponse.payload;
  };
}

export function fetchSubmissionActivity() {
  return async dispatch => {
    const actionResponse = await dispatch({
      [CALL_API]: {
        authenticated: true,
        endpoint: '/v1/submissions/recent_activity',
        schema: [submissionActivitySchema],
        types: [
          SUBMISSION_ACTIVITY_REQUEST,
          SUBMISSION_ACTIVITY_SUCCESS,
          SUBMISSION_ACTIVITY_FAILURE,
        ],
      },
    });

    if (actionResponse.error) {
      throw new Error('Promise flow received action error', actionResponse);
    }

    return actionResponse.payload;
  };
}

function submissionSearchQuery(query, requestedPage) {
  return {
    requestedPage,
    type: SUBMISSION_SEARCH_QUERY,
    query: query || '',
  };
}

function submissionSearchResults(payload, limit, offset, total) {
  return {
    limit,
    offset,
    payload,
    total,
    type: SUBMISSION_SEARCH_RESULTS,
  };
}

export function submissionSearchFetch(query, requestedPage) {
  if (!query) query = '';
  if (!requestedPage) requestedPage = 1;

  return async dispatch => {
    const actionResponse = await dispatch({
      [CALL_API]: {
        authenticated: true,
        endpoint: `/v1/submissions?query=${query}&page=${requestedPage}`,
        schema: [submissionSchema],
        types: [
          SUBMISSION_SEARCH_REQUEST,
          SUBMISSION_SEARCH_SUCCESS,
          SUBMISSION_SEARCH_FAILURE,
        ],
      },
    });

    if (actionResponse.error) {
      throw new Error('Promise flow received action error', actionResponse);
    }

    const limit = Number(actionResponse.headers.get('per-page'));
    const offset = (requestedPage - 1) * (limit + 1);
    const total = Number(actionResponse.headers.get('total'));

    return dispatch(
      submissionSearchActions(
        actionResponse.payload,
        query,
        requestedPage,
        limit,
        offset,
        total
      )
    );
  };
}

function submissionSearchActions(
  payload,
  query,
  requestedPage,
  limit,
  offset,
  total
) {
  return dispatch =>
    Promise.all([
      dispatch(submissionSearchQuery(query, requestedPage)),
      dispatch(submissionSearchResults(payload, limit, offset, total)),
    ]);
}

export function fetchSubmissions(requestedPage) {
  if (!requestedPage) requestedPage = 1;

  return async dispatch => {
    const actionResponse = await dispatch({
      [CALL_API]: {
        authenticated: true,
        endpoint: `/v1/submissions?page=${requestedPage}`,
        schema: [submissionSchema],
        types: [SUBMISSIONS_REQUEST, SUBMISSIONS_SUCCESS, SUBMISSIONS_FAILURE],
      },
    });

    if (actionResponse.error) {
      throw new Error('Promise flow received action error', actionResponse);
    }

    const limit = Number(actionResponse.headers.get('per-page'));
    const offset = (requestedPage - 1) * (limit + 1);
    const total = Number(actionResponse.headers.get('total'));

    return dispatch(receiveSubmissionsPagination(limit, offset, total));
  };
}

function receiveSubmissionsPagination(limit, offset, total) {
  return {
    limit,
    offset,
    total,
    type: SUBMISSIONS_PAGINATION,
  };
}

export function markSubmissionAsHam(submissionId) {
  return async (dispatch, getState) => {
    const actionResponse = await dispatch({
      [CALL_API]: {
        authenticated: true,
        config: {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          method: 'PUT',
        },
        endpoint: `/v1/submissions/${submissionId}/ham`,
        schema: submissionSchema,
        types: [
          SUBMISSION_MARK_HAM_REQUEST,
          SUBMISSION_MARK_HAM_SUCCESS,
          SUBMISSION_MARK_HAM_FAILURE,
        ],
      },
    });

    if (actionResponse.error) {
      throw new Error('Promise flow received action error', actionResponse);
    }

    return actionResponse;
  };
}

export function markSubmissionAsSpam(submissionId) {
  return async (dispatch, getState) => {
    const actionResponse = await dispatch({
      [CALL_API]: {
        authenticated: true,
        config: {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          method: 'PUT',
        },
        endpoint: `/v1/submissions/${submissionId}/spam`,
        schema: submissionSchema,
        types: [
          SUBMISSION_MARK_SPAM_REQUEST,
          SUBMISSION_MARK_SPAM_SUCCESS,
          SUBMISSION_MARK_SPAM_FAILURE,
        ],
      },
    });

    if (actionResponse.error) {
      throw new Error('Promise flow received action error', actionResponse);
    }

    return actionResponse;
  };
}
