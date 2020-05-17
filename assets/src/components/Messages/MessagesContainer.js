import PropTypes from 'prop-types';
import React from 'react';
import styled from 'styled-components/macro';
import { connect } from 'react-redux';
import { parse } from 'query-string';
import { withRouter } from 'react-router-dom';

import {
  addMessage,
  fetchMessages,
  markMessageAsHam,
  markMessageAsSpam,
  messageSearchFetch,
} from 'actions/messages';
import { getVisibleMessages } from 'selectors';
import { messageListener } from 'components/Messages/messageListener';

import ErrorBoundary from 'components/ErrorBoundary';
import Messages from 'components/Messages/Messages';
import MessagesToolbar from 'components/Messages/MessagesToolbar';

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

class MessagesContainer extends React.Component {
  constructor(props) {
    super(props);
    this.state = { selectedMessageList: new Set() };

    this.handleMarkAsSpam = this.handleMarkAsSpam.bind(this);
    this.handleSelectMessage = this.handleSelectMessage.bind(this);
  }

  componentDidMount() {
    const { addMessage, loadMessages, location } = this.props;
    const searchQuery = parse(location.search);
    const startingPage = 1;

    loadMessages(startingPage, searchQuery && searchQuery.search);
    messageListener(addMessage);
  }

  handleDeselectMessage = messageId => {
    this.setState((prevState, props) => {
      let selectedMessageList = new Set(prevState.selectedMessageList);
      selectedMessageList.delete(messageId);

      return { selectedMessageList: selectedMessageList };
    });
  };

  handleMarkAsHam = evt => {
    for (let messageId of this.state.selectedMessageList) {
      this.props.markMessageAsHam(messageId);
    }

    this.setState((prevState, props) => ({ selectedMessageList: new Set() }));
  };

  handleMarkAsSpam = evt => {
    for (let messageId of this.state.selectedMessageList) {
      this.props.markMessageAsSpam(messageId);
    }

    this.setState((prevState, props) => ({ selectedMessageList: new Set() }));
  };

  handleSelectMessage = messageId => {
    this.setState((prevState, props) => {
      let selectedMessageList = new Set(prevState.selectedMessageList);
      selectedMessageList.add(messageId);

      return { selectedMessageList: selectedMessageList };
    });
  };

  handleSelectMessageChange = evt => {
    const {
      checked: isChecked,
      dataset: { messageId },
    } = evt.target;

    if (isChecked) {
      this.handleSelectMessage(parseInt(messageId, 10));
    } else {
      this.handleDeselectMessage(parseInt(messageId, 10));
    }
  };

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

  render() {
    const {
      isFetching,
      location,
      messages,
      pagination: paginationMetaData,
    } = this.props;

    return (
      <React.Fragment>
        <Header>
          <Heading>My Messages</Heading>
          <MessagesToolbar
            handleMarkAsHam={this.handleMarkAsHam}
            handleMarkAsSpam={this.handleMarkAsSpam}
            handlePageChange={this.handlePageChange}
            handleSearch={this.handleSearch}
            location={location}
            paginationMetaData={paginationMetaData}
          />
        </Header>
        <ErrorBoundary>
          <Messages
            handleSelectMessageChange={this.handleSelectMessageChange}
            isFetching={isFetching}
            messages={messages}
            selectedMessageList={this.state.selectedMessageList}
          />
        </ErrorBoundary>
      </React.Fragment>
    );
  }
}

MessagesContainer.propTypes = {
  addMessage: PropTypes.func.isRequired,
  history: PropTypes.shape({
    push: PropTypes.func.isRequired,
  }).isRequired,
  isFetching: PropTypes.bool.isRequired,
  loadMessages: PropTypes.func.isRequired,
  location: PropTypes.shape({
    search: PropTypes.string,
  }).isRequired,
  messages: PropTypes.array.isRequired,
  query: PropTypes.string,
};

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
  addMessage: payload => {
    dispatch(addMessage(payload));
  },
  markMessageAsHam: messageId => {
    dispatch(markMessageAsHam(messageId));
  },
  markMessageAsSpam: messageId => {
    dispatch(markMessageAsSpam(messageId));
  },
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
