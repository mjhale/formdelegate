import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm, propTypes as reduxFormPropTypes } from 'redux-form';
import { parse } from 'query-string';

const propTypes = {
  handleSearch: PropTypes.func.isRequired,
  ...reduxFormPropTypes,
};

class SearchContainer extends React.Component {
  render() {
    const { handleSearch, handleSubmit, location } = this.props;
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
  }
};

SearchContainer.propTypes = propTypes;

SearchContainer = reduxForm({
  form: 'messagesSearchForm',
  enableReinitialize: true,
})(SearchContainer);

const mapStateToProps = (state, ownProps) => {
  const { location } = ownProps;
  const query = parse(location.search);

  return {
    initialValues: {
      search: query.search,
    },
  };
};


export default connect(mapStateToProps)(SearchContainer);
