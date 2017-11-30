import React from 'react';
import PropTypes from 'prop-types';
import { Field, reduxForm, propTypes as reduxFormPropTypes } from 'redux-form';

const propTypes = {
  ...reduxFormPropTypes,
};

const defaultProps = {};

const AdminUserForm = props => {
  const { error, handleSubmit, onSubmit, pristine, submitting, reset } = props;

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
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

AdminUserForm.propTypes = propTypes;
AdminUserForm.defaultProps = defaultProps;

export default AdminUserForm;
