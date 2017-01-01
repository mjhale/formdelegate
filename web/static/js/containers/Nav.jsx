import React, { PropTypes } from 'react';
import { browserHistory } from 'react-router';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import { logoutAccount } from '../actions/sessions';
import Logout from '../components/Logout';

const propTypes = {
  isAuthenticated: PropTypes.bool.isRequired,
  onLogoutClick: PropTypes.func.isRequired,
};

const defaultProps = {
  isAuthenticated: false,
};

const contextTypes = {
  router: React.PropTypes.object.isRequired,
};

class NavContainer extends React.Component {
  render() {
    const { isAuthenticated, onLogoutClick } = this.props;

    return (
      <ul className="nav-links" role="nav">
        <li><Link to="/messages" activeClassName="active">messages</Link></li>
        <li><Link to="/forms" activeClassName="active">forms</Link></li>
        <li><Link to="/admin/accounts" activeClassName="active">accounts</Link></li>
        { !isAuthenticated &&
          <li><Link to="/login" activeClassName="active">login</Link></li>
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
NavContainer.contextTypes = contextTypes;

const mapStateToProps = (state) => {
  const { isAuthenticated } = state.authentication;

  return {
    isAuthenticated,
  };
};

const mapDispatchToProps = (dispatch) => ({
  onLogoutClick(e) {
    e.preventDefault();
    dispatch(logoutAccount());
    browserHistory.push(`/`);
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(NavContainer);
