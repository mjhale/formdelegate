import React, { PropTypes } from 'react';
import { Link } from 'react-router-dom';

const propTypes = {
  account: PropTypes.object.isRequired,
  isFetching: PropTypes.bool.isRequired,
  lastUpdated: PropTypes.number,
};

class Account extends React.Component {
  render() {
    const { account, isFetching, lastUpdated } = this.props;

    if (isFetching) {
      return <p>Loading data...</p>;
    }

    return (
      <div className="account card">
        <h1>Account Management</h1>
        <div>
          E-Mail: {account.email}
        </div>
        <div>
          Name: {account.name}
        </div>
        <div>
          <Link to={`/admin/accounts/${account.id}/edit`}>Edit Account</Link>
        </div>
      </div>
    );
  }
}

Account.propTypes = propTypes;

export default Account;
