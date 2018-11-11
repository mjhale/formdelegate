import React from 'react';

import Nav from 'components/Nav';
import Notifications from 'components/Notifications';
import { ContentContainer, LogoLink, NavBar, SkipToContent } from './Styled';

const FixedLayout = props => (
  <React.Fragment>
    <SkipToContent href="#site-content">Skip to main content</SkipToContent>
    <NavBar>
      <LogoLink to="/">form delegate</LogoLink>
      <Nav role="navigation" />
    </NavBar>
    <ContentContainer id="site-content" role="main">
      <Notifications margin={'0'} />
      {props.children}
    </ContentContainer>
  </React.Fragment>
);

export default FixedLayout;
