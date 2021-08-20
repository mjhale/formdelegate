import React from 'react';
import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';

import { createForm } from 'actions/forms';

import Form from 'components/Form';

const FormNew = props => {
  const dispatch = useDispatch();
  const history = useHistory();

  const handleFormSubmit = values => {
    dispatch(createForm(values)).then(() => history.push('/forms/'));
  };

  return (
    <React.Fragment>
      <h1>Add New Form</h1>
      <Form
        initialValues={{
          name: '',
          email_integrations: [],
        }}
        handleFormSubmit={handleFormSubmit}
      />
    </React.Fragment>
  );
};

export default FormNew;
