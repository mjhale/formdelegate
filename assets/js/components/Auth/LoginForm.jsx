import React from 'react';
import PropTypes from 'prop-types';
import { Field } from 'redux-form';
import { Link } from 'react-router-dom';
import renderField from 'components/Field';

const propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  submitting: PropTypes.bool.isRequired,
  pristine: PropTypes.bool.isRequired,
};

const LoginForm = props => {
  const { handleSubmit, submitting, pristine } = props;

  return (
    <div className="login card">
      <form onSubmit={handleSubmit}>
        <Field
          component={renderField}
          name="email"
          label="E-Mail Address"
          type="text"
        />

        <Field
          component={renderField}
          name="password"
          label="Password"
          type="password"
        />
        <button className="btn" type="submit" disabled={submitting | pristine}>
          Login
        </button>
        <Link className="btn register" to="/register">
          Create New User
        </Link>
      </form>
    </div>
  );
};

LoginForm.propTypes = propTypes;

export default LoginForm;
