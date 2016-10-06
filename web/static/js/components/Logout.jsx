import React, { PropTypes } from 'react';

export default class Logout extends React.Component {
  render() {
    const { onLogoutClick, logoutText, className, to } = this.props;

    return (
      <a href={to}
        onClick={() => {
          onLogoutClick();
        }}
        className={className}
      >
        {logoutText}
      </a>
    );
  }
}

Logout.propTypes = {
  className: PropTypes.string,
  onLogoutClick: PropTypes.func.isRequired,
  logoutText: PropTypes.string.isRequired,
  to: PropTypes.string.isRequired,
};

Logout.defaultProps = {
  logoutText: 'Logout',
  to: '/',
};
