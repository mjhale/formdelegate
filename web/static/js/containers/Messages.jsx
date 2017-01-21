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
  componentDidMount() {
    const { loadMessages } = this.props;
    // start with the first page of results
    loadMessages(1);
  }

  handlePageChange = (evt, requestedPage) => {
    const { loadMessages, loadSearchResults, messages, search } = this.props;
    const { query } = search;

    evt.preventDefault();

    if (!query || 0 === query.length) {
      loadMessages(requestedPage);
    } else {
      loadSearchResults(query, requestedPage);
    }
  }

  render() {
    const { isFetching, messages, pagination } = this.props;
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
        <MessageList messages={messages} isFetching={isFetching} />
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
