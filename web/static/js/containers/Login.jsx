import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { reduxForm } from 'redux-form';
import { Link } from 'react-router';
import { loginAccount, logoutAccount } from '../actions/sessions';
import LoginForm from '../components/LoginForm';
import Logout from '../components/Logout';

const validate = (values) => {
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
  handleSubmit: PropTypes.func.isRequired,
  submitting: PropTypes.bool.isRequired,
  pristine: PropTypes.bool.isRequired,
  dispatch: PropTypes.func.isRequired,
  isAuthenticated: PropTypes.bool.isRequired,
};

class LoginContainer extends React.Component {
  render() {
    const {
      dispatch,
      fields,
      handleSubmit,
      pristine,
      submitting,
      isAuthenticated,
      onSubmit
    } = this.props;

    if (!isAuthenticated) {
      return (
        <LoginForm
          {...fields}
          pristine={pristine}
          submitting={submitting}
          handleSubmit={handleSubmit(onSubmit)}
        />
      );
    } else {
      return (
        <div className="logout-prompt">
          You are currently logged in. Would you like to
          {' '}
          <Logout
            logoutText="logout"
            onLogoutClick={(e) => {
              e.preventDefault();
              dispatch(logoutAccount());
            }}
          />?
        </div>
      );
    }
  }
}

LoginContainer.propTypes = propTypes;

LoginContainer = reduxForm({
  form: 'loginForm',
  validate,
})(LoginContainer);

const mapStateToProps = (state) => {
  const { isAuthenticated } = state.authentication;

  return {
    isAuthenticated,
  };
};

export default connect(
  mapStateToProps,
  { onSubmit: loginAccount }
)(LoginContainer);
