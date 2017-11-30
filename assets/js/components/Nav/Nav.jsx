import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { getCurrentUser } from 'selectors';
import { NavLink, withRouter } from 'react-router-dom';
import { logoutUser } from 'actions/sessions';
import Logout from 'components/Auth/Logout';

const propTypes = {
  isAdmin: PropTypes.bool.isRequired,
  isAuthenticated: PropTypes.bool.isRequired,
  onLogoutClick: PropTypes.func.isRequired,
};

const defaultProps = {
  isAdmin: false,
  isAuthenticated: false,
};

const UnauthenticatedNav = () => (
  <ul className="nav-links" role="nav">
    <li>
      <NavLink exact to="/" activeClassName="active">
        home
      </NavLink>
    </li>
    <li>
      <NavLink to="/faq" activeClassName="active">
        faq
      </NavLink>
    </li>
    <li>
      <NavLink to="/pricing" activeClassName="active">
        pricing
      </NavLink>
    </li>
    <li>
      <NavLink to="/support" activeClassName="active">
        support
      </NavLink>
    </li>
    <li>
      <NavLink to="/login" activeClassName="active">
        login
      </NavLink>
    </li>
  </ul>
);

const AuthenticatedNav = ({ isAdmin, onLogoutClick }) => (
  <ul className="nav-links" role="nav">
    <li>
      <NavLink to="/dashboard" activeClassName="active">
        dashboard
      </NavLink>
    </li>
    <li>
      <NavLink to="/messages" activeClassName="active">
        messages
      </NavLink>
    </li>
    <li>
      <NavLink to="/forms" activeClassName="active">
        forms
      </NavLink>
    </li>
    <li>
      <NavLink to="/settings" activeClassName="active">
        settings
      </NavLink>
    </li>
    <li>
      <NavLink to="/support" activeClassName="active">
        support
      </NavLink>
    </li>
    {isAdmin && (
      <li>
        <NavLink to="/admin" activeClassName="active">
          admin
        </NavLink>
      </li>
    )}
    <li>
      <Logout onLogoutClick={onLogoutClick} />
    </li>
  </ul>
);

const Nav = ({ isAdmin, isAuthenticated, onLogoutClick, ...props }) => {
  if (isAuthenticated) {
    return <AuthenticatedNav isAdmin={isAdmin} onLogoutClick={onLogoutClick} />;
  } else {
    return <UnauthenticatedNav />;
  }
};

Nav.propTypes = propTypes;
Nav.defaultProps = defaultProps;

const mapStateToProps = state => {
  const user = getCurrentUser(state);
  const { isAuthenticated } = state.authentication;

  return {
    isAdmin: user && user.is_admin,
    isAuthenticated,
  };
};

const mapDispatchToProps = (dispatch, ownProps) => ({
  onLogoutClick: evt => {
    evt.preventDefault();
    dispatch(logoutUser());
    ownProps.history.push('/');
  },
});

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Nav));
