import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

const propTypes = {
  account: PropTypes.object.isRequired,
  isFetching: PropTypes.bool.isRequired,
};

const AdminAccountView = ({ account, isFetching }) => {
  if (isFetching) {
    return <p>Loading data...</p>;
  }

  return (
    <div className="account card">
      <h1>Account Management</h1>
      <div>E-Mail: {account.email}</div>
      <div>Name: {account.name}</div>
      <div>
        <Link to={`/admin/accounts/${account.id}/edit`}>Edit Account</Link>
      </div>
    </div>
  );
};

AdminAccountView.propTypes = propTypes;

export default AdminAccountView;
