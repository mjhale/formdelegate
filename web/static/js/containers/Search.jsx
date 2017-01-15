import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm, propTypes as reduxFormPropTypes } from 'redux-form';

const propTypes = {
  ...reduxFormPropTypes,
};

class SearchContainer extends React.Component {
  render() {
    const { handleSubmit, error, pristine, submitting, reset, onSearch } = this.props;

    return (
      <form onSubmit={handleSubmit(onSearch)}>
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

SearchContainer.propTypes = propTypes;

SearchContainer = reduxForm({
  form: 'messagesSearchForm',
  enableReinitialize: true,
})(SearchContainer);

export default SearchContainer;
