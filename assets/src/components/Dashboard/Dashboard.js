import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import { fetchSubmissionActivity } from 'actions/submissions';
import { getCurrentUser, getSubmissionActivity } from 'selectors';

import Card from 'components/Card';
import Flash from 'components/Flash';
import SubmissionActivity from 'components/SubmissionActivity';

const UnverifiedAlert = () => (
  <Flash type="alert">Please verify your e-mail address.</Flash>
);

class DashboardContainer extends React.Component {
  static propTypes = {
    fetchSubmissionActivity: PropTypes.func.isRequired,
    isFetching: PropTypes.bool.isRequired,
    submissionActivity: PropTypes.array,
    user: PropTypes.object,
  };

  componentDidMount() {
    this.props.fetchSubmissionActivity();
  }

  render() {
    const { isFetching, submissionActivity, user } = this.props;

    if (isFetching || !submissionActivity || !user) return null;

    return (
      <React.Fragment>
        {!user.verified && <UnverifiedAlert />}

        <h1>{user.name}'s Dashboard</h1>

        <SubmissionActivity activity={submissionActivity} />

        <Card header="Recent Updates">Coming soon</Card>
        <Card header="Feedback">Coming soon</Card>
      </React.Fragment>
    );
  }
}

const mapStateToProps = state => ({
  isFetching: state.users.isFetching,
  submissionActivity: getSubmissionActivity(state),
  user: getCurrentUser(state),
});

const mapDispatchToProps = {
  fetchSubmissionActivity,
};

export default connect(mapStateToProps, mapDispatchToProps)(DashboardContainer);
