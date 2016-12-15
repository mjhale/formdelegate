import React, { PropTypes } from 'react';
import { Field } from 'redux-form';
import { renderField } from '../components/Field.jsx';

const propTypes = {
  handleSubmit: React.PropTypes.func.isRequired,
  submitting: React.PropTypes.bool.isRequired,
  pristine: React.PropTypes.bool.isRequired,
};

const LoginForm = (props) => {
  const { handleSubmit, submitting, pristine } = props;

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="email">E-Mail</label>
        <Field
          name="email"
          component={renderField}
          type="text"
          placeholder="E-mail Address"
        />
      </div>

      <div>
        <label htmlFor="password">Password</label>
        <Field
          name="password"
          component={renderField}
          type="password"
          placeholder="Password"
        />
      </div>

      <div>
        <button type="submit" disabled={submitting | pristine}>Login</button>
      </div>
    </form>
  );
};

LoginForm.propTypes = propTypes;

export default LoginForm;
