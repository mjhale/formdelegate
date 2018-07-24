import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { reduxForm } from 'redux-form';
import { withRouter } from 'react-router-dom';

import { loginUser } from 'actions/sessions';

import Flash from 'components/Flash';
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

class Login extends React.Component {
  static propTypes = {
    authErrorMessage: PropTypes.string,
    handleSubmit: PropTypes.func.isRequired,
    history: PropTypes.shape({
      push: PropTypes.func.isRequired,
    }).isRequired,
    isAuthenticated: PropTypes.bool.isRequired,
    loginUser: PropTypes.func.isRequired,
    pristine: PropTypes.bool.isRequired,
    submitting: PropTypes.bool.isRequired,
  };

  handleLogin = credentials => {
    const { history, loginUser } = this.props;

    loginUser(credentials).then(() => history.push('/dashboard'));
  };

  render() {
    const {
      authErrorMessage,
      fields,
      handleSubmit,
      isAuthenticated,
      pristine,
      submitting,
    } = this.props;

    if (isAuthenticated) {
      return null;
    }

    return (
      <React.Fragment>
        {authErrorMessage && <Flash type="error">{authErrorMessage}</Flash>}
        <LoginForm
          {...fields}
          onSubmit={handleSubmit(this.handleLogin)}
          pristine={pristine}
          submitting={submitting}
        />
      </React.Fragment>
    );
  }
}

Login = reduxForm({
  form: 'loginForm',
  validate,
})(Login);

const mapStateToProps = state => ({
  authErrorMessage: state.authentication.errorMessage,
  isAuthenticated: state.authentication.isAuthenticated,
});

const mapDispatchToProps = {
  loginUser,
};

export default withRouter(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(Login)
);
