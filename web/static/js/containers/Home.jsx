import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import { logoutAccount } from '../actions/sessions';
import Logout from '../components/Logout';

const propTypes = {
  children: PropTypes.node,
  isAuthenticated: PropTypes.bool.isRequired,
  dispatch: PropTypes.func.isRequired,
};

const defaultProps = {
  isAuthenticated: false,
};

const contextTypes = {
  router: React.PropTypes.object.isRequired
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
          <li><Link to="/messages">My Messages</Link></li>
          <li><Link to="/admin/accounts">Accounts</Link></li>
          { !isAuthenticated &&
            <li><Link to="/login">Login</Link></li>
          }
          { isAuthenticated &&
            <li>
              <Logout
                onLogoutClick={() => {
                  dispatch(logoutAccount());
                  this.context.router.push('/');
                }}
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
HomeContainer.contextTypes = contextTypes;

const mapStateToProps = (state) => {
  const { isAuthenticated } = state.authentication;

  return {
    isAuthenticated,
  };
};

export default connect(mapStateToProps)(HomeContainer);
