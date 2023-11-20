import React from 'react';

import Link from 'next/link';
import { NavContainer, NavItem } from 'components/Nav/Nav';

const UnauthenticatedNav = ({ onClick }) => (
  <NavContainer role="navigation" onClick={onClick}>
    <Link href="/" passHref legacyBehavior>
      <NavItem>home</NavItem>
    </Link>
    <Link href="/faq" passHref legacyBehavior>
      <NavItem>faq</NavItem>
    </Link>
    <Link href="/pricing" passHref legacyBehavior>
      <NavItem>pricing</NavItem>
    </Link>
    <Link href="/support" passHref legacyBehavior>
      <NavItem>support</NavItem>
    </Link>

    <Link href="/login" passHref legacyBehavior>
      <NavItem>sign in</NavItem>
    </Link>
  </NavContainer>
);

export default UnauthenticatedNav;
