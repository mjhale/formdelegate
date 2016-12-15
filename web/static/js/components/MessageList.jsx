import React from 'react';
import moment from 'moment';

export const MessageList = ({ messages, isFetching }) => {
  if (isFetching) {
    return (
      <p>Loading messages...</p>
    );
  }

  return (
    <div className="table">
      <div className="table-header table-row">
        <div className="table-cell sender">Sender</div>
        <div className="table-cell message">Message</div>
        <div className="table-cell form">Form</div>
        <div className="table-cell date">Received</div>
      </div>
      <div className="table-content">
        {messages.map((message) => (
          <div key={message.id} className="table-row">
            <div className="table-cell sender">{message.sender}</div>
            <div className="table-cell message">{message.content}</div>
            <div className="table-cell form">#Form Name#</div>
            <div className="table-cell date">
              {moment.utc(message.inserted_at).fromNow()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
