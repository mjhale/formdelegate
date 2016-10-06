import React, { PropTypes } from 'react';
import { connect } from 'react-redux';

export default function(ComposedComponent) {
  const propTypes = {
    isAuthenticated: PropTypes.bool.isRequired,
  };

  const contextTypes = {
    router: React.PropTypes.object.isRequired
  };

  class Authentication extends React.Component {
    componentWillMount() {
      if(!this.props.isAuthenticated) {
        this.context.router.push('/login');
      }
    }

    componentWillUpdate(nextProps) {
      if(!nextProps.isAuthenticated) {
        this.context.router.push('/login');
      }
    }

    render() {
      return <ComposedComponent {...this.props} />;
    }
  }

  Authentication.contextTypes = contextTypes;
  Authentication.propTypes = propTypes;

  const mapStateToProps = (state) => {
    const { isAuthenticated } = state.authentication;

    return {
      isAuthenticated,
    };
  };

  return connect(mapStateToProps)(Authentication);
}
