import PropTypes from 'prop-types';
import React from 'react';

import Placeholder from 'components/Placeholder';
import { NavContainer, NavItem } from 'components/Nav/Nav';

const AuthenticatedNav = ({ isAdmin, isFetching, onClick }) => {
  if (isFetching) {
    return <Placeholder isFetching={isFetching} rows={6} />;
  }

  return (
    <NavContainer onClick={onClick}>
      <NavItem to="/dashboard">dashboard</NavItem>
      <NavItem to="/submissions">submissions</NavItem>
      <NavItem to="/forms">forms</NavItem>
      <NavItem to="/settings">settings</NavItem>
      <NavItem to="/support">support</NavItem>
      {isAdmin && <NavItem to="/admin">admin</NavItem>}
      <NavItem to="/logout">logout</NavItem>
    </NavContainer>
  );
};

AuthenticatedNav.propTypes = {
  isAdmin: PropTypes.bool.isRequired,
  isFetching: PropTypes.bool.isRequired,
  onClick: PropTypes.func.isRequired,
};

export default AuthenticatedNav;
