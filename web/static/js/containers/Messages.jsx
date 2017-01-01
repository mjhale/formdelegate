import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { fetchMessages } from '../actions/messages';
import { getVisibleMessages } from '../selectors';
import MessageList from '../components/MessageList';
import MessageSearchContainer from '../containers/MessageSearch';

const propTypes = {
  messages: PropTypes.array.isRequired,
  isFetching: PropTypes.bool.isRequired,
  searchText: PropTypes.string,
};

class MessagesContainer extends React.Component {
  componentDidMount() {
    this.props.dispatch(fetchMessages());
  }

  render() {
    const { isFetching, messages } = this.props;

    return (
      <div className="messages">
        <ul className="actions">
          <li><a href="#" className="filter btn">Filter</a></li>
          <li><MessageSearchContainer {...this.props} /></li>
        </ul>
        <h1>My Messages</h1>
        <MessageList messages={messages} isFetching={isFetching} />
      </div>
    );
  }
}

MessagesContainer.propTypes = propTypes;

const mapStateToProps = (state) => {
  return {
    messages: getVisibleMessages(state),
    isFetching: state.messages.isFetching,
  };
};

export default connect(mapStateToProps)(MessagesContainer);
