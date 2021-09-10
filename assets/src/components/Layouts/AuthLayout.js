import React from 'react';
import styled from 'styled-components';

import theme from 'constants/theme';

import FluidContainer from 'components/FluidContainer';
import Link from 'components/Link';
import { SkipToContent } from './Styled';

const AuthLayoutContainer = styled(FluidContainer)`
  max-width: 500px;
`;

const LogoLink = styled(Link)`
  color: ${theme.carnation};
  display: block;
  font-family: 'Lato', sans-serif;
  font-size: 3rem;
  font-style: italic;
  font-weight: 900;
  line-height: 2.2rem;
  margin: 0 auto;
  max-width: 4em;
  padding: 1.5rem 0;
  text-align: center;
  text-decoration: none;

  &:active,
  &:hover {
    color: ${theme.lightCarnation};
  }
`;

const AuthLayout = (props) => (
  <React.Fragment>
    <SkipToContent href="#site-content">Skip to main content</SkipToContent>
    <LogoLink href="/">form delegate</LogoLink>
    <AuthLayoutContainer id="site-content" role="main">
      {props.children}
    </AuthLayoutContainer>
  </React.Fragment>
);

export default AuthLayout;
