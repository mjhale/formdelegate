import PropTypes from 'prop-types';
import styled from 'styled-components/macro';
import React from 'react';
import { connect } from 'react-redux';
import { darken } from 'polished';
import { NavLink, withRouter } from 'react-router-dom';

import theme from 'constants/theme';
import { getCurrentUser } from 'selectors';
import { media } from 'utils/style';

import AuthenticatedNav from 'components/Nav/AuthenticatedNav';
import NavToggle from 'components/Nav/NavToggle';
import UnauthenticatedNav from 'components/Nav/UnauthenticatedNav';

export const NavContainer = styled.nav`
  background-color: ${darken(0.08, theme.darkCarnation)};
  border-top: 1px solid ${darken(0.1, theme.darkCarnation)};
  box-shadow: 0 0.2rem 0.5rem rgba(0, 0, 0, 0.1);
  overflow: hidden;
  padding: 0;

  ${media.md`
    background-color: transparent;
    border-top: none;
    box-shadow: none;
  `};
`;

export const NavItem = styled(NavLink).attrs({ activeClassName: 'active' })`
  color: ${theme.navTextColor};
  display: block;
  font-family: ${theme.systemFont};
  font-size: 1rem;
  padding: 1rem;
  text-decoration: none;

  &:hover,
  &.${props => props.activeClassName} {
    color: ${theme.offWhite};
    transition: all 0.1s;
  }

  &:hover:not(.${props => props.activeClassName}) {
    background-color: ${theme.darkCarnation};
    border-left: 0.5rem solid #b9332d;
  }

  &.${props => props.activeClassName} {
    background-color: rgba(130, 37, 35, 0.85);
    border-left: 0.5rem solid #b9332d;
  }
`;

class Nav extends React.Component {
  static propTypes = {
    currentUser: PropTypes.object,
    isAuthenticated: PropTypes.bool.isRequired,
    isFetching: PropTypes.bool.isRequired,
    isSmallDevice: PropTypes.bool.isRequired,
  };

  static defaultProps = {
    isAuthenticated: false,
  };

  state = { isNavVisible: true };

  componentDidMount() {
    const { isSmallDevice } = this.props;

    if (isSmallDevice) {
      this.setState({
        isNavVisible: false,
      });
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.isSmallDevice !== this.props.isSmallDevice) {
      if (this.props.isSmallDevice) {
        this.setState({ isNavVisible: false });
      } else {
        this.setState({ isNavVisible: true });
      }
    }
  }

  handleNavClick = evt => {
    evt.preventDefault();
    if (this.props.isSmallDevice) {
      this.setState(prevState => ({
        isNavVisible: false,
      }));
    }
  };

  handleNavToggle = evt => {
    evt.preventDefault();
    this.setState(prevState => ({
      isNavVisible: !prevState.isNavVisible,
    }));
  };

  render() {
    const {
      currentUser,
      isAuthenticated,
      isFetching,
      isSmallDevice,
    } = this.props;
    const { isNavVisible } = this.state;

    const navItems = isAuthenticated ? (
      <AuthenticatedNav
        isAdmin={currentUser ? currentUser.is_admin : false}
        isFetching={isFetching}
        onClick={this.handleNavClick}
      />
    ) : (
      <UnauthenticatedNav onClick={this.handleNavClick} />
    );

    return (
      <React.Fragment>
        <NavToggle
          handleNavTaggle={this.handleNavToggle}
          isNavVisible={isNavVisible}
          isSmallDevice={isSmallDevice}
        />
        {isNavVisible && navItems}
      </React.Fragment>
    );
  }
}

const mapStateToProps = state => {
  const { isAuthenticated, isFetching } = state.authentication;

  return {
    currentUser: getCurrentUser(state),
    isAuthenticated,
    isFetching,
    isSmallDevice: state.browser.lessThan.medium,
  };
};

export default withRouter(connect(mapStateToProps)(Nav));
