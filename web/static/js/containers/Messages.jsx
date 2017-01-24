import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { fetchMessages, fetchSearchMessages } from '../actions/messages';
import { getVisibleMessages } from '../selectors';
import MessageList from '../components/MessageList';
import SearchContainer from '../containers/Search';
import Pagination from '../components/Paginator';

const propTypes = {
  isFetching: PropTypes.bool.isRequired,
  loadMessages: PropTypes.func.isRequired,
  loadSearchResults: PropTypes.func.isRequired,
  messages: PropTypes.array.isRequired,
  onSearch: PropTypes.func.isRequired,
  pagination: PropTypes.shape({
    limit: PropTypes.number.isRequired,
    offset: PropTypes.number.isRequired,
    total: PropTypes.number.isRequired,
  }).isRequired,
  query: PropTypes.string,
};

class MessagesContainer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {openedMessageId: null};
  }

  componentDidMount() {
    const { loadMessages } = this.props;
    // start with the first page of results
    loadMessages(1);
  }

  handlePageChange = (requestedPage, evt) => {
    const { loadMessages, loadSearchResults, messages, search } = this.props;
    const { query } = search;

    evt.preventDefault();

    if (!query || 0 === query.length) {
      loadMessages(requestedPage);
    } else {
      loadSearchResults(query, requestedPage);
    }
  }

  handleViewChange = (message, evt) => {
    evt.preventDefault();

    this.setState((prevState, props) => ({
      openedMessageId: (prevState.openedMessageId !== message.id) ? message.id : null
    }));
  }

  render() {
    const { isFetching, messages, openedMessageId, pagination } = this.props;
    const { limit, offset, total } = pagination;

    return (
      <div className="messages">
        <ul className="actions">
          <li><SearchContainer {...this.props} /></li>
          <li>
            <Pagination
              handlePageChange={this.handlePageChange}
              limit={limit}
              offset={offset}
              total={total}
            />
          </li>
        </ul>
        <h1>My Messages</h1>
        <MessageList
          handleViewChange={this.handleViewChange}
          isFetching={isFetching}
          messages={messages}
          openedMessageId={this.state.openedMessageId}
        />
      </div>
    );
  }
}

MessagesContainer.propTypes = propTypes;

const mapStateToProps = (state) => {
  const messages = state.messages;

  return {
    isFetching: messages.isFetching,
    messages: getVisibleMessages(state),
    pagination: {
      limit: messages.pagination.limit,
      offset: messages.pagination.offset,
      total: messages.pagination.total,
    },
    search: {
      query: messages.search.query,
    },
  };
};

const mapDispatchToProps = (dispatch, ownProps) => ({
  loadMessages(requestedPage) {
    dispatch(fetchMessages(requestedPage));
  },

  loadSearchResults(query, requestedPage) {
    dispatch(fetchSearchMessages(query, requestedPage));
  },

  onSearch(values) {
    // start with the first page of results
    const requestedPage = 1;
    dispatch(fetchSearchMessages(values.search, requestedPage));
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(MessagesContainer);
