import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import { fetchSubmission } from 'actions/submissions';
import { getSubmission } from 'selectors';

import Submission from 'components/Submission/Submission';

class SubmissionContainer extends React.Component {
  static propTypes = {
    fetchSubmission: PropTypes.func.isRequired,
    match: PropTypes.shape({
      params: PropTypes.object.isRequired,
    }).isRequired,
    submission: PropTypes.object,
  };

  componentDidMount() {
    const { fetchSubmission, match } = this.props;

    fetchSubmission(match.submissionId);
  }

  render() {
    const { isFetching, submission } = this.props;

    if (isFetching || !submission) {
      return <p>Loading submission...</p>;
    }

    return <Submission submission={submission} />;
  }
}

const mapStateToProps = (state, ownProps) => ({
  submission: getSubmission(state, ownProps),
  isFetching: state.submissions.isFetching,
});

const mapDispatchToProps = {
  fetchSubmission,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SubmissionContainer);
