import { CALL_API } from 'middleware/api';

// action type constants
import {
  SUPPORT_CREATE_REQUEST,
  SUPPORT_CREATE_SUCCESS,
  SUPPORT_CREATE_FAILURE,
} from 'constants/actionTypes';

export const createSupportTicket = (ticket) => {
  return async (dispatch) => {
    const SUPPORT_TICKET_ENDPOINT =
      process.env.NEXT_PUBLIC_SUPPORT_TICKET_ENDPOINT;

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

    return actionResponse;
  };
};
