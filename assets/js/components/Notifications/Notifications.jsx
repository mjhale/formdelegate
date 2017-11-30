import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { map } from 'lodash';
import classNames from 'classnames';

const propTypes = {
  notifications: PropTypes.array.isRequired,
};

const Notifications = ({ notifications }) => {
  if (!notifications) return null;

  return (
    <div className="notifications">
      {notifications.map(notification => {
        const classes = classNames(
          `flash-${notification.level}`,
          'notification'
        );

        return (
          <div className={classes} key={notification.id}>
            {notification.message} test
          </div>
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
