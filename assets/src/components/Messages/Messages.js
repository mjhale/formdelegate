import PropTypes from 'prop-types';
import React from 'react';
import styled from 'styled-components/macro';
import { connect } from 'react-redux';
import { parse } from 'query-string';
import { withRouter } from 'react-router-dom';

import { fetchMessages, messageSearchFetch } from 'actions/messages';
import { getVisibleMessages } from 'selectors';
import { media } from 'utils/style';

import ErrorBoundary from 'components/ErrorBoundary';
import MessageList from 'components/Messages/MessageList';
import Search from 'components/Search';
import Pagination from 'components/Paginator';

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
  flex: 1 1 auto;
  justify-content: space-between;
  list-style-type: none;
  margin: 0 0 0.5rem 0;
  padding: 0;
  width: 100%;

  ${media.md`
      flex: 0 0 auto;
      justify-content: normal;
      width: auto;
  `};
`;

const PaginationContainer = styled.li`
  flex: 0 1 auto;
`;

const SearchContainer = styled.li`
  flex: 1 1 auto;
  margin-right: 1rem;

  & input[name='search'] {
    line-height: 20px;
    margin: 0;
    max-width: 500px;
    padding: 6px 9px;
  }
`;

class MessagesContainer extends React.Component {
  static propTypes = {
    history: PropTypes.shape({
      push: PropTypes.func.isRequired,
    }).isRequired,
    isFetching: PropTypes.bool.isRequired,
    loadMessages: PropTypes.func.isRequired,
    location: PropTypes.shape({
      search: PropTypes.string,
    }).isRequired,
    messages: PropTypes.array.isRequired,
    pagination: PropTypes.shape({
      limit: PropTypes.number.isRequired,
      offset: PropTypes.number.isRequired,
      total: PropTypes.number.isRequired,
    }).isRequired,
    query: PropTypes.string,
  };

  state = { openedMessageId: null };

  componentDidMount() {
    const { loadMessages, location } = this.props;
    const query = parse(location.search);
    const startingPage = 1; /* the first page of paginated results */

    loadMessages(startingPage, query && query.search);
  }

  handlePageChange = (requestedPage, evt) => {
    const { loadMessages, location } = this.props;
    const searchParam = parse(location.search);

    evt.preventDefault();
    loadMessages(requestedPage, searchParam && searchParam.search);
  };

  handleSearch = values => {
    const { history } = this.props;
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
    const { isFetching, messages, pagination } = this.props;
    const { limit, offset, total } = pagination;

    return (
      <React.Fragment>
        <Header>
          <Heading>My Messages</Heading>
          <Actions>
            <SearchContainer>
              <Search {...this.props} handleSearch={this.handleSearch} />
            </SearchContainer>
            {total > 0 && (
              <PaginationContainer>
                <Pagination
                  handlePageChange={this.handlePageChange}
                  limit={limit}
                  offset={offset}
                  total={total}
                />
              </PaginationContainer>
            )}
          </Actions>
        </Header>
        <ErrorBoundary>
          <MessageList
            handleViewChange={this.handleViewChange}
            isFetching={isFetching}
            messages={messages}
            openedMessageId={this.state.openedMessageId}
          />
        </ErrorBoundary>
      </React.Fragment>
    );
  }
}

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
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(MessagesContainer)
);
