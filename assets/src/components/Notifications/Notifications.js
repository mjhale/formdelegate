import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { map } from 'lodash';
import styled from 'styled-components';
import Flash from 'components/Flash';

const propTypes = {
  notifications: PropTypes.array.isRequired,
};

const FlashNotification = styled(Flash)`
  margin-bottom: 1rem;
`;

const Notifications = ({ notifications }) => {
  if (!notifications) return null;

  return (
    <div>
      {notifications.map(notification => {
        return (
          <FlashNotification key={notification.id} type={notification.level}>
            {notification.message}
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

export default connect(mapStateToProps)(Notifications);
