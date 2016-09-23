import React from 'react';
import { Field } from 'redux-form';

const LoginForm = (props) => {
  const { handleSubmit, submitting } = props;

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="username">Username</label>
        <Field name="username" component="input" type="text" placeholder="Username" />
      </div>

      <div>
        <label htmlFor="password">Password</label>
        <Field name="password" component="input" type="password" placeholder="Password" />
      </div>

      <div><button type="submit" disabled={submitting}>Login</button></div>
    </form>
  );
};

export default LoginForm;
