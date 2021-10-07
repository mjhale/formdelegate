import PropTypes from 'prop-types';
import * as React from 'react';
import { Formik, Form } from 'formik';
import { useRouter } from 'next/router';
import * as Yup from 'yup';

import Field from 'components/Field/FormikField';

const Search = ({ handleSearch }) => {
  const router = useRouter();
  const { search: searchParam } = router.query;

  const [query, setQuery] = React.useState(
    searchParam != null ? searchParam : ''
  );

  React.useEffect(() => {
    if (searchParam != null) {
      setQuery(searchParam);
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
            <Field
              component="input"
              name="search"
              placeholder="Search..."
              size="sm"
              type="text"
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
