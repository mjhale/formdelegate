import React from 'react';

import { NavContainer, NavItem } from 'components/Nav/Nav';

const UnauthenticatedNav = ({ onClick }) => (
  <NavContainer onClick={onClick}>
    <NavItem exact to="/">
      home
    </NavItem>
    <NavItem to="/faq">faq</NavItem>
    <NavItem to="/pricing">pricing</NavItem>
    <NavItem to="/support">support</NavItem>
    <NavItem to="/login">sign in</NavItem>
  </NavContainer>
);

export default UnauthenticatedNav;
