import React from 'react';

import FluidContainer from 'components/FluidContainer';
import Nav from 'components/Nav';
import Notifications from 'components/Notifications';
import { ContentContainer, LogoLink, NavBar } from './Styled';

const FluidLayout = props => (
  <React.Fragment>
    <NavBar>
      <LogoLink to="/">form delegate</LogoLink>
      <Nav />
    </NavBar>
    <ContentContainer>
      <FluidContainer>
        <Notifications />
        {props.children}
      </FluidContainer>
    </ContentContainer>
  </React.Fragment>
);

export default FluidLayout;
