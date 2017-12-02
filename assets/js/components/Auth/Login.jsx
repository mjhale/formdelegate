import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { reduxForm } from 'redux-form';
import { withRouter } from 'react-router-dom';
import { loginUser } from 'actions/sessions';
import Error from 'components/Error';
import LoginForm from 'components/Auth/LoginForm';

const validate = values => {
  const errors = {};

  if (!values.email) {
    errors.email = 'Required';
  }

  if (!values.password) {
    errors.password = 'Required';
  }

  return errors;
};

const propTypes = {
  dispatch: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  isAuthenticated: PropTypes.bool.isRequired,
  pristine: PropTypes.bool.isRequired,
  submitting: PropTypes.bool.isRequired,
};

let Login = props => {
  const {
    dispatch,
    errorMessage,
    fields,
    handleSubmit,
    isAuthenticated,
    onSubmit,
    pristine,
    submitting,
  } = props;

  if (!isAuthenticated) {
    return (
      <div>
        {errorMessage && <Error message={errorMessage} />}
        <LoginForm
          {...fields}
          pristine={pristine}
          submitting={submitting}
          handleSubmit={handleSubmit(onSubmit)}
        />
      </div>
    );
  }

  return null;
};

Login.propTypes = propTypes;

Login = reduxForm({
  form: 'loginForm',
  validate,
})(Login);

const mapStateToProps = state => {
  const { errorMessage, isAuthenticated } = state.authentication;

  return {
    errorMessage,
    isAuthenticated,
  };
};

const mapDispatchToProps = (dispatch, ownProps) => ({
  onSubmit(values) {
    dispatch(loginUser(values)).then(() => ownProps.history.push('/dashboard'));
  },
});

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Login));
