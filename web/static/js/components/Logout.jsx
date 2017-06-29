import React, { PropTypes } from 'react';

const propTypes = {
  className: PropTypes.string,
  onLogoutClick: PropTypes.func.isRequired,
  logoutText: PropTypes.string.isRequired,
  to: PropTypes.string.isRequired,
};

const defaultProps = {
  logoutText: 'logout',
  to: '/',
};

export default class Logout extends React.Component {
  render() {
    const { onLogoutClick, logoutText, className, to } = this.props;

    return (
      <a className={className} href={to} onClick={onLogoutClick}>
        {logoutText}
      </a>
    );
  }
}

Logout.propTypes = propTypes;
Logout.defaultProps = defaultProps;
