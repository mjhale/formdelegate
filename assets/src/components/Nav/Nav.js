import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { connect } from 'react-redux';
import { getCurrentUser } from 'selectors';
import { NavLink, withRouter } from 'react-router-dom';
import { logoutUser } from 'actions/sessions';
import theme from 'constants/theme';

const propTypes = {
  isAdmin: PropTypes.bool.isRequired,
  isAuthenticated: PropTypes.bool.isRequired,
  onLogoutClick: PropTypes.func.isRequired,
};

const defaultProps = {
  isAdmin: false,
  isAuthenticated: false,
};

const NavContainer = styled.nav`
  overflow: hidden;
  padding: 0;
`;

const NavItem = styled(NavLink).attrs({ activeClassName: 'active' })`
  color: ${theme.navTextColor};
  display: block;
  font-family: ${theme.systemFont};
  font-size: 1rem;
  padding: 1rem;
  text-decoration: none;

  &:hover,
  &.${props => props.activeClassName} {
    color: ${theme.offWhite};
    transition: all 0.1s;
  }

  &:hover:not(.${props => props.activeClassName}) {
    background-color: ${theme.navHighlightColor};
    border-left: 0.5rem solid ${theme.lightCarnation};
  }

  &.${props => props.activeClassName} {
    background-color: ${theme.navHighlightColor};
    border-left: 0.5rem solid ${theme.darkCarnation};
  }
`;

const UnauthenticatedNav = () => (
  <NavContainer>
    <NavItem exact to="/">
      home
    </NavItem>
    <NavItem to="/faq">faq</NavItem>
    <NavItem to="/pricing">pricing</NavItem>
    <NavItem to="/support">support</NavItem>
    <NavItem to="/login">login</NavItem>
  </NavContainer>
);

const AuthenticatedNav = ({ isAdmin, onLogoutClick }) => (
  <NavContainer>
    <NavItem to="/dashboard">dashboard</NavItem>
    <NavItem to="/messages">messages</NavItem>
    <NavItem to="/forms">forms</NavItem>
    <NavItem to="/settings">settings</NavItem>
    <NavItem to="/support">support</NavItem>
    {isAdmin && <NavItem to="/admin">admin</NavItem>}
    <NavItem to="/logout" onClick={onLogoutClick}>
      logout
    </NavItem>
  </NavContainer>
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
