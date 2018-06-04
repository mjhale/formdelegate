import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import styled from 'styled-components';

import { hideNotification } from 'actions/notifications';
import theme from 'constants/theme';

import Flash from 'components/Flash';

const propTypes = {
  notifications: PropTypes.array.isRequired,
};

const DismissNotification = styled.button`
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
  margin-bottom: 1rem;
  position: relative;
`;

const Notifications = ({ handleDismissal, notifications }) => {
  if (!notifications) return null;

  return (
    <div>
      {notifications.map(notification => {
        return (
          <FlashNotification key={notification.id} type={notification.level}>
            {notification.message}
            <DismissNotification
              aria-hidden="true"
              onClick={evt => handleDismissal(notification.id, evt)}
            >
              ×
            </DismissNotification>
          </FlashNotification>
        );
      })}
    </div>
  );
};

Notifications.propTypes = propTypes;

const mapStateToProps = state => ({
  notifications: state.notifications,
});

const mapDispatchToProps = dispatch => ({
  handleDismissal: (notificationId, evt) => {
    evt.preventDefault();
    dispatch(hideNotification(notificationId));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(Notifications);
