import PropTypes from 'prop-types';
import React from 'react';
import styled from 'styled-components';
import { connect } from 'react-redux';

import theme from 'constants/theme';
import { hideNotification } from 'actions/notifications';

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
  margin: 1rem 0;
  position: relative;
`;

const NotificationContainer = styled.div`
  box-sizing: border-box;
  margin: 1rem 0;
`;

const Notifications = ({ handleDismissal, notifications }) => {
  if (!Array.isArray(notifications) || notifications.length === 0) {
    return null;
  }

  return (
    <NotificationContainer>
      {/* @TODO: Possibly give each notification its own lifecycle */}
      {notifications.map(notification => {
        return (
          <FlashNotification key={notification.id} type={notification.level}>
            {notification.message}
            {notification.dismissable && (
              <DismissButton
                aria-hidden="true"
                onClick={evt => handleDismissal(notification.id, evt)}
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

Notifications.propTypes = {
  dismissable: PropTypes.bool,
  notifications: PropTypes.array.isRequired,
};

Notifications.defaultProps = {
  dismissable: true,
};

const mapStateToProps = state => ({
  notifications: state.notifications,
});

const mapDispatchToProps = dispatch => ({
  handleDismissal: (notificationId, evt) => {
    evt.preventDefault();
    dispatch(hideNotification(notificationId));
  },
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Notifications);
