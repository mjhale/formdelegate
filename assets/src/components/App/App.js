import PropTypes from 'prop-types';
import React from 'react';
import Routes from 'router';
import styled, { keyframes } from 'styled-components';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import theme from 'constants/theme';
import { fetchCurrentUser } from 'actions/users';
import { isTokenCurrent } from 'utils';
import { media } from 'utils/style';

import Nav from 'components/Nav';

const ContentContainer = styled.div`
  ${media.md`
    min-height: 100%;
    padding-left: 250px;

    &::after {
      clear: both;
      content: '';
      display: block;
    }
  `};
`;

const LogoLink = styled(Link)`
  color: ${theme.logoColor};
  display: block;
  font-family: 'Lato', sans-serif;
  font-size: 1.5rem;
  font-weight: 900;
  margin: 0;
  padding: 1rem;
  text-decoration: none;

  &:hover {
    color: ${theme.solidWhite};
  }

  ${media.md`
    font-size: 2.5rem;
    font-style: italic;
    line-height: 2.2rem;
    margin: 0 auto;
    max-width: 4em;
    padding: 1.5rem 0;
    text-align: center;

    &:hover {
      animation: ${keyframes`
        0%,
        100% {
          transform: scale(1);
        }

        50% {
          transform: scale(1.25);
        }
      `} 0.15s linear 1;
    }
  `};
`;

const NavBar = styled.div`
  background-color: ${theme.primaryColor};

  ${media.md`
    bottom: 0;
    left: 0;
    position: fixed;
    top: 0;
    width: 250px;
  `};
`;

const propTypes = {
  loadCurrentUser: PropTypes.func.isRequired,
};

class App extends React.Component {
  componentDidMount() {
    const encodedJWT = localStorage.getItem('fd_token');
    if (isTokenCurrent(encodedJWT)) {
      this.props.loadCurrentUser();
    }
  }

  render() {
    return (
      <div>
        <NavBar>
          <LogoLink to="/">form delegate</LogoLink>
          <Nav />
        </NavBar>
        <ContentContainer>
          <Routes />
        </ContentContainer>
      </div>
    );
  }
}

App.propTypes = propTypes;

const mapDispatchToProps = dispatch => ({
  loadCurrentUser: () => {
    dispatch(fetchCurrentUser());
  },
});

export default connect(null, mapDispatchToProps)(App);
