import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { fetchMessage } from '../actions/messages';
import { getMessage } from '../selectors';
import Message from '../components/Message';

const propTypes = {
  message: PropTypes.object,
};

class MessageContainer extends React.Component {
  componentDidMount() {
    const { loadMessage, match } = this.props;
    const { messageId } = match.params;

    loadMessage(messageId);
  }

  render() {
    const { isFetching, message } = this.props;

    if (isFetching || !message) {
      return <p>Loading message...</p>;
    }

    return <Message message={message} />;
  }
}

MessageContainer.propTypes = propTypes;

const mapStateToProps = (state, ownProps) => {
  return {
    message: getMessage(state, ownProps),
    isFetching: state.messages.isFetching,
  };
};

const mapDispatchToProps = dispatch => ({
  loadMessage(messageId) {
    dispatch(fetchMessage(messageId));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(MessageContainer);
