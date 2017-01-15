import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { fetchMessages } from '../actions/messages';
import { getVisibleMessages } from '../selectors';
import { searchMessages } from '../actions/messages';
import MessageList from '../components/MessageList';
import SearchContainer from '../containers/Search';
import Pagination from '../components/Paginator';

const propTypes = {
  messages: PropTypes.array.isRequired,
  isFetching: PropTypes.bool.isRequired,
  searchText: PropTypes.string,
  pagination: PropTypes.shape({
    currentPage: PropTypes.number.isRequired,
    itemsPerPage: PropTypes.number.isRequired,
    totalItems: PropTypes.number.isRequired,
    totalPages: PropTypes.number.isRequired,
  }).isRequired,
};

class MessagesContainer extends React.Component {
  componentDidMount() {
    const { requestedPage, dispatch } = this.props;
    dispatch(fetchMessages(requestedPage));
  }

  render() {
    const { handlePageChange, isFetching, messages, pagination } = this.props;
    const { currentPage, itemsPerPage, totalItems, totalPages } = pagination;

    return (
      <div className="messages">
        <ul className="actions">
          <li><SearchContainer {...this.props} /></li>
          <li><a href="#" className="filter btn">Filter</a></li>
          <li>
            <Pagination
              currentPage={currentPage}
              handlePageChange={handlePageChange}
              itemsPerPage={itemsPerPage}
              totalItems={totalItems}
              totalPages={totalPages}
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
  const { messages } = state.messages;

  return {
    filteredItems: messages,
    isFetching: state.messages.isFetching,
    messages: getVisibleMessages(state),
    pagination: {
      currentPage: state.messages.pagination.currentPage,
      itemsPerPage: state.messages.pagination.itemsPerPage,
      totalItems: state.messages.pagination.totalItems,
      totalPages: state.messages.pagination.totalPages,
    }
  };
};

const mapDispatchToProps = (dispatch) => ({
  handlePageChange(evt, requestedPage) {
    evt.preventDefault();
    dispatch(fetchMessages(requestedPage));
  },

  onSearch(values) {
    dispatch(searchMessages(values.search));
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(MessagesContainer);
