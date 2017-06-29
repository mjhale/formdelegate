import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';

export default function(ComposedComponent) {
  const propTypes = {
    isAuthenticated: PropTypes.bool.isRequired,
  };

  class Authentication extends React.Component {
    componentWillMount() {
      this.redirectIfNotAuthenticated();
    }

    componentWillUpdate(nextProps) {
      this.redirectIfNotAuthenticated();
    }

    redirectIfNotAuthenticated() {
      if (!this.props.isAuthenticated) {
        this.props.history.push('/login');
      }
    }

    render() {
      return <ComposedComponent {...this.props} />;
    }
  }

  Authentication.propTypes = propTypes;

  const mapStateToProps = (state) => {
    const { isAuthenticated } = state.authentication;

    return {
      isAuthenticated,
    };
  };

  return withRouter(connect(mapStateToProps)(Authentication));
}
