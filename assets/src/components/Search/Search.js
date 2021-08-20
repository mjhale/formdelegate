import PropTypes from 'prop-types';
import * as React from 'react';
import { Formik, Form } from 'formik';
import { parse } from 'query-string';
import styled from 'styled-components/macro';
import { useLocation } from 'react-router-dom';
import * as Yup from 'yup';

import theme from 'constants/theme';

import Field from 'components/Field/FormikField';

const SearchField = styled(Field)`
  font-family: ${theme.primaryFont};
  font-size: 0.75rem;
`;

const Search = ({ handleSearch }) => {
  const { search: searchParam } = useLocation();

  const [query, setQuery] = React.useState(
    searchParam != null ? parse(searchParam).search : ''
  );

  React.useEffect(() => {
    if (searchParam != null) {
      setQuery(parse(searchParam).search);
    }
  }, [searchParam]);

  return (
    <React.Fragment>
      <Formik
        initialValues={{
          search: query,
        }}
        onSubmit={handleSearch}
        validationSchema={Yup.object({
          search: Yup.string(),
        })}
      >
        {() => (
          <Form>
            <SearchField
              name="search"
              component="input"
              type="text"
              placeholder="Search..."
            />
          </Form>
        )}
      </Formik>
    </React.Fragment>
  );
};

Search.propTypes = {
  handleSearch: PropTypes.func.isRequired,
};

export default Search;
