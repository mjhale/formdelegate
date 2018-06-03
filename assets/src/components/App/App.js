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
  display: inline-block;
  font-family: 'Lato', sans-serif;
  font-size: 1.5rem;
  font-weight: 900;
  margin: 0;
  padding: 1rem;
  position: relative;
  text-decoration: none;
  z-index: 50;

  &:active {
    color: ${theme.solidWhite};
  }

  ${media.md`
    display: block;
    font-size: 2.5rem;
    font-style: italic;
    line-height: 2.2rem;
    margin: 0 auto;
    max-width: 4em;
    padding: 1.5rem 0;
    text-align: center;
    z-index: auto;

    &:active {
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

    &:hover {
      color: ${theme.solidWhite};
    }
  `};
`;

const NavBar = styled.div`
  background-color: #f76e64;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100%' height='100%' viewBox='0 0 1600 500'%3E%3Cg stroke='%23000' stroke-width='66.7' stroke-opacity='0.01' %3E%3Ccircle fill='%23f76e64' cx='0' cy='0' r='1800'/%3E%3Ccircle fill='%23f0695f' cx='0' cy='0' r='1700'/%3E%3Ccircle fill='%23e9645a' cx='0' cy='0' r='1600'/%3E%3Ccircle fill='%23e35f56' cx='0' cy='0' r='1500'/%3E%3Ccircle fill='%23dc5a51' cx='0' cy='0' r='1400'/%3E%3Ccircle fill='%23d5554c' cx='0' cy='0' r='1300'/%3E%3Ccircle fill='%23cf5048' cx='0' cy='0' r='1200'/%3E%3Ccircle fill='%23c84b43' cx='0' cy='0' r='1100'/%3E%3Ccircle fill='%23c1463e' cx='0' cy='0' r='1000'/%3E%3Ccircle fill='%23bb413a' cx='0' cy='0' r='900'/%3E%3Ccircle fill='%23b43c36' cx='0' cy='0' r='800'/%3E%3Ccircle fill='%23ae3731' cx='0' cy='0' r='700'/%3E%3Ccircle fill='%23a7322d' cx='0' cy='0' r='600'/%3E%3Ccircle fill='%23a12d29' cx='0' cy='0' r='500'/%3E%3Ccircle fill='%239a2824' cx='0' cy='0' r='400'/%3E%3Ccircle fill='%23942320' cx='0' cy='0' r='300'/%3E%3Ccircle fill='%238d1e1c' cx='0' cy='0' r='200'/%3E%3Ccircle fill='%23871818' cx='0' cy='0' r='100'/%3E%3C/g%3E%3C/svg%3E");
  background-attachment: fixed;
  background-size: cover;
  background-position: center;

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
