import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm, propTypes as reduxFormPropTypes } from 'redux-form';

const propTypes = {
  handleSearch: PropTypes.func.isRequired,
  ...reduxFormPropTypes,
};

class SearchContainer extends React.Component {
  render() {
    const { handleSearch, handleSubmit, error, pristine, submitting, reset } = this.props;

    return (
      <form onSubmit={handleSubmit(handleSearch)}>
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
