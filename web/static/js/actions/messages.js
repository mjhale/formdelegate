import { CALL_API } from '../middleware/api';
import { messageSchema, messageActivitySchema } from '../schema';

// action type constants
import {
  MESSAGE_ACTIVITY_FAILURE,
  MESSAGE_ACTIVITY_REQUEST,
  MESSAGE_ACTIVITY_SUCCESS,
  MESSAGE_SEARCH_RESULTS,
  MESSAGE_SEARCH_QUERY,
  MESSAGE_SEARCH_REQUEST,
  MESSAGE_SEARCH_SUCCESS,
  MESSAGE_SEARCH_FAILURE,
  MESSAGES_FAILURE,
  MESSAGES_REQUEST,
  MESSAGES_RESULTS,
  MESSAGES_SUCCESS,
} from '../constants/actionTypes';
import { REQUEST_MESSAGE, RECEIVE_MESSAGE } from '../constants/actionTypes';

export function fetchMessage(messageId) {
  return async dispatch => {
    const actionResponse = await dispatch({
      [CALL_API]: {
        authenticated: true,
        endpoint: `messages/${messageId}`,
        schema: messageSchema,
        types: [MESSAGE_REQUEST, MESSAGE_SUCCESS, MESSAGE_FAILURE],
      },
    });

    if (actionResponse.error) {
      throw new Error('Promise flow received action error', actionResponse);
    }

    return actionResponse.payload;
  };
}

export function fetchMessageActivity() {
  return async dispatch => {
    const actionResponse = await dispatch({
      [CALL_API]: {
        authenticated: true,
        endpoint: 'stats/message_activity',
        schema: [messageActivitySchema],
        types: [
          MESSAGE_ACTIVITY_REQUEST,
          MESSAGE_ACTIVITY_SUCCESS,
          MESSAGE_ACTIVITY_FAILURE,
        ],
      },
    });

    if (actionResponse.error) {
      throw new Error('Promise flow received action error', actionResponse);
    }

    return actionResponse.payload;
  };
}

function messageSearchQuery(query, requestedPage) {
  return {
    requestedPage,
    type: MESSAGE_SEARCH_QUERY,
    query: query || '',
  };
}

function messageSearchResults(payload, limit, offset, total) {
  return {
    limit,
    offset,
    payload,
    total,
    type: MESSAGE_SEARCH_RESULTS,
  };
}

export function messageSearchFetch(query, requestedPage) {
  if (!query) query = '';
  if (!requestedPage) requestedPage = 1;

  return async dispatch => {
    const actionResponse = await dispatch({
      [CALL_API]: {
        authenticated: true,
        endpoint: `search/messages?query=${query}&page=${requestedPage}`,
        schema: [messageSchema],
        types: [
          MESSAGE_SEARCH_REQUEST,
          MESSAGE_SEARCH_SUCCESS,
          MESSAGE_SEARCH_FAILURE,
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
      messageSearchActions(
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

function messageSearchActions(
  payload,
  query,
  requestedPage,
  limit,
  offset,
  total
) {
  return dispatch =>
    Promise.all([
      dispatch(messageSearchQuery(query, requestedPage)),
      dispatch(messageSearchResults(payload, limit, offset, total)),
    ]);
}

export function fetchMessages(requestedPage) {
  if (!requestedPage) requestedPage = 1;

  return async dispatch => {
    const actionResponse = await dispatch({
      [CALL_API]: {
        authenticated: true,
        endpoint: `messages?page=${requestedPage}`,
        schema: [messageSchema],
        types: [MESSAGES_REQUEST, MESSAGES_SUCCESS, MESSAGES_FAILURE],
      },
    });

    if (actionResponse.error) {
      throw new Error('Promise flow received action error', actionResponse);
    }

    const limit = Number(actionResponse.headers.get('per-page'));
    const offset = (requestedPage - 1) * (limit + 1);
    const total = Number(actionResponse.headers.get('total'));

    if (!total) return null;

    return dispatch(
      receiveMessages(actionResponse.payload, limit, offset, total)
    );
  };
}

function receiveMessages(payload, limit, offset, total) {
  return {
    limit,
    offset,
    payload,
    total,
    type: MESSAGES_RESULTS,
  };
}
