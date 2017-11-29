import { CALL_API } from 'middleware/api';
import { integrationSchema } from 'schema';

// action type constants
import {
  INTEGRATION_REQUEST,
  INTEGRATION_SUCCESS,
  INTEGRATION_FAILURE,
  INTEGRATIONS_REQUEST,
  INTEGRATIONS_SUCCESS,
  INTEGRATIONS_FAILURE,
} from 'constants/actionTypes';

export const fetchIntegrations = () => ({
  [CALL_API]: {
    authenticated: true,
    endpoint: 'integrations',
    schema: [integrationSchema],
    types: [INTEGRATIONS_REQUEST, INTEGRATIONS_SUCCESS, INTEGRATIONS_FAILURE],
  },
});

export const adminFetchIntegration = integrationId => ({
  [CALL_API]: {
    authenticated: true,
    endpoint: `admin/integrations/${integrationId}`,
    schema: integrationSchema,
    types: [INTEGRATION_REQUEST, INTEGRATION_SUCCESS, INTEGRATION_FAILURE],
  },
});

export const adminFetchIntegrations = () => ({
  [CALL_API]: {
    authenticated: true,
    endpoint: 'admin/integrations',
    schema: [integrationSchema],
    types: [INTEGRATIONS_REQUEST, INTEGRATIONS_SUCCESS, INTEGRATIONS_FAILURE],
  },
});
