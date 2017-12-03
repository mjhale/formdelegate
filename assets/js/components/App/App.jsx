import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { fetchCurrentUser } from 'actions/users';
import { isTokenCurrent } from 'utils';
import { Link } from 'react-router-dom';
import Routes from 'router';
import styled, { keyframes } from 'styled-components';
import theme from 'constants/theme';
import Nav from 'components/Nav';

const ContentContainer = styled.div`
  display: block;
  min-height: 100%;
  padding-left: 250px;

  &::after {
    clear: both;
    content: '';
    display: block;
  }
`;

const Home = styled.div`
  box-sizing: border-box;
  display: table;
  height: 100%;
  overflow-x: hidden;
  table-layout: fixed;
  width: 100%;
`;

const LogoLink = styled(Link)`
  color: ${theme.logoColor};
  display: block;
  font-family: 'Lato', sans-serif;
  font-size: 2.5rem;
  font-style: italic;
  font-weight: 900;
  line-height: 2.2rem;
  margin: 0 auto;
  max-width: 4em;
  padding: 1.5rem 0;
  text-align: center;
  text-decoration: none;

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
    color: ${theme.solidWhite};
  }
`;

const NavBar = styled.div`
  background-color: ${theme.primaryColor};
  bottom: 0;
  display: block;
  left: 0;
  position: fixed;
  top: 0;
  width: 250px;
`;

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

const mapDispatchToProps = dispatch => ({
  loadCurrentUser: () => {
    dispatch(fetchCurrentUser());
  },
});

export default connect(null, mapDispatchToProps)(App);
