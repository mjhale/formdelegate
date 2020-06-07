import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import { fetchSubmissionActivity } from 'actions/submissions';
import { getCurrentUser } from 'selectors';
import { getSubmissionActivity } from 'selectors';

import Card from 'components/Card';
import SubmissionActivity from 'components/SubmissionActivity';

class DashboardContainer extends React.Component {
  static propTypes = {
    currentUser: PropTypes.object,
    fetchSubmissionActivity: PropTypes.func.isRequired,
    submissionActivity: PropTypes.array,
  };

  componentDidMount() {
    this.props.fetchSubmissionActivity();
  }

  render() {
    const { currentUser, submissionActivity } = this.props;

    if (!currentUser || !submissionActivity) return null;

    return (
      <React.Fragment>
        <h1>{currentUser.name}'s Dashboard</h1>

        <SubmissionActivity activity={submissionActivity} />

        <Card header="Recent Updates">Coming soon</Card>
        <Card header="Feedback">Coming soon</Card>
      </React.Fragment>
    );
  }
}

const mapStateToProps = state => ({
  currentUser: getCurrentUser(state),
  submissionActivity: getSubmissionActivity(state),
});

const mapDispatchToProps = {
  fetchSubmissionActivity,
};

export default connect(mapStateToProps, mapDispatchToProps)(DashboardContainer);
