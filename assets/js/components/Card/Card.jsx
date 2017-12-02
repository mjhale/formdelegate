import React from 'react';
import styled from 'styled-components';
import theme from 'constants/theme';

const CardContainer = styled.div`
  border: 1px solid ${theme.borderColor};
  border-bottom-width: 2px;
  border-radius: 0 0 3px 3px;
  margin-bottom: 0.5rem;
`;

const Header = styled.div`
  background: ${theme.offWhite};
  border-bottom: 1px solid ${theme.borderColor};
  color: ${theme.headerTextColor};
  display: block;
  font-size: 0.8rem;
  font-weight: 700;
  margin: 0;
  padding: 0.5rem;
  text-transform: uppercase;
`;

const Content = styled.div`
  background: ${theme.solidWhite};
  padding: 0.5rem;
`;

const Card = props => (
  <CardContainer>
    {props.header && <Header>{props.header}</Header>}
    <Content>{props.children}</Content>
  </CardContainer>
);

export default Card;