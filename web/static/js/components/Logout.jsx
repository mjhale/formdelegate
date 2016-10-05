import React, { PropTypes } from 'react';

export default class Logout extends React.Component {
  render() {
    const { onLogoutClick } = this.props;

    return (
      <a href="#"
        onClick={() => onLogoutClick()}
        className="button button-logout">Logout</a>
    );
  }
}

Logout.propTypes = {
  onLogoutClick: PropTypes.func.isRequired
};
