import React, { PropTypes } from 'react';
import { NavLink, withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { logoutAccount } from '../actions/sessions';
import Logout from '../components/Logout';

const propTypes = {
  isAuthenticated: PropTypes.bool.isRequired,
  onLogoutClick: PropTypes.func.isRequired,
};

const defaultProps = {
  isAuthenticated: false,
};

class NavContainer extends React.Component {
  render() {
    const { isAuthenticated, onLogoutClick } = this.props;

    return (
      <ul className="nav-links" role="nav">
        <li><NavLink to="/messages" activeClassName="active">messages</NavLink></li>
        <li><NavLink to="/forms" activeClassName="active">forms</NavLink></li>
        <li><NavLink to="/admin/accounts" activeClassName="active">accounts</NavLink></li>
        { !isAuthenticated &&
          <li><NavLink to="/login" activeClassName="active">login</NavLink></li>
        }
        { isAuthenticated &&
          <li>
            <Logout
              onLogoutClick={onLogoutClick}
            />
          </li>
        }
      </ul>
    );
  }
}

NavContainer.propTypes = propTypes;
NavContainer.defaultProps = defaultProps;

const mapStateToProps = (state) => {
  const { isAuthenticated } = state.authentication;

  return {
    isAuthenticated,
  };
};

const mapDispatchToProps = (dispatch, ownProps) => ({
  onLogoutClick(evt) {
    evt.preventDefault();
    dispatch(logoutAccount());
    ownProps.history.push(`/`);
  }
});

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(NavContainer));
