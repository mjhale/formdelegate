import React from 'react';
import PropTypes from 'prop-types';
import { TableRow, TableCell } from 'components/Table/Table';
import moment from 'moment';
import styled from 'styled-components';
import theme from 'constants/theme';

const propTypes = {
  message: PropTypes.shape({}),
  openedMessageId: PropTypes.number,
};

const MessageRow = styled(TableRow)`
  cursor: pointer;
  user-select: none;
`;

const ExpandedMessageRow = styled.div`
  background-color: ${theme.backgroundColor};
  cursor: pointer;
  padding: 1rem;
  user-select: none;
`;

const SenderCell = styled(TableCell)`
  flex: 0 0 15em;
`;

const FormCell = styled(TableCell)`
  flex: 0 0 15em;
  justify-content: center;
`;

const DateCell = styled(TableCell)`
  flex: 0 0 10em;
  justify-content: flex-end;
`;

const Message = ({ message, onClick, openedMessageId }) => {
  const { content, form, inserted_at, sender, unknown_fields } = message;

  if (message.id !== openedMessageId) {
    return (
      <MessageRow onClick={onClick}>
        <SenderCell>{sender}</SenderCell>
        <TableCell>{content}</TableCell>
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
