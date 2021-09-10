import styled from 'styled-components';
import React from 'react';
import { darken } from 'polished';
import { useSelector } from 'react-redux';

import theme from 'constants/theme';
import { getCurrentUser } from 'selectors';
import { media } from 'utils/style';
import useUser from 'hooks/useUser';

import AuthenticatedNav from 'components/Nav/AuthenticatedNav';
import NavToggle from 'components/Nav/NavToggle';
import Placeholder from 'components/Placeholder';
import UnauthenticatedNav from 'components/Nav/UnauthenticatedNav';

export const NavContainer = styled.nav`
  background-color: ${darken(0.08, theme.darkCarnation)};
  border-top: 1px solid ${darken(0.1, theme.darkCarnation)};
  box-shadow: 0 0.2rem 0.5rem rgba(0, 0, 0, 0.1);
  overflow: hidden;
  padding: 0;

  ${media.md`
    background-color: transparent;
    border-top: none;
    box-shadow: none;
  `};
`;

export const NavItem = styled('a').attrs({ activeClassName: 'active' })`
  color: ${theme.navTextColor};
  display: block;
  font-family: ${theme.systemFont};
  font-size: 1rem;
  padding: 1rem;
  text-decoration: none;

  &:hover,
  &.${(props) => props.activeClassName} {
    color: ${theme.offWhite};
    transition: all 0.1s;
  }

  &:hover:not(.${(props) => props.activeClassName}) {
    background-color: ${theme.darkCarnation};
    border-left: 0.5rem solid #b9332d;
  }

  &.${(props) => props.activeClassName} {
    background-color: rgba(130, 37, 35, 0.85);
    border-left: 0.5rem solid #b9332d;
  }
`;

const Nav = () => {
  useUser();

  const currentUser = useSelector((state) => getCurrentUser(state));
  const { isAuthenticated, isFetching } = useSelector(
    (state) => state.authentication
  );
  const [isNavVisible, setIsNavVisible] = React.useState(true);
  const isSmallDevice = useSelector((state) => state.browser.lessThan.medium);

  React.useEffect(() => {
    if (isSmallDevice) {
      setIsNavVisible(false);
    } else {
      setIsNavVisible(true);
    }
  }, [isSmallDevice]);

  const handleNavClick = (evt) => {
    evt.preventDefault();
    if (isSmallDevice) {
      setIsNavVisible(false);
    }
  };

  const handleNavToggle = (evt) => {
    evt.preventDefault();
    setIsNavVisible((isNavVisible) => !isNavVisible);
  };

  if (isFetching) {
    return <Placeholder isFetching={isFetching} rows={6} />;
  }

  const navItems = isAuthenticated ? (
    <AuthenticatedNav
      isAdmin={currentUser ? currentUser.is_admin : false}
      isFetching={isFetching}
      onClick={handleNavClick}
    />
  ) : (
    <UnauthenticatedNav onClick={handleNavClick} />
  );

  return (
    <React.Fragment>
      <NavToggle
        handleNavTaggle={handleNavToggle}
        isNavVisible={isNavVisible}
        isSmallDevice={isSmallDevice}
      />
      {isNavVisible ? navItems : null}
    </React.Fragment>
  );
};

export default Nav;
