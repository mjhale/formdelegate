import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';

const propTypes = {
  children: React.PropTypes.node,
};

class HomeContainer extends React.Component {
  render() {
    const { children } = this.props;

    return (
      <div className="welcome">
        <div className="logo">Form Delegate</div>
        <ul className="nav" role="nav">
          <li><Link to="/">Home</Link></li>
          <li><Link to="/about">About</Link></li>
          <li><Link to="/accounts">Accounts</Link></li>
          <li><Link to="/login">Login</Link></li>
        </ul>
        <div className="content">
          {children}
        </div>
      </div>
    );
  }
}

HomeContainer.propTypes = propTypes;

export default HomeContainer;
