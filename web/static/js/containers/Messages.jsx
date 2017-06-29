import React, { PropTypes } from 'react';

import { connect } from 'react-redux';
import { fetchMessages, messageSearchFetch } from '../actions/messages';
import { getVisibleMessages } from '../selectors';
import { parse } from 'query-string';
import { withRouter } from 'react-router-dom';
import MessageList from '../components/MessageList';
import SearchContainer from '../containers/Search';
import Pagination from '../components/Paginator';

const propTypes = {
  history: PropTypes.object.isRequired,
  isFetching: PropTypes.bool.isRequired,
  loadMessages: PropTypes.func.isRequired,
  loadSearchResults: PropTypes.func.isRequired,
  location: PropTypes.object.isRequired,
  match: PropTypes.object.isRequired,
  messages: PropTypes.array.isRequired,
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
    this.state = { openedMessageId: null };
  }

  componentDidMount() {
    const { loadMessages, loadSearchResults, location } = this.props;
    const query = parse(location.search);
    const startingPage = 1; /* the first page of paginated results */

    if (query) {
      loadSearchResults(query.search, startingPage);
    } else {
      loadMessages(startingPage);
    }
  }

  handlePageChange = (requestedPage, evt) => {
    const { loadMessages, loadSearchResults, location, messages } = this.props;
    const { query } = parse(location.search);

    evt.preventDefault();

    if (!query || 0 === query.length) {
      loadMessages(requestedPage);
    } else {
      loadSearchResults(query, requestedPage);
    }
  }

  handleSearch = (values) => {
    const { history, loadSearchResults } = this.props;
    const searchQuery = values.search;

    if (searchQuery) {
      history.push('?search=' + searchQuery);
    } else {
      history.push();
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
          <li>
            <SearchContainer
              {...this.props}
              handleSearch={this.handleSearch}
            />
          </li>
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
  };
};

const mapDispatchToProps = (dispatch, ownProps) => ({
  loadMessages(requestedPage) {
    dispatch(fetchMessages(requestedPage));
  },

  loadSearchResults(query, requestedPage) {
    dispatch(messageSearchFetch(query, requestedPage));
  }
});

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(MessagesContainer));
