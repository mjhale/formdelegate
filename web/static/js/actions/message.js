import { CALL_API } from '../middleware/api';
import { messageSchema } from '../schema';

import { MESSAGE_FAILURE, MESSAGE_REQUEST, MESSAGE_SUCCESS } from '../constants/actionTypes';

export function fetchMessage(messageId) {
  return async(dispatch) => {
    const actionResponse = await dispatch({
      [CALL_API]: {
        authenticated: true,
        endpoint: `messages/${messageId}`,
        schema: messageSchema,
        types: [MESSAGE_REQUEST, MESSAGE_SUCCESS, MESSAGE_FAILURE],
      }
    });

    if (actionResponse.error) {
      throw new Error('Promise flow received action error', actionResponse);
    }

    return actionResponse.payload;
  };
}
