import React from 'react';
import { Field } from 'redux-form';

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
        <button type="submit" disabled={submitting}>
          Save Changes
        </button>
      </div>
      <div>
        <button type="reset" disabled={pristine || submitting} onClick={reset}>
          Reset Changes
        </button>
      </div>
    </form>
  );
};

export default AdminUserForm;
