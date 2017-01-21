import React, { PropTypes } from 'react';
import moment from 'moment';
import { Link } from 'react-router';
import { map } from 'lodash';

const propTypes = {
  messages: PropTypes.array.isRequired,
  isFetching: PropTypes.bool.isRequired,
};

const MessageList = ({ messages, isFetching, ...props }) => {
  if (isFetching) {
    return (
      <p>Loading messages...</p>
    );
  }

  if (!isFetching && messages.length === 0) {
    return (
      <p>No messages found.</p>
    );  
  }

  return (
    <div>
      <div className="table">
        <div className="table-header table-row">
          <div className="table-cell sender">Sender</div>
          <div className="table-cell message">Message</div>
          <div className="table-cell form">Form</div>
          <div className="table-cell date">Received</div>
        </div>
        <div className="table-content">
          {Object.keys(messages).map((key) => {
            return (
              <Link key={messages[key].id} className="table-row" to={'/messages/' + messages[key].id}>
                <div className="table-cell sender">{messages[key].sender}</div>
                <div className="table-cell message">{messages[key].content}</div>
                <div className="table-cell form">#Form Name#</div>
                <div className="table-cell date">
                  {moment.utc(messages[key].inserted_at).fromNow()}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};

MessageList.propTypes = propTypes;

export default MessageList;
