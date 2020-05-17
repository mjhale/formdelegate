import PropTypes from 'prop-types';
import React from 'react';
import styled from 'styled-components/macro';
import { map } from 'lodash';

import theme from 'constants/theme';
import { media } from 'utils/style';

import Message from 'components/Message/Message';

const MessageListWrapper = styled.section`
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

const Messages = ({
  handleSelectMessageChange,
  isFetching,
  messages,
  selectedMessageList,
}) => {
  if (isFetching) {
    return <p>Loading messages...</p>;
  }

  if (!isFetching && messages.length === 0) {
    return <p>No messages found.</p>;
  }

  return (
    <MessageListWrapper>
      {map(Object.keys(messages), index => (
        <Message
          handleSelectMessageChange={handleSelectMessageChange}
          isSelected={selectedMessageList.has(messages[index].id)}
          key={messages[index].id}
          message={messages[index]}
        />
      ))}
    </MessageListWrapper>
  );
};

Messages.propTypes = {
  handleSelectMessageChange: PropTypes.func.isRequired,
  isFetching: PropTypes.bool.isRequired,
  messages: PropTypes.array.isRequired,
  selectedMessageList: PropTypes.instanceOf(Set).isRequired,
};

export default Messages;
