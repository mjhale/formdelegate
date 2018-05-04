import React from 'react';
import PropTypes from 'prop-types';
import { map } from 'lodash';
import styled from 'styled-components';

import theme from 'constants/theme';

import Message from 'components/Message/Message';

const Messages = styled.section`
  background: ${theme.solidWhite};
  border: 1px solid ${theme.borderColor};
  display: flex;
  flex-flow: column nowrap;
  justify-content: space-between;
  line-height: 1.5;
`;

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
    <Messages>
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
    </Messages>
  );
};

MessageList.propTypes = propTypes;

export default MessageList;
