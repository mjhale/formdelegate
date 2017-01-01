import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm, propTypes as reduxFormPropTypes } from 'redux-form';
import { searchMessages } from '../actions/messages';

const propTypes = {
  ...reduxFormPropTypes,
};

class MessageSearchContainer extends React.Component {
  render() {
    const { handleSubmit, error, pristine, submitting, reset, onSubmit } = this.props;

    return (
      <form onSubmit={handleSubmit(onSubmit)}>
        <Field
          name="search"
          className="search"
          component="input"
          type="text"
          placeholder="Search..."
        />
      </form>
    );
  }
};

MessageSearchContainer.propTypes = propTypes;

MessageSearchContainer = reduxForm({
  form: 'messagesSearchForm',
  enableReinitialize: true,
})(MessageSearchContainer);

const mapStateToProps = (state) => {
  const { searchText, messages } = state.messages;
  return {
    filteredItems: messages,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    onSubmit(values) {
      dispatch(searchMessages(values.search));
    }
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MessageSearchContainer);
