import type { ReactNode } from 'react';

import Link from 'next/link';
import Nav from 'components/Nav';
import Notifications from 'components/Notifications';
import { ContentContainer, LogoLink, NavBar, SkipToContent } from './Styled';

type Props = {
  children: ReactNode;
};

const FixedLayout = (props: Props) => (
  <>
    <SkipToContent href="#site-content">Skip to main content</SkipToContent>
    <NavBar>
      <Link href="/" passHref>
        <LogoLink>form delegate</LogoLink>
      </Link>
      <Nav role="navigation" />
    </NavBar>
    <ContentContainer id="site-content" role="main">
      <Notifications margin={'0'} />
      {props.children}
    </ContentContainer>
  </>
);

export default FixedLayout;
