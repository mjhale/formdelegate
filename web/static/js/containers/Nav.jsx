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

class NavContainer extends React.Component {
  render() {
    const { children, isAuthenticated, dispatch } = this.props;

    return (
      <ul className="nav" role="nav">
        <li><Link to="/">Home</Link></li>
        <li><Link to="/messages">My Messages</Link></li>
        <li><Link to="/forms">Forms</Link></li>
        <li><Link to="/forms">Integrations</Link></li>
        <li><Link to="/admin/accounts">Accounts</Link></li>
        { !isAuthenticated &&
          <li><Link to="/login">Login</Link></li>
        }
        { isAuthenticated &&
          <li>
            <Logout
              {...this.props}
            />
          </li>
        }
      </ul>
    );
  }
}

NavContainer.propTypes = propTypes;
NavContainer.defaultProps = defaultProps;
NavContainer.contextTypes = contextTypes;

const mapStateToProps = (state) => {
  const { isAuthenticated } = state.authentication;

  return {
    isAuthenticated,
  };
};

const mapDispatchToProps = (dispatch) => ({
  onLogoutClick() {
    dispatch(logoutAccount());
    browserHistory.push(`/`);
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(NavContainer);
