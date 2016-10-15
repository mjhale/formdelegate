import React, { PropTypes } from 'react';
import { Link } from 'react-router';

const propTypes = {
  account: PropTypes.object.isRequired,
  isFetching: PropTypes.bool.isRequired,
  lastUpdated: PropTypes.number,
};

class Account extends React.Component {
  render() {
    const { account, isFetching, lastUpdated } = this.props;

    if (!isFetching) {
      return (
        <div className="account">
          <h1>Account Management</h1>
          <div>User: {account.username}</div>
          <div>Password hash: {account.password_hash}</div>
          <div>Name: {account.name}</div>
          <div>
            <Link to={`/admin/accounts/${account.id}/edit`}>Edit Account</Link>
          </div>
        </div>
      );
    } else {
      return (
        <p>Loading data...</p>
      );
    }
  }
}

Account.propTypes = propTypes;

export default Account;
