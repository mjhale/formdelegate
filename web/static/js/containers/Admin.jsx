import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Route, Switch } from 'react-router-dom';
import AdminAccountContainer from '../containers/AdminAccount';
import AdminAccountFormContainer from '../containers/AdminAccountForm';
import AdminAccountsContainer from '../containers/AdminAccounts';

const propTypes = {
  children: PropTypes.node,
  isAuthenticated: PropTypes.bool.isRequired,
};

const defaultProps = {
  isAuthenticated: false,
};

class AdminContainer extends React.Component {
  render() {
    const { children, isAuthenticated } = this.props;

    return (
      <div className="admin">
        <Switch>
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

const mapStateToProps = state => {
  const { isAuthenticated } = state.authentication;

  return {
    isAuthenticated,
  };
};

export default connect(mapStateToProps)(AdminContainer);
