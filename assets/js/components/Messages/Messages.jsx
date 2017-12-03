import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { fetchMessages, messageSearchFetch } from 'actions/messages';
import { getVisibleMessages } from 'selectors';
import { parse } from 'query-string';
import { withRouter } from 'react-router-dom';
import styled from 'styled-components';
import MessageList from 'components/Messages/MessageList';
import Search from 'components/Search';
import Pagination from 'components/Paginator';

const propTypes = {
  history: PropTypes.object.isRequired,
  isFetching: PropTypes.bool.isRequired,
  loadMessages: PropTypes.func.isRequired,
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

const Header = styled.div`
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
`;

const Heading = styled.h1`
  flex: 0 1 auto;
  margin: 0 1rem 0.5rem 0;
`;

const Actions = styled.ul`
  display: flex;
  flex: 0 0 auto;
  list-style-type: none;
  margin: 0 0 0.5rem 0;
  padding: 0;

  & li {
    flex: 1 1 auto;
  }

  & li:first-child {
    margin-right: 1rem;
  }
`;

const SearchContainer = styled.li`
  & input[name='search'] {
    line-height: 20px;
    margin: 0;
    max-width: 500px;
    padding: 6px 9px;
  }
`;

class MessagesContainer extends React.Component {
  constructor(props) {
    super(props);
    this.state = { openedMessageId: null };
  }

  componentDidMount() {
    const { loadMessages, loadSearchResults, location } = this.props;
    const query = parse(location.search);
    const startingPage = 1; /* the first page of paginated results */

    loadMessages(startingPage, query && query.search);
  }

  handlePageChange = (requestedPage, evt) => {
    const { loadMessages, loadSearchResults, location, messages } = this.props;
    const { query } = parse(location.search);

    evt.preventDefault();
    loadMessages(requestedPage, query && query.search);
  };

  handleSearch = values => {
    const { history, loadSearchResults } = this.props;
    const searchQuery = values.search;

    if (searchQuery) {
      history.push('?search=' + searchQuery);
    } else {
      history.push();
    }
  };

  handleViewChange = (message, evt) => {
    evt.preventDefault();
    this.setState((prevState, props) => ({
      openedMessageId:
        prevState.openedMessageId !== message.id ? message.id : null,
    }));
  };

  render() {
    const { isFetching, messages, openedMessageId, pagination } = this.props;
    const { limit, offset, total } = pagination;

    return (
      <div>
        <Header>
          <Heading>My Messages</Heading>
          <Actions>
            <SearchContainer>
              <Search {...this.props} handleSearch={this.handleSearch} />
            </SearchContainer>
            <li>
              <Pagination
                handlePageChange={this.handlePageChange}
                limit={limit}
                offset={offset}
                total={total}
              />
            </li>
          </Actions>
        </Header>
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

const mapStateToProps = state => {
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

const mapDispatchToProps = dispatch => ({
  loadMessages: (requestedPage, searchQuery) => {
    if (searchQuery) {
      dispatch(messageSearchFetch(searchQuery, requestedPage));
    } else {
      dispatch(fetchMessages(requestedPage));
    }
  },
});

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(MessagesContainer)
);
