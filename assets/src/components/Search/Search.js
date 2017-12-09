import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Field, reduxForm, propTypes as reduxFormPropTypes } from 'redux-form';
import { parse } from 'query-string';
import styled from 'styled-components';
import theme from 'constants/theme';

const propTypes = {
  handleSearch: PropTypes.func.isRequired,
  ...reduxFormPropTypes,
};

const SearchField = styled(Field)`
  font-family: ${theme.primaryFont};
  font-size: 0.75rem;
`;

let Search = ({ handleSearch, handleSubmit, location }) => {
  return (
    <form onSubmit={handleSubmit(handleSearch)}>
      <SearchField
        name="search"
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
