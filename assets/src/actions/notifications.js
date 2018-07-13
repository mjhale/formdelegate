import { NOTIFICATION_SHOW, NOTIFICATION_HIDE } from 'constants/actionTypes';

let nextNotificationid = 0;

const showNotification = ({ dismissable, id, level, message }) => {
  return {
    type: NOTIFICATION_SHOW,
    dismissable,
    id,
    level,
    message,
  };
};

export const hideNotification = id => {
  return {
    type: NOTIFICATION_HIDE,
    id,
  };
};

export const addNotification = payload => {
  return dispatch => {
    payload.id = nextNotificationid++;
    dispatch(showNotification(payload));

    // Return the notification's id to the caller
    return payload.id;
  };
};

export const addNotificationWithTimeout = payload => {
  return dispatch => {
    payload.id = nextNotificationid++;
    dispatch(showNotification(payload));

    setTimeout(() => {
      dispatch(hideNotification(payload.id));
    }, payload.hideTimeout || 5000);
  };
};
