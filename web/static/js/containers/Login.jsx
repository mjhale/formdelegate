import React from 'react';
import { connect } from 'react-redux';
import { reduxForm } from 'redux-form';

import LoginForm from 'components/LoginForm';
import { signIn } from 'actions/sessions';

class LoginContainer extends React.Component {
  onSubmit(values, dispatch) {
    dispatch(signIn(values));
  }

  render() {
    return (
      <LoginForm
        {...this.props.fields}
        handleSubmit={this.props.handleSubmit(this.onSubmit)}
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
}

LoginContainer = reduxForm({
  form: 'loginForm',
  validate
})(LoginContainer);

const mapStateToProps = (state) => {
  return {}
}

export default connect(mapStateToProps)(LoginContainer);
