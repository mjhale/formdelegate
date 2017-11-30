import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { fetchCurrentUser } from 'actions/users';
import { isTokenCurrent } from 'utils';
import { Link } from 'react-router-dom';
import { Routes } from 'router';
import Nav from 'components/Nav';
import Notifications from 'components/Notifications';

class App extends React.Component {
  componentDidMount() {
    const encodedJWT = localStorage.getItem('fd_token');
    if (isTokenCurrent(encodedJWT)) {
      this.props.loadCurrentUser();
    }
  }

  render() {
    return (
      <div className="home">
        <nav className="navigation">
          <Link to="/" className="logo">
            form delegate
          </Link>
          <Nav />
        </nav>
        <div className="content-container">
          <Notifications />
          <Routes />
        </div>
      </div>
    );
  }
}

const mapDispatchToProps = dispatch => ({
  loadCurrentUser: () => {
    dispatch(fetchCurrentUser());
  },
});

export default connect(null, mapDispatchToProps)(App);
