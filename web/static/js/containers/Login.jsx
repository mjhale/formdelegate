import React from 'react';
import { connect } from 'react-redux';
import { reduxForm } from 'redux-form';

import LoginForm from '../components/LoginForm';
import { loginAccount } from '../actions/sessions';

class LoginContainer extends React.Component {
  onSubmit(values, dispatch) {
    dispatch(loginAccount(values));
  }

  render() {
    const { handleSubmit } = this.props;

    return (
      <LoginForm
        {...this.props.fields}
        handleSubmit={handleSubmit(this.onSubmit)}
      />
    );
  }
}

const validate = (values) => {
  const errors = {};

  if (!values.username) {
    errors.username = 'Required';
  }

  if (!values.password) {
    errors.password = 'Required';
  }

  return errors;
};

LoginContainer = reduxForm({
  form: 'loginForm',
  validate,
})(LoginContainer);

const mapStateToProps = (state) => {
  const { authentication } = state;
  const { isAuthenticated } = authentication;

  return {
    isAuthenticated,
  };
};

export default connect(mapStateToProps)(LoginContainer);
