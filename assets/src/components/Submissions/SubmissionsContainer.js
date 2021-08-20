import PropTypes from 'prop-types';
import * as React from 'react';
import styled from 'styled-components/macro';
import { connect } from 'react-redux';
import { parse } from 'query-string';
import { withRouter } from 'react-router-dom';

import {
  addSubmission,
  fetchSubmissions,
  markSubmissionAsHam,
  markSubmissionAsSpam,
  submissionSearchFetch,
} from 'actions/submissions';
import { getVisibleSubmissions, getVisibleSubmissionForms } from 'selectors';
import { submissionListener } from 'components/Submissions/submissionListener';

import ErrorBoundary from 'components/ErrorBoundary';
import Submissions from 'components/Submissions/Submissions';
import SubmissionsToolbar from 'components/Submissions/SubmissionsToolbar';

const Header = styled.div`
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
`;

const Heading = styled.h1`
  flex: 0 1 auto;
  margin: 0 1rem 0.5rem 0;
`;

class SubmissionsContainer extends React.Component {
  constructor(props) {
    super(props);
    this.state = { selectedSubmissionList: new Set() };

    this.handleMarkAsSpam = this.handleMarkAsSpam.bind(this);
    this.handleSelectSubmission = this.handleSelectSubmission.bind(this);
  }

  componentDidMount() {
    const { addSubmission, loadSubmissions, location } = this.props;
    const searchQuery = parse(location.search);

    loadSubmissions(1, searchQuery && searchQuery.search);
    submissionListener(addSubmission);
  }

  handleDeselectSubmission = submissionId => {
    this.setState((prevState, props) => {
      let selectedSubmissionList = new Set(prevState.selectedSubmissionList);
      selectedSubmissionList.delete(submissionId);

      return { selectedSubmissionList: selectedSubmissionList };
    });
  };

  handleMarkAsHam = evt => {
    for (let submissionId of this.state.selectedSubmissionList) {
      this.props.markSubmissionAsHam(submissionId);
    }

    this.setState((prevState, props) => ({
      selectedSubmissionList: new Set(),
    }));
  };

  handleMarkAsSpam = evt => {
    for (let submissionId of this.state.selectedSubmissionList) {
      this.props.markSubmissionAsSpam(submissionId);
    }

    this.setState((prevState, props) => ({
      selectedSubmissionList: new Set(),
    }));
  };

  handleSelectSubmission = submissionId => {
    this.setState((prevState, props) => {
      let selectedSubmissionList = new Set(prevState.selectedSubmissionList);
      selectedSubmissionList.add(submissionId);

      return { selectedSubmissionList: selectedSubmissionList };
    });
  };

  handleSelectSubmissionChange = evt => {
    const {
      checked: isChecked,
      dataset: { submissionId },
    } = evt.target;

    if (isChecked) {
      this.handleSelectSubmission(submissionId);
    } else {
      this.handleDeselectSubmission(submissionId);
    }
  };

  handlePageChange = (requestedPage, evt) => {
    const { loadSubmissions, location } = this.props;
    const searchParam = parse(location.search);

    evt.preventDefault();
    loadSubmissions(requestedPage, searchParam && searchParam.search);
  };

  handleSearch = values => {
    const { history, loadSubmissions } = this.props;
    const searchQuery = values.search;

    if (searchQuery) {
      history.push('?search=' + searchQuery);
    } else {
      history.push();
    }

    loadSubmissions(1, searchQuery);
  };

  render() {
    const {
      forms,
      isFetching,
      submissions,
      pagination: paginationMetaData,
    } = this.props;

    return (
      <React.Fragment>
        <Header>
          <Heading>My Submissions</Heading>
          <SubmissionsToolbar
            handleMarkAsHam={this.handleMarkAsHam}
            handleMarkAsSpam={this.handleMarkAsSpam}
            handlePageChange={this.handlePageChange}
            handleSearch={this.handleSearch}
            paginationMetaData={paginationMetaData}
          />
        </Header>
        <ErrorBoundary>
          <Submissions
            forms={forms}
            handleSelectSubmissionChange={this.handleSelectSubmissionChange}
            isFetching={isFetching}
            submissions={submissions}
            selectedSubmissionList={this.state.selectedSubmissionList}
          />
        </ErrorBoundary>
      </React.Fragment>
    );
  }
}

SubmissionsContainer.propTypes = {
  addSubmission: PropTypes.func.isRequired,
  history: PropTypes.shape({
    push: PropTypes.func.isRequired,
  }).isRequired,
  isFetching: PropTypes.bool.isRequired,
  loadSubmissions: PropTypes.func.isRequired,
  submissions: PropTypes.array.isRequired,
  query: PropTypes.string,
};

const mapStateToProps = (state, props) => ({
  forms: getVisibleSubmissionForms(state, props),
  isFetching: state.submissions.isFetching,
  submissions: getVisibleSubmissions(state),
  pagination: {
    limit: state.submissions.pagination.limit,
    offset: state.submissions.pagination.offset,
    total: state.submissions.pagination.total,
  },
});

const mapDispatchToProps = dispatch => ({
  addSubmission: payload => {
    dispatch(addSubmission(payload));
  },
  markSubmissionAsHam: submissionId => {
    dispatch(markSubmissionAsHam(submissionId));
  },
  markSubmissionAsSpam: submissionId => {
    dispatch(markSubmissionAsSpam(submissionId));
  },
  loadSubmissions: (requestedPage, searchQuery) => {
    if (searchQuery) {
      dispatch(submissionSearchFetch(searchQuery, requestedPage));
    } else {
      dispatch(fetchSubmissions(requestedPage));
    }
  },
});

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(SubmissionsContainer)
);
