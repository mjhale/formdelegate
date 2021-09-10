import type { ReactNode } from 'react';

import { addNotification } from 'actions/notifications';
import styled from 'styled-components';
import theme from 'constants/theme';
import { useAppDispatch } from 'hooks/useRedux';
import useUser from 'hooks/useUser';

import { ContentContainer, LogoLink, NavBar, SkipToContent } from './Styled';
import FluidContainer from 'components/FluidContainer';
import Link from 'next/link';
import Nav from 'components/Nav';
import Notifications from 'components/Notifications';

type Props = {
  children: ReactNode;
};

const AdminNavigation = styled.ul`
  background-color: ${theme.primaryColor};
  display: flex;
  justify-content: flex-start;
  list-style-type: none;
  padding: 1rem;

  & li {
    font-size: 0.8rem;
    text-transform: uppercase;
  }

  & li:not(:first-child) {
    margin-left: 1.5rem;
  }
`;

const AdminLink = styled('a').attrs({ activeClassName: 'active' })`
  color: ${theme.navTextColor};
  text-decoration: none;

  &:hover {
    color: ${theme.offWhite};
  }

  &.${(props) => props.activeClassName} {
    border-bottom: 3px solid ${theme.carnation};
    color: ${theme.offWhite};
  }
`;

const AdminLayout = (props: Props) => {
  const { user, isFetching } = useUser({ redirectTo: '/login' });

  const dispatch = useAppDispatch();

  const showAuthorizationError = () => {
    dispatch(
      addNotification({
        dismissable: false,
        level: 'error',
        message: 'You are not authorized to access this area.',
      })
    );
  };

  if (user && !user.is_admin) {
    showAuthorizationError();
    return null;
  }

  return (
    <>
      <SkipToContent href="#site-content">Skip to main content</SkipToContent>
      <NavBar>
        <Link href="/" passHref>
          <LogoLink>form delegate</LogoLink>
        </Link>
        <Nav role="navigation" />
      </NavBar>
      <ContentContainer id="site-content" role="main">
        <FluidContainer>
          <Notifications margin={'0'} />

          {isFetching && !user ? <div>Loading...</div> : null}

          {!isFetching && user?.is_admin ? (
            <>
              <h1>Administration</h1>
              <AdminNavigation>
                <li>
                  <Link href="/admin" passHref>
                    <AdminLink activeClassName="active">Dashboard</AdminLink>
                  </Link>
                </li>
                <li>
                  <Link href="/admin/users" passHref>
                    <AdminLink activeClassName="active">Users</AdminLink>
                  </Link>
                </li>
              </AdminNavigation>
              {props.children}
            </>
          ) : null}
        </FluidContainer>
      </ContentContainer>
    </>
  );
};

export default AdminLayout;
