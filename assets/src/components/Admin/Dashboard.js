import React from 'react';
import { connect } from 'react-redux';
import { getCurrentUser } from 'selectors';
import Card from 'components/Card';

const AdminDashboard = () => (
  <div>
    <Card header="Metric Graphs">Coming soon</Card>
    <Card header="Newest Users">Coming soon</Card>
  </div>
);

const mapStateToProps = state => ({
  user: getCurrentUser(state),
});

export default connect(mapStateToProps)(AdminDashboard);
