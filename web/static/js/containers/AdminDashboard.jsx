import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { getAccount } from '../selectors';
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

const mapStateToProps = (state, ownProps) => ({
  account: getAccount(state, ownProps),
  isAuthenticated: state.accounts.isFetching,
  isFetching: state.accounts.isFetching,
});

const mapDispatchToProps = dispatch => ({});

export default connect(mapStateToProps, mapDispatchToProps)(
  AdminDashboardContainer
);
