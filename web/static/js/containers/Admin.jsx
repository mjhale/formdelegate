import React, { PropTypes } from 'react';
import { connect } from 'react-redux';

const propTypes = {
  children: PropTypes.node,
  isAuthenticated: PropTypes.bool.isRequired,
};

const defaultProps = {
  isAuthenticated: false,
};

class AdminContainer extends React.Component {
  render() {
    const { children, isAuthenticated } = this.props;

    return (
      <div className="admin">
        {children}
      </div>
    );
  }
}

AdminContainer.propTypes = propTypes;
AdminContainer.defaultProps = defaultProps;

const mapStateToProps = (state) => {
  const { isAuthenticated } = state.authentication;

  return {
    isAuthenticated,
  };
};

export default connect(mapStateToProps)(AdminContainer);
