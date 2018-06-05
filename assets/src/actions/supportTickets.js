import { CALL_API } from 'middleware/api';

// action type constants
import {
  SUPPORT_CREATE_REQUEST,
  SUPPORT_CREATE_SUCCESS,
  SUPPORT_CREATE_FAILURE,
} from 'constants/actionTypes';

export const createSupportTicket = ticket => {
  return async dispatch => {
    const SUPPORT_TICKET_ENDPOINT =
      process.env.REACT_APP_SUPPORT_TICKET_ENDPOINT;

    const actionResponse = await dispatch({
      [CALL_API]: {
        authenticated: true,
        config: {
          body: JSON.stringify({ ...ticket }),
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          method: 'POST',
        },
        endpoint: SUPPORT_TICKET_ENDPOINT,
        schema: null,
        types: [
          SUPPORT_CREATE_REQUEST,
          SUPPORT_CREATE_SUCCESS,
          SUPPORT_CREATE_FAILURE,
        ],
      },
    });

    if (actionResponse.error) {
      throw new Error('Promise flow received action error', actionResponse);
    }

    return actionResponse;
  };
};
