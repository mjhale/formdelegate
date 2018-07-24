import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import { fetchMessage } from 'actions/messages';
import { getMessage } from 'selectors';

import Message from 'components/Message/Message';

class MessageContainer extends React.Component {
  static propTypes = {
    fetchMessage: PropTypes.func.isRequired,
    match: PropTypes.shape({
      params: PropTypes.object.isRequired,
    }).isRequired,
    message: PropTypes.object,
  };

  componentDidMount() {
    const { fetchMessage, match } = this.props;

    fetchMessage(match.messageId);
  }

  render() {
    const { isFetching, message } = this.props;

    if (isFetching || !message) {
      return <p>Loading message...</p>;
    }

    return <Message message={message} />;
  }
}

const mapStateToProps = (state, ownProps) => ({
  message: getMessage(state, ownProps),
  isFetching: state.messages.isFetching,
});

const mapDispatchToProps = {
  fetchMessage,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MessageContainer);
