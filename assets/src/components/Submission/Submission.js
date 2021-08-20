import moment from 'moment';
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import styled from 'styled-components/macro';

import theme from 'constants/theme';
import { media } from 'utils/style';
import { useInterval } from 'utils/useInterval';

import Flash from 'components/Flash';
import Link from 'components/Link';

const Cell = styled.div`
  font-size: 0.8rem;
  padding: 0.5rem;
`;

const SubmissionSelectCell = styled.div`
  text-align: center;
  width: 5%;
`;

const DateCell = styled(Cell)`
  color: #5a5454;
  justify-content: flex-end;
  width: 10%;
`;

const DetailGroup = styled.div`
  color: #5a5454;
  font-size: 0.8rem;
  padding: 0 1.5rem 0 3.25rem;
`;

const DetailBody = styled.div`
  margin-bottom: 0.5rem;
`;

const DetailHeader = styled.div`
  font-weight: bold;
  margin-bottom: 0.25rem;
`;

const FlaggedSubmission = styled.div`
  background-color: #e49996;
  border-radius: 0.3rem;
  color: #480907;
  height: 1.5em;
  font-size: 1em;
  font-weight: bold;
  margin: 0 0.5em 0 0;
  padding: 0.25em 0.75em;
`;

const SubmissionCell = styled(Cell)`
  display: none;

  ${media.md`
    align-items: center;
    color: #5a5454;
    display: flex;
    flex-flow: row nowrap;
    width: 50%;
  `};
`;

const SubmissionDetails = styled.div``;

const SubmissionPreviewCells = styled.div`
  align-items: center;
  box-shadow: inset 0 -1px 0 0 ${theme.offWhite};
  color: ${theme.mineBlack};
  cursor: pointer;
  display: flex;
  flex-flow: row nowrap;
  text-decoration: none;
  user-select: none;
  width: 100%;
`;

const SubmissionPreview = styled.div`
  align-items: center;
  display: flex;
  flex-flow: row nowrap;
  width: 100%;

  &:hover {
    background-color: #fafafa;
  }
`;

const SenderCell = styled(Cell)`
  font-weight: bold;

  ${media.md`
    padding-right: 0.5em;
    width: 25%;
    word-break: break-all;
  `};
`;

const Submission = ({
  form,
  handleSelectSubmissionChange,
  isSelected,
  submission: { body, data, flagged_at, id: submissionId, inserted_at, sender },
}) => {
  const [isPreviewExpanded, setIsPreviewExpanded] = useState(false);
  const [dateInsertedFromNow, setDateInsertedFromNow] = useState(
    moment.utc(inserted_at).fromNow()
  );

  useInterval(() => {
    const latestFromNowDate = moment.utc(inserted_at).fromNow();

    setDateInsertedFromNow(latestFromNowDate);
  }, 60000);

  const handleSubmissionPreviewToggle = evt => {
    setIsPreviewExpanded(!isPreviewExpanded);
  };

  return (
    <React.Fragment>
      <SubmissionPreview>
        <SubmissionSelectCell>
          <input
            checked={isSelected}
            data-submission-id={submissionId}
            onChange={handleSelectSubmissionChange}
            type="checkbox"
          />
        </SubmissionSelectCell>
        <SubmissionPreviewCells onClick={handleSubmissionPreviewToggle}>
          <SenderCell>
            {sender && sender.length > 25
              ? `${sender.substring(0, 25)}...`
              : sender}
          </SenderCell>
          <SubmissionCell>
            {flagged_at && <FlaggedSubmission>Spam</FlaggedSubmission>}
            {body && body.length > 50 ? `${body.substring(0, 50)}...` : body}
          </SubmissionCell>
          <DateCell>{dateInsertedFromNow}</DateCell>
        </SubmissionPreviewCells>
      </SubmissionPreview>
      {isPreviewExpanded && (
        <SubmissionDetails>
          <DetailGroup>
            <DetailHeader>Form</DetailHeader>
            <DetailBody>{form.name}</DetailBody>
          </DetailGroup>
          <DetailGroup>
            <DetailHeader>Submitted</DetailHeader>
            <DetailBody>{inserted_at}</DetailBody>
          </DetailGroup>
          {data &&
            Object.keys(data).length > 0 &&
            Object.keys(data).map((key, index) => {
              if (typeof data[key] !== 'string') {
                if (
                  Object.prototype.hasOwnProperty.call(data[key], 'url') &&
                  Object.prototype.hasOwnProperty.call(
                    data[key],
                    'field_name'
                  ) &&
                  Object.prototype.hasOwnProperty.call(data[key], 'file_size')
                ) {
                  return (
                    <DetailGroup key={index}>
                      <DetailHeader>
                        File Field: {data[key].field_name}
                      </DetailHeader>{' '}
                      <DetailBody>
                        <Link href={data[key].url}>{data[key].file_name}</Link>{' '}
                        <>({data[key].file_size})</>
                      </DetailBody>
                    </DetailGroup>
                  );
                }

                return (
                  <DetailGroup key={index}>
                    <Flash type="error">
                      Unable to load submission field(s) which aren't strings.
                    </Flash>
                  </DetailGroup>
                );
              }

              return (
                <DetailGroup key={index}>
                  <DetailHeader>Field: {key}</DetailHeader>{' '}
                  <DetailBody>{data[key]}</DetailBody>
                </DetailGroup>
              );
            })}
        </SubmissionDetails>
      )}
    </React.Fragment>
  );
};

Submission.propTypes = {
  form: PropTypes.shape({
    name: PropTypes.string.isRequired,
  }).isRequired,
  handleSelectSubmissionChange: PropTypes.func.isRequired,
  isSelected: PropTypes.bool.isRequired,
  submission: PropTypes.shape({
    content: PropTypes.string,
    flagged_at: PropTypes.string,
    id: PropTypes.string.isRequired,
    inserted_at: PropTypes.string.isRequired,
    sender: PropTypes.string.isRequired,
    unknown_fields: PropTypes.object,
  }).isRequired,
};

export default Submission;
