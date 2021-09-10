import type { ReactNode } from 'react';
import type { ThunkAction, ThunkDispatch } from 'redux-thunk';
import type { AppThunk } from 'hooks/useRedux';

import { NOTIFICATION_SHOW, NOTIFICATION_HIDE } from 'constants/actionTypes';

let nextNotificationNumericalId = 0;

type NotificationPayload = {
  dismissable?: boolean;
  id?: number;
  hideTimeout?: number;
  key?: string;
  level: string;
  message: string | ReactNode;
};

const showNotification = ({
  dismissable,
  id,
  key,
  level,
  message,
}: NotificationPayload) => {
  return {
    type: NOTIFICATION_SHOW,
    dismissable,
    id,
    key,
    level,
    message,
  };
};

export const hideNotification = ({
  id,
  key,
}: {
  id?: number;
  key?: string;
}) => {
  return {
    type: NOTIFICATION_HIDE,
    id,
    key,
  };
};

export const addNotification = (payload) => {
  return (dispatch) => {
    if (!payload.id) {
      payload.id = nextNotificationNumericalId++;
    }

    dispatch(showNotification(payload));

    // Return the notification's id to the caller
    return payload.id;
  };
};

export const addNotificationWithTimeout = (
  payload: NotificationPayload
): AppThunk => {
  return (dispatch) => {
    if (!payload.id) {
      payload.id = nextNotificationNumericalId++;
    }

    dispatch(showNotification(payload));

    setTimeout(() => {
      dispatch(hideNotification({ id: payload.id }));
    }, payload.hideTimeout || 5000);
  };
};
