import React from 'react';

import FluidContainer from 'components/FluidContainer';
import Nav from 'components/Nav';
import Notifications from 'components/Notifications';
import { ContentContainer, LogoLink, NavBar, SkipToContent } from './Styled';

const FluidLayout = props => (
  <React.Fragment>
    <SkipToContent href="#site-content">Skip to main content</SkipToContent>
    <NavBar>
      <LogoLink to="/">form delegate</LogoLink>
      <Nav role="navigation" />
    </NavBar>
    <ContentContainer id="site-content" role="main">
      <FluidContainer>
        <Notifications />
        {props.children}
      </FluidContainer>
    </ContentContainer>
  </React.Fragment>
);

export default FluidLayout;
