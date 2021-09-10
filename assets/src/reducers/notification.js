import { NOTIFICATION_SHOW, NOTIFICATION_HIDE } from 'constants/actionTypes';

const notificationReducer = (state = [], action) => {
  switch (action.type) {
    case NOTIFICATION_SHOW:
      return [
        ...state,
        {
          dismissable: action.dismissable,
          id: action.id,
          key: action.key,
          level: action.level,
          message: action.message,
        },
      ];
    case NOTIFICATION_HIDE:
      return state.filter(
        (notification) =>
          (action.id && notification.id !== action.id) ||
          (action.key && notification.key !== action.key)
      );
    default:
      return state;
  }
};

export default notificationReducer;
