import React, { PropTypes } from 'react';
import { map } from 'lodash';
import Message from '../components/Message';
import moment from 'moment';

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
    <div className="table">
      <div className="table-content">
        {map(Object.keys(messages), key => {
          return (
            <a
              key={messages[key].id}
              onClick={evt => handleViewChange(messages[key], evt)}
            >
              <Message
                message={messages[key]}
                openedMessageId={openedMessageId}
              />
            </a>
          );
        })}
      </div>
    </div>
  );
};

MessageList.propTypes = propTypes;

export default MessageList;
