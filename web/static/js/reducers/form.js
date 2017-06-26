import { FORM_REQUEST, FORM_SUCCESS, FORM_FAILURE } from '../constants/actionTypes';
import { FORM_CREATE_REQUEST, FORM_CREATE_SUCCESS, FORM_CREATE_FAILURE } from '../constants/actionTypes';
import { FORM_DELETE_REQUEST, FORM_DELETE_SUCCESS, FORM_DELETE_FAILURE } from '../constants/actionTypes';
import { FORM_UPDATE_REQUEST, FORM_UPDATE_SUCCESS, FORM_UPDATE_FAILURE } from '../constants/actionTypes';
import { FORMS_REQUEST, FORMS_SUCCESS, FORMS_FAILURE } from '../constants/actionTypes';
import { INTEGRATIONS_REQUEST, INTEGRATIONS_SUCCESS, INTEGRATIONS_FAILURE } from '../constants/actionTypes';

export default (state = {
  allIds: [],
  isFetching: false,
}, action) => {
  switch (action.type) {
    case FORM_REQUEST:
    case FORM_CREATE_REQUEST:
    case FORM_DELETE_REQUEST:
    case FORM_UPDATE_REQUEST:
    case FORMS_REQUEST:
    case INTEGRATIONS_REQUEST:
      return Object.assign({}, state, {
        isFetching: true,
      });

    case FORM_CREATE_SUCCESS:
      return {
        ...state,
        allIds: [...state.allIds, action.payload.result],
        isFetching: false,
      };

    case FORM_DELETE_SUCCESS:
      return {
        ...state,
        allIds: state.allIds.filter((form) =>
          form !== action.id,
        ),
        isFetching: false,
      };

    case FORM_DELETE_FAILURE:
    case FORM_FAILURE:
    case FORM_SUCCESS:
    case FORMS_FAILURE:
    case INTEGRATIONS_FAILURE:
    case INTEGRATIONS_SUCCESS:
      return Object.assign({}, state, {
        isFetching: false,
      });

    case FORMS_SUCCESS:
      return Object.assign({}, state, {
        allIds: action.payload.result,
        isFetching: false,
      });
    case FORM_DELETE_REQUEST:

    default:
      return state;
  }
};
