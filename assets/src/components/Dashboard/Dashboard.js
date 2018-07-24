import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import { fetchMessageActivity } from 'actions/messages';
import { getCurrentUser, getMessageActivity } from 'selectors';

import Card from 'components/Card';
import Flash from 'components/Flash';
import MessageActivity from 'components/MessageActivity';

const UnverifiedAlert = () => (
  <Flash type="alert">Please verify your e-mail address.</Flash>
);

class DashboardContainer extends React.Component {
  static propTypes = {
    fetchMessageActivity: PropTypes.func.isRequired,
    isFetching: PropTypes.bool.isRequired,
    messageActivity: PropTypes.array,
    user: PropTypes.object,
  };

  componentDidMount() {
    this.props.fetchMessageActivity();
  }

  render() {
    const { isFetching, messageActivity, user } = this.props;

    if (isFetching || !messageActivity || !user) return null;

    return (
      <React.Fragment>
        {!user.verified && <UnverifiedAlert />}

        <h1>{user.name}'s Dashboard</h1>

        <MessageActivity activity={messageActivity} />

        <Card header="Recent Updates">Coming soon</Card>
        <Card header="Feedback">Coming soon</Card>
      </React.Fragment>
    );
  }
}

const mapStateToProps = state => ({
  isFetching: state.users.isFetching,
  messageActivity: getMessageActivity(state),
  user: getCurrentUser(state),
});

const mapDispatchToProps = {
  fetchMessageActivity,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(DashboardContainer);
