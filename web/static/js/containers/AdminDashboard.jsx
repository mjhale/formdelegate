import React from 'react';
import { connect } from 'react-redux';
import { getCurrentAccount } from 'selectors';

const AdminDashboard = () => {
  return (
    <div>
      <div className="card-header">Metric graphs</div>
      <div className="card">Coming soon</div>
      <div className="card-header">Newest accounts</div>
      <div className="card">Coming soon</div>
    </div>
  );
};

const mapStateToProps = state => ({
  account: getCurrentAccount(state),
});

export default connect(mapStateToProps)(AdminDashboard);
