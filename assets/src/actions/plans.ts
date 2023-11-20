import { CALL_API } from 'middleware/api';
import { planSchema } from 'schema';

// action type constants
import {
  PLANS_REQUEST,
  PLANS_SUCCESS,
  PLANS_FAILURE,
} from 'constants/actionTypes';

export const fetchPlans = () => ({
  [CALL_API]: {
    authenticated: true,
    directApiCall: false,
    endpoint: '/v1/plans',
    schema: [planSchema],
    types: [PLANS_REQUEST, PLANS_SUCCESS, PLANS_FAILURE],
  },
});
