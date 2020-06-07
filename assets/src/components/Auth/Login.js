import PropTypes from 'prop-types';
import React from 'react';
import styled from 'styled-components/macro';
import { connect } from 'react-redux';
import { reduxForm } from 'redux-form';
import { withRouter } from 'react-router-dom';

import theme from 'constants/theme';
import { loginUser } from 'actions/sessions';

import Card from 'components/Card';
import Flash from 'components/Flash';
import Link from 'components/Link';
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

const LogInContainer = styled.div`
  padding: 5% 15%;
`;

const LogInHeader = styled.h1`
  font-size: 1.75rem;
  font-weight: 300;
  margin: 0 0 2rem 0;
  text-align: center;
`;

const StyledSignUpLink = styled(Link)`
  color: ${theme.primaryColor};
`;

const StyledSignUpWrapper = styled.div`
  color: ${theme.mineBlack};
  font-size: 0.9rem;
  text-align: center;
`;

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
      <>
        <Card>
          <LogInContainer>
            <LogInHeader>Sign In</LogInHeader>
            {authErrorMessage && <Flash type="error">{authErrorMessage}</Flash>}
            <LoginForm
              {...fields}
              onSubmit={handleSubmit(this.handleLogin)}
              pristine={pristine}
              submitting={submitting}
            />
          </LogInContainer>
        </Card>
        <StyledSignUpWrapper>
          <span>Don't have an account? </span>
          <StyledSignUpLink href="/register">Sign up</StyledSignUpLink>
        </StyledSignUpWrapper>
      </>
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

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Login));
