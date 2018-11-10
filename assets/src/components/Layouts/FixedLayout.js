import React from 'react';

import Nav from 'components/Nav';
import Notifications from 'components/Notifications';
import { ContentContainer, LogoLink, NavBar } from './Styled';

const FixedLayout = props => (
  <React.Fragment>
    <NavBar>
      <LogoLink to="/">form delegate</LogoLink>
      <Nav />
    </NavBar>
    <ContentContainer>
      <Notifications margin={'0'} />
      {props.children}
    </ContentContainer>
  </React.Fragment>
);

export default FixedLayout;
