import React from 'react';
import { Field } from 'redux-form';

const AdminUserForm = props => {
  const { error, onSubmit, pristine, submitting, reset } = props;

  return (
    <form onSubmit={onSubmit}>
      <div>
        <label htmlFor="email">E-Mail</label>
        <Field
          name="email"
          component="input"
          type="text"
          placeholder="E-mail Address"
        />
      </div>

      <div>
        <label htmlFor="name">Full Name</label>
        <Field
          name="name"
          component="input"
          type="text"
          placeholder="Full Name"
        />
      </div>

      <div>
        <label htmlFor="password">Password</label>
        <Field
          name="password"
          component="input"
          type="password"
          placeholder="Password"
        />
      </div>

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
