import { NOTIFICATION_SHOW, NOTIFICATION_HIDE } from '../constants/actionTypes';

const showNotification = ({ id, level, message }) => {
  return {
    type: NOTIFICATION_SHOW,
    id,
    level,
    message,
  };
};

const hideNotification = id => {
  return {
    type: NOTIFICATION_HIDE,
    id,
  };
};

let nextNotificationid = 0;
export const addNotificationWithTimeout = payload => {
  return dispatch => {
    payload.id = nextNotificationid++;
    dispatch(showNotification(payload));
    setTimeout(() => {
      dispatch(hideNotification(payload.id));
    }, payload.hideTimeout || 5000);
  };
};
