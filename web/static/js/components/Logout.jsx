import React from 'react';
import PropTypes from 'prop-types';

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

const Logout = ({ onLogoutClick, logoutText, className, to }) => (
  <a className={className} href={to} onClick={onLogoutClick}>
    {logoutText}
  </a>
);

Logout.propTypes = propTypes;
Logout.defaultProps = defaultProps;

export default Logout;
