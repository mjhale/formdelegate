import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { getCurrentAccount } from '../selectors';
import { getCurrentAccountId } from '../utils';
import { fetchAccount } from '../actions/accounts';

const propTypes = {};

class AdminDashboardContainer extends React.Component {
  render() {
    return (
      <div>
        <div className="card-header">Metric graphs</div>
        <div className="card">Coming soon</div>
        <div className="card-header">Newest accounts</div>
        <div className="card">Coming soon</div>
      </div>
    );
  }
}

AdminDashboardContainer.propTypes = propTypes;

const mapStateToProps = state => ({
  account: getCurrentAccount(state),
  isFetching: state.accounts.isFetching,
});

export default connect(mapStateToProps)(AdminDashboardContainer);
