import PropTypes from 'prop-types';
import React from 'react';
import styled from 'styled-components/macro';
import { map } from 'lodash';

import theme from 'constants/theme';
import { media } from 'utils/style';

import Submission from 'components/Submission/Submission';

const SubmissionListWrapper = styled.section`
  background-color: ${theme.solidWhite};
  border: 1px solid ${theme.borderColor};
  display: flex;
  flex-flow: column nowrap;
  justify-content: space-between;
  line-height: 1.5;

  ${media.sm`
    flex-flow: column wrap;
  `};
`;

const Submissions = ({
  handleSelectSubmissionChange,
  isFetching,
  submissions,
  selectedSubmissionList,
}) => {
  if (isFetching) {
    return <p>Loading submissions...</p>;
  }

  if (!isFetching && submissions.length === 0) {
    return <p>No submissions found.</p>;
  }

  return (
    <SubmissionListWrapper>
      {map(Object.keys(submissions), index => (
        <Submission
          handleSelectSubmissionChange={handleSelectSubmissionChange}
          isSelected={selectedSubmissionList.has(submissions[index].id)}
          key={submissions[index].id}
          submission={submissions[index]}
        />
      ))}
    </SubmissionListWrapper>
  );
};

Submissions.propTypes = {
  handleSelectSubmissionChange: PropTypes.func.isRequired,
  isFetching: PropTypes.bool.isRequired,
  submissions: PropTypes.array.isRequired,
  selectedSubmissionList: PropTypes.instanceOf(Set).isRequired,
};

export default Submissions;
