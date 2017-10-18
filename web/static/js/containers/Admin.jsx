import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { getCurrentAccount } from '../selectors';
import { NavLink, Route, Switch } from 'react-router-dom';
import AdminDashboardContainer from '../containers/AdminDashboard';
import AdminAccountContainer from '../containers/AdminAccount';
import AdminAccountFormContainer from '../containers/AdminAccountForm';
import AdminAccountsContainer from '../containers/AdminAccounts';

const propTypes = {
  account: PropTypes.object,
};

class AdminContainer extends React.Component {
  render() {
    return (
      <div className="admin">
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
  }
}

AdminContainer.propTypes = propTypes;

const mapStateToProps = state => ({
  account: getCurrentAccount(state),
});

export default connect(mapStateToProps)(AdminContainer);
