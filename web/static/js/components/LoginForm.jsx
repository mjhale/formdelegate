import React, { PropTypes } from 'react';
import { Field } from 'redux-form';
import { Link } from 'react-router-dom';
import renderField from '../components/Field.jsx';

const propTypes = {
  handleSubmit: React.PropTypes.func.isRequired,
  submitting: React.PropTypes.bool.isRequired,
  pristine: React.PropTypes.bool.isRequired,
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
          Create New Account
        </Link>
      </form>
    </div>
  );
};

LoginForm.propTypes = propTypes;

export default LoginForm;
