import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { Field } from 'redux-form';
import { reduxForm } from 'redux-form';
import { withRouter } from 'react-router-dom';

import { createUser } from 'actions/users';
import { loginUser } from 'actions/sessions';

import Button from 'components/Button';
import Flash from 'components/Flash';
import renderField from 'components/Field';

const isValidEmail = email => {
  const regex = new RegExp(
    "[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?"
  );

  return regex.test(email);
};

const checkFormErrors = values => {
  let errors = {};

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

const checkFormWarnings = values => {
  let warnings = {};

  if (!isValidEmail(values.email)) {
    warnings.email = 'Warning: Your e-mail address appears invalid.';
  }

  return warnings;
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

        <h2>Create Your Free Account</h2>

        <form onSubmit={handleSubmit(this.handleRegistrationAndLogin)}>
          <Field
            component={renderField}
            label="Email"
            name="email"
            placeholder="Email"
            type="text"
          />
          <Field
            component={renderField}
            label="Full Name"
            name="name"
            placeholder="Full Name"
            type="text"
          />
          <Field
            component={renderField}
            label="Password"
            name="password"
            placeholder="Password"
            type="password"
          />
          <Button disabled={submitting} type="submit">
            Create User
          </Button>
        </form>
      </React.Fragment>
    );
  }
}

RegisterUser = reduxForm({
  form: 'registerForm',
  validate: checkFormErrors,
  warn: checkFormWarnings,
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
