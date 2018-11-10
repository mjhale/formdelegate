import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import { addNotification } from 'actions/notifications';
import { fetchCurrentUser } from 'actions/users';
import { isTokenCurrent } from 'utils';

import Routes from 'router';

class App extends React.Component {
  static propTypes = {
    addNotification: PropTypes.func.isRequired,
    fetchCurrentUser: PropTypes.func.isRequired,
  };

  componentDidMount() {
    const encodedJWT = localStorage.getItem('fd_token');

    if (isTokenCurrent(encodedJWT)) {
      this.props.fetchCurrentUser();
    }

    // Show alpha notice
    this.props.addNotification({
      dismissable: false,
      level: 'notice',
      message:
        'Form Delegate is currently in alpha and should be considered unstable.',
    });
  }

  render() {
    return <Routes />;
  }
}

const mapDispatchToProps = {
  addNotification,
  fetchCurrentUser,
};

export default connect(
  null,
  mapDispatchToProps
)(App);
