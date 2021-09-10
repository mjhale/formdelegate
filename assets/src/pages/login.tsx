import React from 'react';
import styled from 'styled-components';
import { useRouter } from 'next/router';

import { isTokenCurrent } from 'utils';
import { loginUser } from 'actions/sessions';
import theme from 'constants/theme';
import translations from 'translations';
import { useAppDispatch, useAppSelector } from 'hooks/useRedux';
import useUser from 'hooks/useUser';

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

const LoginPage = () => {
  useUser({
    redirectTo: '/dashboard',
    redirectIfFound: true,
  });

  const dispatch = useAppDispatch();
  const router = useRouter();
  const authError = useAppSelector((state) => state.authentication.error);
  const isAuthenticated = useAppSelector(
    (state) => state.authentication.isAuthenticated
  );

  const handleLogin = (credentials, actions) => {
    dispatch(loginUser(credentials))
      .then(() => {
        actions.setSubmitting(false);
        router.push('/dashboard');
      })
      .catch(() => {
        actions.setSubmitting(false);
        return;
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

export async function getServerSideProps({ req }) {
  const accessToken = req.cookies?.access_token;
  const isTokenValid = isTokenCurrent(accessToken);

  if (isTokenValid) {
    return {
      redirect: {
        destination: '/dashboard',
        permanent: false,
      },
    };
  }

  return {
    props: {},
  };
}

export default LoginPage;
