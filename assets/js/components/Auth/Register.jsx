import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { createUser } from 'actions/users';
import { Field } from 'redux-form';
import { loginUser } from 'actions/sessions';
import { reduxForm, propTypes as reduxPropTypes } from 'redux-form';
import { withRouter } from 'react-router-dom';
import Button from 'components/Button';
import Card from 'components/Card';
import Error from 'components/Error';
import renderField from 'components/Field';

const propTypes = {
  ...reduxPropTypes,
  errorMessage: PropTypes.string,
  onSubmit: PropTypes.func.isRequired,
};

const validate = values => {
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

let RegisterUser = ({ handleSubmit, errorMessage, submitting }) => (
  <div>
    {errorMessage && <Error message={errorMessage} />}
    <h2>Register User</h2>
    <Card>
      <form onSubmit={handleSubmit}>
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
  </div>
);

RegisterUser.propTypes = propTypes;

RegisterUser = reduxForm({
  form: 'registerForm',
  validate,
})(RegisterUser);

const mapStateToProps = state => ({
  errorMessage: state.users.errorMessage,
});

const mapDispatchToProps = (dispatch, ownProps) => ({
  onSubmit(values) {
    return dispatch(createUser(values)).then(() =>
      dispatch(loginUser(values)).then(() =>
        ownProps.history.push('/dashboard/')
      )
    );
  },
});

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(RegisterUser)
);
