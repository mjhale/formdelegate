import {
  LOGIN_REQUEST,
  LOGIN_SUCCESS,
  LOGIN_FAILURE,
} from '../constants/actionTypes';
import {
  LOGOUT_REQUEST,
  LOGOUT_SUCCESS,
  LOGOUT_FAILURE,
} from '../constants/actionTypes';

/* @TODO Check if fd_token is expired. */
export default (
  state = {
    isAuthenticated: localStorage.getItem('fd_token') ? true : false,
    isFetching: false,
    errorMessage: '',
  },
  action
) => {
  switch (action.type) {
    case LOGIN_FAILURE:
      return Object.assign({}, state, {
        isAuthenticated: false,
        isFetching: false,
        errorMessage: action.error,
      });
    case LOGIN_REQUEST:
      return Object.assign({}, state, {
        isAuthenticated: false,
        isFetching: true,
      });
    case LOGIN_SUCCESS:
      return Object.assign({}, state, {
        isAuthenticated: true,
        isFetching: false,
      });
    case LOGOUT_FAILURE:
      return Object.assign({}, state, {
        isAuthenticated: false,
        isFetching: false,
        errorMessage: action.error,
      });
    case LOGOUT_REQUEST:
      return Object.assign({}, state, {
        isFetching: true,
      });
    case LOGOUT_SUCCESS:
      return Object.assign({}, state, {
        isAuthenticated: false,
        isFetching: false,
      });
    default:
      return state;
  }
};
