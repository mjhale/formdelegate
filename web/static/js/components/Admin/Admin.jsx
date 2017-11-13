import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { getCurrentAccount } from 'selectors';
import { NavLink, Route, Switch } from 'react-router-dom';
import AccountFormContainer from 'components/Admin/AccountFormContainer';
import AccountList from 'components/Admin/AccountList';
import AccountView from 'components/Admin/AccountView';
import Dashboard from 'components/Admin/Dashboard';
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
        <Route exact path="/admin" component={Dashboard} />
        <Route exact path="/admin/accounts" component={AccountList} />
        <Route
          exact
          path="/admin/accounts/:accountId"
          component={AccountView}
        />
        <Route
          exact
          path="/admin/accounts/:accountId/edit"
          component={AccountFormContainer}
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
