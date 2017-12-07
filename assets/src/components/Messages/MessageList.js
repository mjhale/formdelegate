import React from 'react';
import PropTypes from 'prop-types';
import { map } from 'lodash';
import moment from 'moment';
import styled from 'styled-components';
import Message from 'components/Message/Message';
import Table from 'components/Table';
import { TableContent } from 'components/Table/Table';

const propTypes = {
  handleViewChange: PropTypes.func.isRequired,
  isFetching: PropTypes.bool.isRequired,
  messages: PropTypes.array.isRequired,
};

const MessageList = ({
  handleViewChange,
  isFetching,
  messages,
  openedMessageId,
}) => {
  if (isFetching) {
    return <p>Loading messages...</p>;
  }

  if (!isFetching && messages.length === 0) {
    return <p>No messages found.</p>;
  }

  return (
    <Table>
      <TableContent>
        {map(Object.keys(messages), key => {
          return (
            <Message
              key={messages[key].id}
              message={messages[key]}
              onClick={evt => {
                handleViewChange(messages[key], evt);
              }}
              openedMessageId={openedMessageId}
            />
          );
        })}
      </TableContent>
    </Table>
  );
};

MessageList.propTypes = propTypes;

export default MessageList;
