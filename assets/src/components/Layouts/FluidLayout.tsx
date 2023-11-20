import type { ReactNode } from 'react';

import FluidContainer from 'components/FluidContainer';
import Link from 'next/link';
import Nav from 'components/Nav';
import Notifications from 'components/Notifications';
import { ContentContainer, LogoLink, NavBar, SkipToContent } from './Styled';

type Props = {
  children: ReactNode;
};

const FluidLayout = (props: Props) => (
  <>
    <SkipToContent href="#site-content">Skip to main content</SkipToContent>
    <NavBar>
      <Link href="/" passHref legacyBehavior>
        <LogoLink>form delegate</LogoLink>
      </Link>
      <Nav role="navigation" />
    </NavBar>
    <ContentContainer id="site-content" role="main">
      <FluidContainer>
        <Notifications />
        {props.children}
      </FluidContainer>
    </ContentContainer>
  </>
);

export default FluidLayout;
