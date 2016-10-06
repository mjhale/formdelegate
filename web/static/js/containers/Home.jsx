import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';

import Logout from '../components/Logout';
import { logoutAccount } from '../actions/sessions';

const propTypes = {
  children: PropTypes.node,
  isAuthenticated: PropTypes.bool.isRequired,
  dispatch: PropTypes.func.isRequired,
};

const defaultProps = {
  isAuthenticated: false,
};

class HomeContainer extends React.Component {
  render() {
    const { children, isAuthenticated, dispatch } = this.props;

    return (
      <div className="welcome">
        <div className="logo">Form Delegate</div>
        <ul className="nav" role="nav">
          <li><Link to="/">Home</Link></li>
          <li><Link to="/about">About</Link></li>
          <li><Link to="/accounts">Accounts</Link></li>
          { !isAuthenticated &&
            <li><Link to="/login">Login</Link></li>
          }
          { isAuthenticated &&
            <li>
              <Logout
                onLogoutClick={() => dispatch(logoutAccount())}
              />
            </li>
          }
        </ul>
        <div className="content">
          {children}
        </div>
      </div>
    );
  }
}

HomeContainer.propTypes = propTypes;
HomeContainer.defaultProps = defaultProps;

const mapStateToProps = (state) => {
  const { isAuthenticated } = state.authentication;

  return {
    isAuthenticated,
  };
};

export default connect(mapStateToProps)(HomeContainer);
