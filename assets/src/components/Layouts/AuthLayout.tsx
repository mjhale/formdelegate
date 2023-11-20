import { createGlobalStyle } from 'styled-components';
import Link from 'next/link';
import styled from 'styled-components';

import theme from 'constants/theme';

import FluidContainer from 'components/FluidContainer';
import { SkipToContent } from './Styled';

const AuthLayoutContainer = styled(FluidContainer)`
  max-width: 500px;
`;

const LogoLink = styled.a`
  color: ${theme.offWhite};
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
    color: ${theme.solidWhite};
  }
`;

const GlobalStyle = createGlobalStyle`
  body {
    background-color: ${theme.lightCarnation} !important;
  }
`;

const AuthLayout = (props) => (
  <>
    <GlobalStyle />
    <SkipToContent href="#site-content">Skip to main content</SkipToContent>
    <Link href="/" passHref legacyBehavior>
      <LogoLink>form delegate</LogoLink>
    </Link>
    <AuthLayoutContainer id="site-content" role="main">
      {props.children}
    </AuthLayoutContainer>
  </>
);

export default AuthLayout;
