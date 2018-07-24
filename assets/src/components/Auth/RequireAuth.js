import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';

export default function(ComposedComponent) {
  class Authentication extends React.Component {
    static propTypes = {
      isAuthenticated: PropTypes.bool.isRequired,
      history: PropTypes.shape({
        push: PropTypes.func.isRequired,
      }).isRequired,
    };

    redirectIfNotAuthenticated() {
      const { history, isAuthenticated } = this.props;

      if (!isAuthenticated) {
        history.push('/login');
      }
    }

    componentWillMount() {
      this.redirectIfNotAuthenticated();
    }

    componentWillUpdate(nextProps) {
      this.redirectIfNotAuthenticated();
    }

    render() {
      return <ComposedComponent {...this.props} />;
    }
  }

  const mapStateToProps = state => {
    const { isAuthenticated } = state.authentication;

    return {
      isAuthenticated,
    };
  };

  return withRouter(connect(mapStateToProps)(Authentication));
}
