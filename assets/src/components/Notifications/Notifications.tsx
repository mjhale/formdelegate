import styled from 'styled-components';
import { useSelector } from 'react-redux';

import theme from 'constants/theme';
import { hideNotification } from 'actions/notifications';
import { useAppDispatch, useAppSelector } from 'hooks/useRedux';

import Flash from 'components/Flash';

const DismissButton = styled.button`
  background: 0 0;
  border: 0;
  color: ${theme.mineBlack};
  cursor: pointer;
  font-size: 1rem;
  font-weight: 700;
  line-height: 1;
  position: absolute;
  right: 0;
  text-shadow: 0 1px 0 #fff;
  top: 0.1rem;
`;

const FlashNotification = styled(Flash)`
  margin: ${(props) => props.margin || '1rem 0'};
  position: relative;
`;

const NotificationContainer = styled.div<{ margin?: string }>`
  box-sizing: border-box;
  margin: ${(props) => props.margin || '1rem 0'};
`;

const Notifications = ({ margin }: { margin?: string }) => {
  const dispatch = useAppDispatch();
  const notifications = useAppSelector((state) => state.notifications);

  const handleDismissal = (notificationId: number, evt) => {
    evt.preventDefault();
    dispatch(hideNotification({ id: notificationId }));
  };

  if (!Array.isArray(notifications) || notifications.length === 0) {
    return null;
  }

  return (
    <NotificationContainer margin={margin}>
      {notifications.map((notification) => {
        return (
          <FlashNotification
            key={notification.id}
            margin={margin}
            type={notification.level}
          >
            {notification.message}
            {notification.dismissable && (
              <DismissButton
                aria-hidden="true"
                onClick={(evt) => handleDismissal(notification.id, evt)}
              >
                ×
              </DismissButton>
            )}
          </FlashNotification>
        );
      })}
    </NotificationContainer>
  );
};

export default Notifications;
