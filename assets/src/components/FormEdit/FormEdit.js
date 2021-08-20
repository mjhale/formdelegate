import * as React from 'react';
import { denormalize } from 'normalizr';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory, useParams } from 'react-router-dom';

import { fetchForm, updateForm } from 'actions/forms';
import { formSchema } from 'schema';

import Form from 'components/Form';

const FormEdit = props => {
  const dispatch = useDispatch();
  const history = useHistory();
  const { formId } = useParams();

  const entities = useSelector(state => state.entities);
  const isFetching = useSelector(state => state.forms.isFetching);
  const denormalizedForm = entities.forms
    ? denormalize(formId, formSchema, entities)
    : null;

  const handleFormSubmit = values => {
    dispatch(updateForm(values)).then(() => history.push('/forms/'));
  };

  React.useEffect(() => {
    dispatch(fetchForm(formId));
  }, [dispatch, formId]);

  return (
    <React.Fragment>
      <h1>Edit Form</h1>

      <Form
        initialValues={denormalizedForm}
        isFetching={isFetching}
        handleFormSubmit={handleFormSubmit}
      />
    </React.Fragment>
  );
};

export default FormEdit;
