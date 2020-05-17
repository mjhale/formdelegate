import moment from 'moment';
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import styled from 'styled-components/macro';

import theme from 'constants/theme';
import { media } from 'utils/style';
import { useInterval } from 'utils/useInterval';

import Flash from 'components/Flash';

const Cell = styled.div`
  font-size: 0.8rem;
  padding: 0.5rem;
`;

const MessageSelectCell = styled.div`
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
}
`;

const DetailBody = styled.div`
  margin-bottom: 0.5rem;
`;

const DetailHeader = styled.div`
  font-weight: bold;
  margin-bottom: 0.25rem;
`;

const FlaggedMessage = styled.div`
  background-color: #e49996;
  border-radius: 0.3rem;
  color: #480907;
  height: 1.5em;
  font-size: 1em;
  font-weight: bold;
  margin: 0 0.5em 0 0;
  padding: 0.25em 0.75em;
`;

const MessageCell = styled(Cell)`
  display: none;

  ${media.md`
    align-items: center;
    color: #5a5454;
    display: flex;
    flex-flow: row nowrap;
    width: 50%;
  `};
`;

const MessageDetails = styled.div``;

const MessagePreviewCells = styled.div`
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

const MessagePreview = styled.div`
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

const Message = ({
  handleSelectMessageChange,
  isSelected,
  message: {
    content,
    flagged_at,
    form,
    id: messageId,
    inserted_at,
    sender,
    unknown_fields,
  },
}) => {
  const [isPreviewExpanded, setIsPreviewExpanded] = useState(false);
  const [dateInsertedFromNow, setDateInsertedFromNow] = useState(
    moment.utc(inserted_at).fromNow()
  );

  useInterval(() => {
    const latestFromNowDate = moment.utc(inserted_at).fromNow();

    setDateInsertedFromNow(latestFromNowDate);
  }, 60000);

  const handleMessagePreviewToggle = evt => {
    setIsPreviewExpanded(!isPreviewExpanded);
  };

  return (
    <React.Fragment>
      <MessagePreview>
        <MessageSelectCell>
          <input
            checked={isSelected}
            data-message-id={messageId}
            onChange={handleSelectMessageChange}
            type="checkbox"
          />
        </MessageSelectCell>
        <MessagePreviewCells onClick={handleMessagePreviewToggle}>
          <SenderCell>
            {sender && sender.length > 25
              ? `${sender.substring(0, 25)}...`
              : sender}
          </SenderCell>
          <MessageCell>
            {flagged_at && <FlaggedMessage>Spam</FlaggedMessage>}
            {content && content.length > 50
              ? `${content.substring(0, 50)}...`
              : content}
          </MessageCell>
          <DateCell>{dateInsertedFromNow}</DateCell>
        </MessagePreviewCells>
      </MessagePreview>
      {isPreviewExpanded && (
        <MessageDetails>
          <DetailGroup>
            <DetailHeader>Form</DetailHeader>
            <DetailBody>{form.form}</DetailBody>
          </DetailGroup>
          <DetailGroup>
            <DetailHeader>Name</DetailHeader>
            <DetailBody>{sender}</DetailBody>
          </DetailGroup>
          <DetailGroup>
            <DetailHeader>Submitted</DetailHeader>
            <DetailBody>{inserted_at}</DetailBody>
          </DetailGroup>
          <DetailGroup>
            <DetailHeader>Message</DetailHeader>
            <DetailBody>{content}</DetailBody>
          </DetailGroup>
          {unknown_fields.length > 0 &&
            Object.keys(unknown_fields).map((key, index) => {
              if (typeof unknown_fields[key] !== 'string') {
                return (
                  <Flash type="error">
                    Unable to load message field(s) which aren't strings.
                  </Flash>
                );
              }

              return (
                <DetailGroup key={index}>
                  <DetailHeader>Field</DetailHeader>{' '}
                  <DetailBody>{unknown_fields[key]}</DetailBody>
                </DetailGroup>
              );
            })}
        </MessageDetails>
      )}
    </React.Fragment>
  );
};

Message.propTypes = {
  handleSelectMessageChange: PropTypes.func.isRequired,
  isSelected: PropTypes.bool.isRequired,
  message: PropTypes.shape({
    content: PropTypes.string,
    flagged_at: PropTypes.string,
    form: PropTypes.shape({
      form: PropTypes.string.isRequired,
    }).isRequired,
    messageId: PropTypes.number.isRequired,
    inserted_at: PropTypes.string.isRequired,
    sender: PropTypes.string.isRequired,
    unknown_fields: PropTypes.object,
  }).isRequired,
};

export default Message;
