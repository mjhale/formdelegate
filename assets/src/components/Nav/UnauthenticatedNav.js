import React from 'react';

import Link from 'next/link';
import { NavContainer, NavItem } from 'components/Nav/Nav';

const UnauthenticatedNav = ({ onClick }) => (
  <NavContainer onClick={onClick}>
    <Link href="/" passHref>
      <NavItem>home</NavItem>
    </Link>
    <Link href="/faq" passHref>
      <NavItem>faq</NavItem>
    </Link>
    <Link href="/pricing" passHref>
      <NavItem>pricing</NavItem>
    </Link>
    <Link href="/support" passHref>
      <NavItem>support</NavItem>
    </Link>

    <Link href="/login" passHref>
      <NavItem>sign in</NavItem>
    </Link>
  </NavContainer>
);

export default UnauthenticatedNav;
