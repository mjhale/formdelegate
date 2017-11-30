import React from 'react';
import { connect } from 'react-redux';
import { getCurrentUser } from 'selectors';

const AdminDashboard = () => (
  <div>
    <div className="card-header">Metric graphs</div>
    <div className="card">Coming soon</div>
    <div className="card-header">Newest users</div>
    <div className="card">Coming soon</div>
  </div>
);

const mapStateToProps = state => ({
  user: getCurrentUser(state),
});

export default connect(mapStateToProps)(AdminDashboard);
