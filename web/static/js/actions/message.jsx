import { CALL_API } from '../middleware/api';
import { messageSchema } from '../schema';

export const MESSAGE_FAILURE = 'MESSAGE_FAILURE';
export const MESSAGE_REQUEST = 'MESSAGE_REQUEST';
export const MESSAGE_SUCCESS = 'MESSAGE_SUCCESS';

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
