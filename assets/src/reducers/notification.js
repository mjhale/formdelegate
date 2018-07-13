import { NOTIFICATION_SHOW, NOTIFICATION_HIDE } from 'constants/actionTypes';

export default (state = [], action) => {
  switch (action.type) {
    case NOTIFICATION_SHOW:
      return [
        ...state,
        {
          dismissable: action.dismissable,
          id: action.id,
          level: action.level,
          message: action.message,
        },
      ];
    case NOTIFICATION_HIDE:
      return state.filter(notification => notification.id !== action.id);
    default:
      return state;
  }
};
