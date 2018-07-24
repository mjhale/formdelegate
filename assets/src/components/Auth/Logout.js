import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';

import { logoutUser } from 'actions/sessions';

class Logout extends React.Component {
  static propTypes = {
    history: PropTypes.shape({
      push: PropTypes.func.isRequired,
    }).isRequired,
    logoutUser: PropTypes.func.isRequired,
  };

  componentDidMount() {
    const { logoutUser, history } = this.props;

    logoutUser().then(() => history.push('/'));
  }

  render() {
    return null;
  }
}

const mapDispatchToProps = {
  logoutUser,
};

export default withRouter(
  connect(
    null,
    mapDispatchToProps
  )(Logout)
);
