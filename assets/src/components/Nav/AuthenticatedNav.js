import PropTypes from 'prop-types';
import React from 'react';

import Link from 'next/link';
import { NavContainer, NavItem } from 'components/Nav/Nav';

const AuthenticatedNav = ({ isAdmin, onClick }) => {
  return (
    <NavContainer onClick={onClick}>
      <Link href="/dashboard" passHref>
        <NavItem>dashboard</NavItem>
      </Link>
      <Link href="/submissions" passHref>
        <NavItem>submissions</NavItem>
      </Link>
      <Link href="/forms" passHref>
        <NavItem>forms</NavItem>
      </Link>
      <Link href="/account" passHref>
        <NavItem>account</NavItem>
      </Link>
      <Link href="/support" passHref>
        <NavItem>support</NavItem>
      </Link>
      {isAdmin && (
        <Link href="/admin" passHref>
          <NavItem>admin</NavItem>
        </Link>
      )}
      <Link href="/logout" passHref>
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
