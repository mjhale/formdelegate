import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { fetchMessages } from '../actions/messages';
import { MessageList } from '../components/MessageList';

const propTypes = {
  messages: PropTypes.array.isRequired,
  isFetching: PropTypes.bool.isRequired,
};

class MessagesContainer extends React.Component {
  componentDidMount() {
    this.props.dispatch(fetchMessages());
  }

  render() {
    return (
      <div className="messages">
        <a href="#" className="filter btn">Filter</a>
        <h1>My Messages</h1>
        <MessageList {...this.props} />
      </div>
    );
  }
}

MessagesContainer.propTypes = propTypes;

const mapStateToProps = (state) => {
  return {
    messages: state.messages.messages,
    isFetching: state.messages.isFetching,
  };
};

export default connect(mapStateToProps)(MessagesContainer);
