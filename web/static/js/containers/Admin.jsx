import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { getCurrentAccount } from 'selectors';
import { NavLink, Route, Switch } from 'react-router-dom';
import AdminDashboardContainer from 'containers/AdminDashboard';
import AdminAccountContainer from 'containers/AdminAccount';
import AdminAccountFormContainer from 'containers/AdminAccountForm';
import AdminAccountsContainer from 'containers/AdminAccounts';
import Error from 'components/Error';

const propTypes = {
  account: PropTypes.object,
  isAdmin: PropTypes.bool,
};

const Admin = ({ account, isAdmin }) => {
  if (!account) return null;

  if (!isAdmin)
    return <Error message="You are not authorized to access this area." />;

  return (
    <div className="admin fluid-container">
      <h1>Administration</h1>
      <ul className="admin-links" role="nav">
        <li>
          <NavLink exact to="/admin" activeClassName="active">
            Dashboard
          </NavLink>
        </li>
        <li>
          <NavLink to="/admin/accounts" activeClassName="active">
            Accounts
          </NavLink>
        </li>
        <li>
          <NavLink to="/admin/forms" activeClassName="active">
            Forms
          </NavLink>
        </li>
      </ul>
      <Switch>
        <Route exact path="/admin" component={AdminDashboardContainer} />
        <Route
          exact
          path="/admin/accounts"
          component={AdminAccountsContainer}
        />
        <Route
          exact
          path="/admin/accounts/:accountId"
          component={AdminAccountContainer}
        />
        <Route
          exact
          path="/admin/accounts/:accountId/edit"
          component={AdminAccountFormContainer}
        />
      </Switch>
    </div>
  );
};

Admin.propTypes = propTypes;

const mapStateToProps = state => {
  const account = getCurrentAccount(state);

  return {
    account: getCurrentAccount(state),
    isAdmin: account && account.is_admin,
  };
};

export default connect(mapStateToProps)(Admin);
