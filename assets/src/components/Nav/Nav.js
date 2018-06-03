import PropTypes from 'prop-types';
import styled from 'styled-components';
import React from 'react';
import { connect } from 'react-redux';
import { NavLink, withRouter } from 'react-router-dom';

import theme from 'constants/theme';
import { getCurrentUser } from 'selectors';

import AuthenticatedNav from 'components/Nav/AuthenticatedNav';
import NavToggle from 'components/Nav/NavToggle';
import UnauthenticatedNav from 'components/Nav/UnauthenticatedNav';

const propTypes = {
  isAdmin: PropTypes.bool.isRequired,
  isAuthenticated: PropTypes.bool.isRequired,
  isFetching: PropTypes.bool.isRequired,
  isSmallDevice: PropTypes.bool.isRequired,
};

const defaultProps = {
  isAdmin: false,
  isAuthenticated: false,
};

export const NavContainer = styled.nav`
  overflow: hidden;
  padding: 0;
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
    background-color: rgba(154, 43, 40, 0.9);
    border-left: 0.5rem solid #b9332d;
  }
`;

class Nav extends React.Component {
  constructor(props) {
    super(props);
    this.state = { isNavVisible: true };
  }

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
    const { isAdmin, isAuthenticated, isFetching, isSmallDevice } = this.props;
    const { isNavVisible } = this.state;

    const navItems = isAuthenticated ? (
      <AuthenticatedNav
        isAdmin={isAdmin}
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

Nav.propTypes = propTypes;
Nav.defaultProps = defaultProps;

const mapStateToProps = state => {
  const user = getCurrentUser(state);
  const { isAuthenticated, isFetching } = state.authentication;

  return {
    isAdmin: user && user.is_admin,
    isAuthenticated,
    isFetching,
    isSmallDevice: state.browser.lessThan.medium,
  };
};

export default withRouter(connect(mapStateToProps)(Nav));
