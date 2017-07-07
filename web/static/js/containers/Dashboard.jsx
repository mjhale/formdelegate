import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { getCurrentAccount } from '../selectors';
import { getCurrentAccountId } from '../utils';
import { fetchAccount } from '../actions/accounts';

const propTypes = {};

const UnverifiedAlert = isVerified => {
  if (!isVerified) {
    return <div>Please verify your account's e-mail address.</div>;
  }

  return null;
};

class DashboardContainer extends React.Component {
  componentDidMount() {
    const currentAccountId = getCurrentAccountId();
    this.props.loadAccount(currentAccountId);
  }

  render() {
    const { account, isFetching } = this.props;

    if (!account || isFetching) {
      return <h1>Loading...</h1>;
    }

    return (
      <div>
        <h1>Account Dashboard</h1>
        <div className="dashboard">
          <UnverifiedAlert isVerified={account.verified} />

          <div className="card-header">Message Activity Graph</div>
          <div className="card activity-graph">Coming soon</div>

          <div className="card-header">Recent Updates</div>
          <div className="card activity-graph">Coming soon</div>

          <div className="card-header">Feedback</div>
          <div className="card activity-graph">Coming soon</div>
        </div>
      </div>
    );
  }
}

DashboardContainer.propTypes = propTypes;

const mapStateToProps = (state, ownProps) => ({
  account: getCurrentAccount(state, ownProps),
  isAuthenticated: state.accounts.isFetching,
  isFetching: state.accounts.isFetching,
});

const mapDispatchToProps = dispatch => ({
  loadAccount(accountId) {
    dispatch(fetchAccount(accountId));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(DashboardContainer);
