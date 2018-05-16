import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';

import { logoutUser } from 'actions/sessions';

const propTypes = {
  logoutUser: PropTypes.func.isRequired,
};

class Logout extends React.Component {
  componentDidMount() {
    this.props.logoutUser(logoutUser());
  }

  render() {
    return null;
  }
}

Logout.propTypes = propTypes;

const mapDispatchToProps = (dispatch, ownProps) => ({
  logoutUser: evt => {
    dispatch(logoutUser());
    ownProps.history.push('/');
  },
});

export default withRouter(connect(null, mapDispatchToProps)(Logout));
