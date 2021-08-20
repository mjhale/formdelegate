import React from 'react';
import styled from 'styled-components/macro';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';

import theme from 'constants/theme';
import translations from 'translations';
import { loginUser } from 'actions/sessions';

import Card from 'components/Card';
import Flash from 'components/Flash';
import Link from 'components/Link';
import LoginForm from 'components/Auth/LoginForm';

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

const Login = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  const authError = useSelector(state => state.authentication.error);
  const isAuthenticated = useSelector(
    state => state.authentication.isAuthenticated
  );

  const handleLogin = (credentials, actions) => {
    dispatch(loginUser(credentials))
      .then(() => history.push('/dashboard'))
      .catch(error => {})
      .finally(() => {
        actions.setSubmitting(false);
      });
  };

  if (isAuthenticated) {
    return null;
  }

  return (
    <>
      <Card>
        <LogInContainer>
          <LogInHeader>Sign In</LogInHeader>
          {authError.type && (
            <Flash type="error">
              {translations[authError.type] || translations['UNKNOWN_ERROR']}
            </Flash>
          )}
          <LoginForm handleLogin={handleLogin} />
        </LogInContainer>
      </Card>
      <StyledSignUpWrapper>
        <span>Don't have an account? </span>
        <StyledSignUpLink href="/register">Sign up</StyledSignUpLink>
      </StyledSignUpWrapper>
    </>
  );
};
export default Login;
