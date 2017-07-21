import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { NavLink, withRouter } from 'react-router-dom';
import { logoutAccount } from '../actions/sessions';
import Logout from '../components/Logout';

const propTypes = {
  isAuthenticated: PropTypes.bool.isRequired,
  onLogoutClick: PropTypes.func.isRequired,
};

const defaultProps = {
  isAuthenticated: false,
};

const UnauthenticatedNav = () =>
  <ul className="nav-links" role="nav">
    <li>
      <NavLink exact to="/" activeClassName="active">
        home
      </NavLink>
    </li>
    <li>
      <NavLink to="/examples" activeClassName="active">
        examples
      </NavLink>
    </li>
    <li>
      <NavLink to="/documentation" activeClassName="active">
        documentation
      </NavLink>
    </li>
    <li>
      <NavLink to="/contact" activeClassName="active">
        contact us
      </NavLink>
    </li>
    <li>
      <NavLink to="/login" activeClassName="active">
        login
      </NavLink>
    </li>
  </ul>;

const AuthenticatedNav = ({ onLogoutClick }) =>
  <ul className="nav-links" role="nav">
    <li>
      <NavLink to="/dashboard" activeClassName="active">
        dashboard
      </NavLink>
    </li>
    <li>
      <NavLink to="/messages" activeClassName="active">
        messages
      </NavLink>
    </li>
    <li>
      <NavLink to="/forms" activeClassName="active">
        forms
      </NavLink>
    </li>
    <li>
      <NavLink to="/settings" activeClassName="active">
        settings
      </NavLink>
    </li>
    <li>
      <Logout onLogoutClick={onLogoutClick} />
    </li>
  </ul>;

class NavContainer extends React.Component {
  render() {
    const { isAuthenticated, onLogoutClick } = this.props;

    if (isAuthenticated) {
      return <AuthenticatedNav onLogoutClick={onLogoutClick} />;
    } else {
      return <UnauthenticatedNav />;
    }
  }
}

NavContainer.propTypes = propTypes;
NavContainer.defaultProps = defaultProps;

const mapStateToProps = state => {
  const { isAuthenticated } = state.authentication;

  return {
    isAuthenticated,
  };
};

const mapDispatchToProps = dispatch => ({
  onLogoutClick: evt => {
    evt.preventDefault();
    dispatch(logoutAccount());
    ownProps.history.push('/');
  },
});

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(NavContainer)
);
