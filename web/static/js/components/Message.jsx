import React, { PropTypes } from 'react';
import moment from 'moment';

const Message = ({ message }) => {
  const { sender, inserted_at, content, unknown_fields } = message;

  return (
    <div className="message">
      <h1>{sender}</h1>
      <div className="date">{moment.utc(inserted_at).fromNow()}</div>
      <div className="message">{content}</div>
      {unknown_fields &&
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
      }
    </div>
  );
};

Message.propTypes = {
  message: PropTypes.shape({}),
};

export default Message;
