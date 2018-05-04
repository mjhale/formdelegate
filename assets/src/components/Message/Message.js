import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import styled from 'styled-components';
import theme from 'constants/theme';

const propTypes = {
  message: PropTypes.shape({}),
  openedMessageId: PropTypes.number,
};

const MessageCell = styled.div`
  display: flex;
  flex-basis: 0;
  flex-flow: row nowrap;
  flex-grow: 1;
  font-size: 0.8rem;
  padding: 0.5rem;
`;

const MessageRow = styled.div`
  box-shadow: inset 0 -1px 0 0 ${theme.offWhite};
  color: ${theme.mineBlack};
  cursor: pointer;
  display: flex;
  flex-flow: row nowrap;
  text-decoration: none;
  user-select: none;
  width: 100%;

  &:hover {
    background-color: #fafafa;
  }
`;

const ExpandedMessageRow = styled.div`
  background-color: ${theme.backgroundColor};
  cursor: pointer;
  padding: 1rem;
  user-select: none;
`;

const SenderCell = styled(MessageCell)`
  flex: 0 0 15em;
`;

const FormCell = styled(MessageCell)`
  flex: 0 0 15em;
  justify-content: center;
`;

const DateCell = styled(MessageCell)`
  flex: 0 0 10em;
  justify-content: flex-end;
`;

const Message = ({ message, onClick, openedMessageId }) => {
  const { content, form, inserted_at, sender, unknown_fields } = message;

  if (message.id !== openedMessageId) {
    return (
      <MessageRow onClick={onClick}>
        <SenderCell>{sender}</SenderCell>
        <MessageCell>{content}</MessageCell>
        <FormCell>{form.form}</FormCell>
        <DateCell>{moment.utc(inserted_at).fromNow()}</DateCell>
      </MessageRow>
    );
  } else {
    return (
      <ExpandedMessageRow onClick={onClick}>
        <h1>{sender}</h1>
        <div>{moment.utc(inserted_at).fromNow()}</div>
        <div>{content}</div>
        {unknown_fields && (
          <div>
            <h2>Fields</h2>
            {Object.keys(unknown_fields).map((key, index) => {
              return (
                <div key={index}>
                  {key}: {unknown_fields[key]}
                </div>
              );
            })}
          </div>
        )}
      </ExpandedMessageRow>
    );
  }
};

Message.propTypes = propTypes;

export default Message;
