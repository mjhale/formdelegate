import React from 'react';
import moment from 'moment';

export const MessageList = ({ messages, isFetching }) => {
  if (isFetching) {
    return (
      <p>Loading messages...</p>
    );
  }

  return (
    <div>
      {messages.map((message) => (
        <div key={message.id} className="message card">
          <div className="sender">{message.sender}</div>
          <div className="timestamp">
            {moment(message.inserted_at).format('MMMM Do, YYYY, h:mm:ss a')}
          </div>
          <div className="content">{message.content}</div>
        </div>
      ))}
    </div>
  );
};
