import React, { PropTypes } from 'react';
import { Link } from 'react-router';

import { fetchAccount } from 'actions/account';

const propTypes = {
  account: PropTypes.object.isRequired,
  isFetching: PropTypes.bool.isRequired,
  lastUpdated: PropTypes.number,
};

class Account extends React.Component {
  componentDidMount() {
    const { dispatch } = this.props;
    const { accountId } = this.props.params;
    dispatch(fetchAccount(accountId));
  }

  render() {
    const { account, isFetching, lastUpdated } = this.props;

    return (
      <div className="account">
        <h1>Account Management</h1>
        <div>User: {account.username}</div>
        <div>Password hash: {account.password_hash}</div>
        <div>Name: {account.name}</div>
        <div>
          <Link to={`/accounts/${account.id}/edit`}>Edit Account</Link>
        </div>
      </div>
    );
  }
}

Account.propTypes = propTypes;

export default Account;
