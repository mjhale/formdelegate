import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { reduxForm } from 'redux-form';
import { Link } from 'react-router-dom';
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
  dispatch: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  isAuthenticated: PropTypes.bool.isRequired,
  pristine: PropTypes.bool.isRequired,
  submitting: PropTypes.bool.isRequired,
};

class LoginContainer extends React.Component {
  render() {
    const {
      dispatch,
      fields,
      handleSubmit,
      isAuthenticated,
      onSubmit,
      pristine,
      submitting,
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
            onLogoutClick={(evt) => {
              evt.preventDefault();
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
