import { NOTIFICATION_SHOW, NOTIFICATION_HIDE } from 'constants/actionTypes';

let nextNotificationNumericalId = 0;

const showNotification = ({ dismissable, id, key, level, message }) => {
  return {
    type: NOTIFICATION_SHOW,
    dismissable,
    id,
    key,
    level,
    message,
  };
};

export const hideNotification = ({ id, key }) => {
  return {
    type: NOTIFICATION_HIDE,
    id,
    key,
  };
};

export const addNotification = payload => {
  return dispatch => {
    if (!payload.id) {
      payload.id = nextNotificationNumericalId++;
    }

    dispatch(showNotification(payload));

    // Return the notification's id to the caller
    return payload.id;
  };
};

export const addNotificationWithTimeout = payload => {
  return dispatch => {
    if (!payload.id) {
      payload.id = nextNotificationNumericalId++;
    }

    dispatch(showNotification(payload));

    setTimeout(() => {
      dispatch(hideNotification({ id: payload.id }));
    }, payload.hideTimeout || 5000);
  };
};
