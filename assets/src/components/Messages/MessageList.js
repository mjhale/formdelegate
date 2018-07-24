import PropTypes from 'prop-types';
import React from 'react';
import styled from 'styled-components';
import { map } from 'lodash';

import theme from 'constants/theme';
import { media } from 'utils/style';

import Message from 'components/Message/Message';

const ListContainer = styled.section`
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
    <ListContainer>
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
    </ListContainer>
  );
};

MessageList.propTypes = {
  handleViewChange: PropTypes.func.isRequired,
  isFetching: PropTypes.bool.isRequired,
  messages: PropTypes.array.isRequired,
  openedMessageId: PropTypes.number,
};

export default MessageList;
