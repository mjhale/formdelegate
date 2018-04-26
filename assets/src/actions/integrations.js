import { CALL_API } from 'middleware/api';
import { integrationSchema } from 'schema';

// action type constants
import {
  INTEGRATION_REQUEST,
  INTEGRATION_SUCCESS,
  INTEGRATION_FAILURE,
  INTEGRATION_UPDATE_REQUEST,
  INTEGRATION_UPDATE_SUCCESS,
  INTEGRATION_UPDATE_FAILURE,
  INTEGRATIONS_REQUEST,
  INTEGRATIONS_SUCCESS,
  INTEGRATIONS_FAILURE,
} from 'constants/actionTypes';

export const fetchIntegrations = () => ({
  [CALL_API]: {
    authenticated: true,
    endpoint: '/v1/integrations',
    schema: [integrationSchema],
    types: [INTEGRATIONS_REQUEST, INTEGRATIONS_SUCCESS, INTEGRATIONS_FAILURE],
  },
});

export const adminFetchIntegration = integrationId => ({
  [CALL_API]: {
    authenticated: true,
    endpoint: `/v1/integrations/${integrationId}`,
    schema: integrationSchema,
    types: [INTEGRATION_REQUEST, INTEGRATION_SUCCESS, INTEGRATION_FAILURE],
  },
});

export const adminUpdateIntegration = integration => {
  return async (dispatch, getState) => {
    const actionResponse = await dispatch({
      [CALL_API]: {
        authenticated: true,
        config: {
          body: JSON.stringify({ integration }),
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          method: 'PUT',
        },
        endpoint: `/v1/integrations/${integration.id}`,
        schema: integrationSchema,
        types: [
          INTEGRATION_UPDATE_REQUEST,
          INTEGRATION_UPDATE_SUCCESS,
          INTEGRATION_UPDATE_FAILURE,
        ],
      },
    });

    if (actionResponse.error) {
      throw new Error('Promise flow received action error', actionResponse);
    }

    return actionResponse;
  };
};

export const adminFetchIntegrations = () => ({
  [CALL_API]: {
    authenticated: true,
    endpoint: '/v1/integrations',
    schema: [integrationSchema],
    types: [INTEGRATIONS_REQUEST, INTEGRATIONS_SUCCESS, INTEGRATIONS_FAILURE],
  },
});
