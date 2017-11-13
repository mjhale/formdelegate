import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Field, reduxForm, propTypes as reduxFormPropTypes } from 'redux-form';
import { parse } from 'query-string';

const propTypes = {
  handleSearch: PropTypes.func.isRequired,
  ...reduxFormPropTypes,
};

let Search = ({ handleSearch, handleSubmit, location }) => {
  const { query } = parse(location.search);

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
};

Search.propTypes = propTypes;

Search = reduxForm({
  form: 'messagesSearchForm',
  enableReinitialize: true,
})(Search);

const mapStateToProps = (state, ownProps) => {
  const { location } = ownProps;
  const query = parse(location.search);

  return {
    initialValues: {
      search: query.search,
    },
  };
};

export default connect(mapStateToProps)(Search);
