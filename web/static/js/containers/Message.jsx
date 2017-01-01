import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { fetchMessage } from '../actions/message';
import { getMessage } from '../selectors';
import Message from '../components/Message';

const propTypes = {
  message: PropTypes.object,
};

class MessageContainer extends React.Component {
  componentDidMount() {
    const { dispatch, params } = this.props;
    const { messageId } = params;
    dispatch(fetchMessage(messageId));
  }

  render() {
    const { isFetching, message, params } = this.props;

    if (isFetching || !message) {
      return (
        <p>Loading message...</p>
      );
    }

    return (
      <Message message={message} />
    );
  }
};

MessageContainer.propTypes = propTypes;

const mapStateToProps = (state, ownProps) => {
  return {
    message: getMessage(state, ownProps),
    isFetching: state.messages.isFetching,
  };
};

export default connect(mapStateToProps)(MessageContainer);
