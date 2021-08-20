import { combineReducers } from 'redux';
import { indexOf } from 'lodash';

import {
  FORM_REQUEST,
  FORM_SUCCESS,
  FORM_FAILURE,
  FORM_CREATE_REQUEST,
  FORM_CREATE_SUCCESS,
  FORM_CREATE_FAILURE,
  FORM_DELETE_REQUEST,
  FORM_DELETE_SUCCESS,
  FORM_DELETE_FAILURE,
  FORM_UPDATE_REQUEST,
  FORM_UPDATE_SUCCESS,
  FORM_UPDATE_FAILURE,
  FORMS_REQUEST,
  FORMS_SUCCESS,
  FORMS_FAILURE,
} from 'constants/actionTypes';

const allIds = (state = [], action) => {
  switch (action.type) {
    case FORM_CREATE_SUCCESS:
      return [...state, action.payload.result];
    case FORM_DELETE_SUCCESS:
      return state.filter(form => form !== action.id);
    case FORM_SUCCESS:
      return indexOf(state, action.payload.result) > -1
        ? state
        : [...state, action.payload.result];
    case FORMS_SUCCESS:
      return action.payload.result;
    default:
      return state;
  }
};

const isFetching = (state = false, action) => {
  switch (action.type) {
    case FORM_REQUEST:
    case FORM_CREATE_REQUEST:
    case FORM_DELETE_REQUEST:
    case FORM_UPDATE_REQUEST:
    case FORMS_REQUEST:
      return true;

    case FORM_FAILURE:
    case FORM_CREATE_FAILURE:
    case FORM_DELETE_FAILURE:
    case FORM_UPDATE_FAILURE:
    case FORMS_FAILURE:
      return false;

    case FORM_SUCCESS:
    case FORM_CREATE_SUCCESS:
    case FORM_DELETE_SUCCESS:
    case FORM_UPDATE_SUCCESS:
    case FORMS_SUCCESS:
      return false;

    default:
      return state;
  }
};

export default combineReducers({
  allIds,
  isFetching,
});
