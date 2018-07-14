import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { Field } from 'redux-form';
import { reduxForm } from 'redux-form';
import { withRouter } from 'react-router-dom';

import { createUser } from 'actions/users';
import { loginUser } from 'actions/sessions';

import Button from 'components/Button';
import Card from 'components/Card';
import Flash from 'components/Flash';
import renderField from 'components/Field';

const validateForm = values => {
  const errors = {};

  if (!values.email) {
    errors.email = 'Required';
  }

  if (!values.name) {
    errors.name = 'Required';
  }

  if (!values.password) {
    errors.password = 'Required';
  }

  return errors;
};

class RegisterUser extends React.Component {
  static propTypes = {
    createUser: PropTypes.func.isRequired,
    handleSubmit: PropTypes.func.isRequired,
    history: PropTypes.shape({
      push: PropTypes.func.isRequired,
    }),
    loginUser: PropTypes.func.isRequired,
    registrationErrorMessage: PropTypes.string,
  };

  handleRegistrationAndLogin = credentials => {
    const { createUser, history, loginUser } = this.props;

    createUser(credentials)
      .then(() => loginUser(credentials))
      .then(() => history.push('/dashboard/'))
      .catch(error => console.log('error', error));
  };

  render() {
    const { handleSubmit, registrationErrorMessage, submitting } = this.props;

    return (
      <React.Fragment>
        {registrationErrorMessage && (
          <Flash type="error">{registrationErrorMessage}</Flash>
        )}

        <h2>Create New Account</h2>

        <Card>
          <form onSubmit={handleSubmit(this.handleRegistrationAndLogin)}>
            <Field
              name="email"
              component={renderField}
              type="text"
              label="E-mail Address"
            />
            <Field
              name="name"
              component={renderField}
              type="text"
              label="Full Name"
            />
            <Field
              name="password"
              component={renderField}
              type="password"
              label="Password"
            />
            <Button type="submit" disabled={submitting}>
              Create User
            </Button>
          </form>
        </Card>
      </React.Fragment>
    );
  }
}

RegisterUser = reduxForm({
  form: 'registerForm',
  validate: validateForm,
})(RegisterUser);

const mapStateToProps = state => ({
  registrationErrorMessage: state.users.errorMessage,
});

const mapDispatchToProps = {
  createUser,
  loginUser,
};

export default withRouter(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(RegisterUser)
);
