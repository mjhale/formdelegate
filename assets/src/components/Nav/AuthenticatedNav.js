import PropTypes from 'prop-types';
import React from 'react';

import Link from 'next/link';
import { NavContainer, NavItem } from 'components/Nav/Nav';

const AuthenticatedNav = ({ isAdmin, onClick }) => {
  return (
    <NavContainer role="navigation" onClick={onClick}>
      <Link href="/dashboard" passHref legacyBehavior>
        <NavItem>dashboard</NavItem>
      </Link>
      <Link href="/submissions" passHref legacyBehavior>
        <NavItem>submissions</NavItem>
      </Link>
      <Link href="/forms" passHref legacyBehavior>
        <NavItem>forms</NavItem>
      </Link>
      <Link href="/account" passHref legacyBehavior>
        <NavItem>account</NavItem>
      </Link>
      <Link href="/support" passHref legacyBehavior>
        <NavItem>support</NavItem>
      </Link>
      {isAdmin && (
        <Link href="/admin" passHref legacyBehavior>
          <NavItem>admin</NavItem>
        </Link>
      )}
      <Link href="/logout" passHref legacyBehavior>
        <NavItem>logout</NavItem>
      </Link>
    </NavContainer>
  );
};

AuthenticatedNav.propTypes = {
  isAdmin: PropTypes.bool.isRequired,
  isFetching: PropTypes.bool.isRequired,
  onClick: PropTypes.func.isRequired,
};

export default AuthenticatedNav;
