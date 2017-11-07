import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { fetchCurrentAccount } from 'actions/accounts';
import { getCurrentAccountId } from 'utils/';
import { Link } from 'react-router-dom';
import { Routes } from 'router';
import Nav from './Nav';
import Notifications from './Notifications';

class App extends React.Component {
  componentDidMount() {
    if (getCurrentAccountId()) this.props.loadCurrentAccount();
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
  loadCurrentAccount: () => {
    dispatch(fetchCurrentAccount());
  },
});

export default connect(null, mapDispatchToProps)(App);
