import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { Routes } from '../router';
import Nav from './Nav';

const propTypes = {
  isAuthenticated: PropTypes.bool,
};

class AppContainer extends React.Component {
  render() {
    const { children, isAuthenticated } = this.props;

    return (
      <div className="home">
        <nav className="navigation">
          <Link to="/" className="logo">
            form delegate
          </Link>
          <Nav isAuthenticated={isAuthenticated} />
        </nav>
        <div className="content-container">
          <div className="content">
            <Routes />
          </div>
        </div>
      </div>
    );
  }
}

AppContainer.propTypes = propTypes;

const mapStateToProps = state => {
  const { isAuthenticated } = state.authentication;

  return {
    isAuthenticated,
  };
};

export default connect(mapStateToProps)(AppContainer);
