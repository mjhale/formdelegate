import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { map } from 'lodash';
import classNames from 'classnames';

const propTypes = {
  notifications: PropTypes.array.isRequired,
};

class NotificationsContainer extends React.Component {
  render() {
    const { notifications } = this.props;

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
  }
}

NotificationsContainer.propTypes = propTypes;

const mapStateToProps = state => ({
  notifications: state.notifications,
});

export default connect(mapStateToProps)(NotificationsContainer);
