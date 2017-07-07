import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { fetchAccount } from '../actions/accounts';
import { getCurrentAccount } from '../selectors';
import { getCurrentAccountId } from '../utils';
import { NavLink, Route, Switch } from 'react-router-dom';
import AdminDashboardContainer from '../containers/AdminDashboard';
import AdminAccountContainer from '../containers/AdminAccount';
import AdminAccountFormContainer from '../containers/AdminAccountForm';
import AdminAccountsContainer from '../containers/AdminAccounts';

const propTypes = {};

const defaultProps = {
  currentAccount: {
    is_admin: true,
  },
};

class AdminContainer extends React.Component {
  componentDidMount() {
    const currentAccountId = getCurrentAccountId();
    this.props.dispatch(fetchAccount(currentAccountId)).then(() => {
      this.redirectIfNotAdmin();
    });
  }

  componentWillUpdate(nextProps) {
    this.redirectIfNotAdmin();
  }

  redirectIfNotAdmin() {
    if (!this.props.currentAccount.is_admin) {
      this.props.history.push('/access-error');
    }
  }

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
AdminContainer.defaultProps = defaultProps;

const mapStateToProps = (state, ownProps) => ({
  currentAccount: getCurrentAccount(state, ownProps),
});

export default connect(mapStateToProps)(AdminContainer);
