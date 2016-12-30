import React, { PropTypes } from 'react';
import moment from 'moment';
import { connect } from 'react-redux';
import { find } from 'lodash';
import { fetchMessage } from '../actions/message';
import { getOrderedMessages } from '../selectors';

const propTypes = {
  dispatch: PropTypes.func.isRequired,
};

class MessageContainer extends React.Component {
  componentDidMount() {
    const { dispatch, params } = this.props;
    const { messageId } = params;
    dispatch(fetchMessage(messageId));
  }

  render() {
    const { isFetching, messages, params } = this.props;
    const { messageId } = params;

    /* @TODO: Move to proper location */
    const message = find(messages, function (object) { return object.id == messageId; });

    if (isFetching || !message) {
      return (
        <p>Loading message...</p>
      );
    }

    return (
      <div className="message">
        <h1>Message From {message.sender}</h1>
        <div className="date">{moment.utc(message.inserted_at).fromNow()}</div>
        <div className="mesage">{message.content}</div>
        <div className="unknown-fields">
          {/* @TODO: Fix null errors on unknown_fields */}
          {Object.keys(message.unknown_fields).map((key, index) => {
            return (
              <div key={index} className="unknown-field">
                {key}: {message.unknown_fields[key]}
              </div>
            );
          })}
        </div>
      </div>
    );
  }
};

MessageContainer.propTypes = propTypes;

const mapStateToProps = (state, ownProps) => {
  return {
    messages: getOrderedMessages(state),
    isFetching: state.messages.isFetching,
  };
};

export default connect(mapStateToProps)(MessageContainer);
