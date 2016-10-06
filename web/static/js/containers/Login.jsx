import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { reduxForm } from 'redux-form';
import { Link } from 'react-router';

import LoginForm from '../components/LoginForm';
import Logout from '../components/Logout';
import { loginAccount, logoutAccount } from '../actions/sessions';

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

const propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  submitting: PropTypes.bool.isRequired,
  pristine: PropTypes.bool.isRequired,
  dispatch: PropTypes.func.isRequired,
  isAuthenticated: PropTypes.bool.isRequired,
};

class LoginContainer extends React.Component {
  handleSubmit(values, dispatch) {
    dispatch(loginAccount(values));
  }

  render() {
    const {
      dispatch,
      fields,
      handleSubmit,
      pristine,
      submitting,
      isAuthenticated,
    } = this.props;

    if (!isAuthenticated) {
      return (
        <LoginForm
          {...fields}
          pristine={pristine}
          submitting={submitting}
          handleSubmit={handleSubmit(this.handleSubmit)}
        />
      );
    } else {
      return (
        <div className="logout-prompt">
          You are currently logged in. Would you like to&nbsp;
          <Logout
            logoutText="logout"
            onLogoutClick={() => dispatch(logoutAccount())}
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

export default connect(mapStateToProps)(LoginContainer);
