import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';

const propTypes = {
  message: PropTypes.shape({}),
  openedMessageId: PropTypes.number,
};

const Message = ({ message, openedMessageId }) => {
  const { content, form, inserted_at, sender, unknown_fields } = message;

  if (message.id !== openedMessageId) {
    return (
      <div className="table-row message flattened">
        <div className="table-cell sender">{sender}</div>
        <div className="table-cell message">{content}</div>
        <div className="table-cell form">{form.form}</div>
        <div className="table-cell date">
          {moment.utc(inserted_at).fromNow()}
        </div>
      </div>
    );
  } else {
    return (
      <div className="message expanded">
        <h1>{sender}</h1>
        <div className="date">{moment.utc(inserted_at).fromNow()}</div>
        <div className="message">{content}</div>
        {unknown_fields && (
          <div className="unknown-fields">
            <h2>Fields</h2>
            {Object.keys(unknown_fields).map((key, index) => {
              return (
                <div key={index} className="unknown-field">
                  {key}: {unknown_fields[key]}
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }
};

Message.propTypes = propTypes;

export default Message;
