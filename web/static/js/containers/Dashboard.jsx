import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { fetchAccount } from '../actions/accounts';
import { fetchMessageActivity } from '../actions/messages';
import { getCurrentAccount, getMessageActivity } from '../selectors';
import { getCurrentAccountId } from '../utils';
import MessageActivity from '../components/MessageActivity';

const propTypes = {
  account: PropTypes.object,
  isFetching: PropTypes.bool.isRequired,
  loadAccount: PropTypes.func.isRequired,
  loadMessageActivity: PropTypes.func.isRequired,
};

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
    this.props.loadMessageActivity();
  }

  render() {
    const { account, isFetching, messageActivity } = this.props;

    if (!account || !messageActivity || isFetching) {
      return <h1>Loading...</h1>;
    }

    return (
      <div>
        <h1>{account.name}'s Dashboard</h1>
        <div className="dashboard">
          <UnverifiedAlert isVerified={account.verified} />

          <MessageActivity activity={messageActivity} />

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

const mapStateToProps = state => ({
  account: getCurrentAccount(state),
  isFetching: state.accounts.isFetching,
  messageActivity: getMessageActivity(state),
});

const mapDispatchToProps = dispatch => ({
  loadAccount(accountId) {
    dispatch(fetchAccount(accountId));
  },

  loadMessageActivity() {
    dispatch(fetchMessageActivity());
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(DashboardContainer);
