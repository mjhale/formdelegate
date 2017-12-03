import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { fetchMessageActivity } from 'actions/messages';
import { getCurrentUser, getMessageActivity } from 'selectors';
import Card from 'components/Card';
import MessageActivity from 'components/MessageActivity';

const propTypes = {
  user: PropTypes.object,
  isFetching: PropTypes.bool.isRequired,
  loadMessageActivity: PropTypes.func.isRequired,
};

const UnverifiedAlert = isVerified => {
  if (!isVerified) {
    return <div>Please verify your user's e-mail address.</div>;
  }

  return null;
};

class DashboardContainer extends React.Component {
  componentDidMount() {
    this.props.loadMessageActivity();
  }

  render() {
    const { user, isFetching, messageActivity } = this.props;

    if (!user || isFetching || !messageActivity) return null;

    return (
      <div>
        <h1>{user.name}'s Dashboard</h1>
        <UnverifiedAlert isVerified={user.verified} />

        <MessageActivity activity={messageActivity} />

        <Card header="Recent Updates">Coming soon</Card>
        <Card header="Feedback">Coming soon</Card>
      </div>
    );
  }
}

DashboardContainer.propTypes = propTypes;

const mapStateToProps = state => ({
  user: getCurrentUser(state),
  isFetching: state.users.isFetching,
  messageActivity: getMessageActivity(state),
});

const mapDispatchToProps = dispatch => ({
  loadMessageActivity() {
    dispatch(fetchMessageActivity());
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(DashboardContainer);
