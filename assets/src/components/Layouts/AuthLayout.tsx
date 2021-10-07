import Link from 'next/link';
import styled from 'styled-components';

import theme from 'constants/theme';

import FluidContainer from 'components/FluidContainer';
import { SkipToContent } from './Styled';

const AuthLayoutContainer = styled(FluidContainer)`
  max-width: 500px;
`;

const LogoLink = styled.a`
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
  <>
    <SkipToContent href="#site-content">Skip to main content</SkipToContent>
    <Link href="/" passHref>
      <LogoLink>form delegate</LogoLink>
    </Link>
    <AuthLayoutContainer id="site-content" role="main">
      {props.children}
    </AuthLayoutContainer>
  </>
);

export default AuthLayout;
