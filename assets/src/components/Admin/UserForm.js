import React from 'react';
import { Field } from 'redux-form';

import Button from 'components/Button';
import renderField from 'components/Field';

const AdminUserForm = props => {
  const { error, onSubmit, pristine, submitting, reset } = props;

  return (
    <form onSubmit={onSubmit}>
      <h2>Edit User</h2>
      <Field
        component={renderField}
        label="Email"
        name="email"
        type="text"
        placeholder="Email"
      />
      <Field
        component={renderField}
        label="Full Name"
        name="name"
        type="text"
        placeholder="Full Name"
      />
      <Field
        component={renderField}
        label="Password"
        name="password"
        type="password"
        placeholder="Password"
      />

      {error && (
        <p>
          <strong>{error}</strong>
        </p>
      )}

      <div>
        <Button disabled={submitting} type="submit">
          Save Changes
        </Button>
      </div>
      <div>
        <Button disabled={pristine || submitting} onClick={reset} type="reset">
          Reset Changes
        </Button>
      </div>
    </form>
  );
};

export default AdminUserForm;
